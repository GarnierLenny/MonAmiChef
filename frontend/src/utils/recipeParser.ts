import { RecipeContent, RecipeNutrition, ParsedRecipe } from '../types/recipe';

/**
 * Simple check to see if text looks like a recipe (for showing save button)
 */
export function looksLikeRecipe(text: string): boolean {
  // Check for recipe keywords
  const hasRecipeKeywords = /\b(ingredients?|instructions?|steps?|recipe|cook|cooking|preparation|directions|method|how to make|what you.?ll need)\b/i.test(text);
  
  // Check for list patterns (common in recipes)
  const hasListPattern = /^\s*[-*•]\s+.+/m.test(text) || /^\s*\d+\.\s+.+/m.test(text);
  
  // Check for measurement patterns (common in recipes)
  const hasMeasurements = /\b\d+\s*(cups?|tablespoons?|teaspoons?|tbsp|tsp|oz|ounces?|pounds?|lbs?|grams?|g|ml|liters?|minutes?|mins?|hours?|hrs?)\b/i.test(text);
  
  // Check for cooking terms
  const hasCookingTerms = /\b(bake|fry|sauté|simmer|boil|mix|stir|chop|dice|slice|season|garnish|serve|heat|oven|pan|pot)\b/i.test(text);
  
  // If it has recipe keywords AND (lists OR measurements OR cooking terms), it's likely a recipe
  return hasRecipeKeywords && (hasListPattern || hasMeasurements || hasCookingTerms);
}

/**
 * Parse AI response text to extract recipe information
 */
export function parseRecipeFromText(text: string): ParsedRecipe | null {
  // Use the simpler check first
  if (!looksLikeRecipe(text)) {
    return null;
  }

  // Extract title - look for markdown heading or first line
  const titleMatch = text.match(/^#\s+(.+)$/m) || text.match(/^\*\*(.+)\*\*$/m);
  const title = titleMatch ? titleMatch[1].trim() : extractTitleFromContent(text);

  // Extract ingredients
  const ingredients = extractIngredients(text);
  
  // Extract instructions
  const instructions = extractInstructions(text);
  
  // Extract tips/variations
  const tips = extractTips(text);

  // Extract servings
  const servings = extractServings(text);

  // Extract times
  const { prepTime, cookTime, totalTime } = extractTimes(text);

  // Extract nutrition info
  const nutrition = extractNutrition(text);

  // Generate tags based on content
  const tags = generateTags(text);

  return {
    title,
    content: {
      title,
      ingredients,
      instructions,
      tips,
      servings,
      prepTime,
      cookTime,
      totalTime,
    },
    nutrition,
    tags,
  };
}

function extractTitleFromContent(text: string): string {
  // Look for recipe name patterns
  const patterns = [
    /(?:recipe for|making|how to make)\s+(.+?)(?:\n|$)/i,
    /^(.+?)\s*recipe/im,
    /\*\*(.+?)\*\*/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // Fallback: use first meaningful line
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  return lines[0]?.substring(0, 50) || 'Recipe';
}

function extractIngredients(text: string): string[] {
  const ingredients: string[] = [];
  
  // Look for ingredients section with multiple formats
  const patterns = [
    /\*\*ingredients?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is, // **Ingredients**
    /ingredients?:?\s*\n(.*?)(?=\n\s*\n|\*\*\w|instructions?|directions|steps?|method|$)/is, // Ingredients:
    /(ingredients?|what you.?ll need|shopping list)[\s\:]*\n(.*?)(?=\n\s*\n|\*\*\w|instructions?|directions|steps?|method|$)/is, // Various headers
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const ingredientsText = match[match.length - 1]; // Get the last capture group
      const lines = ingredientsText.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[\-\*•]\s+(.+)/) || trimmed.match(/^\d+\.\s+(.+)/)) {
          const ingredient = trimmed.replace(/^[\-\*•\d\.]\s*/, '').trim();
          if (ingredient.length > 0) {
            ingredients.push(ingredient);
          }
        }
      }
      
      if (ingredients.length > 0) break; // Found ingredients, no need to try other patterns
    }
  }

  return ingredients;
}

function extractInstructions(text: string): string[] {
  const instructions: string[] = [];
  
  // Look for instructions section with multiple formats
  const patterns = [
    /\*\*instructions?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is, // **Instructions**
    /(instructions?|directions|steps?|method|preparation|how to)[\s\:]*\n(.*?)(?=\n\s*\n|\*\*\w|tips?|notes?|nutrition|$)/is, // Various headers
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const instructionsText = match[match.length - 1]; // Get the last capture group
      const lines = instructionsText.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+(.+)/) || trimmed.match(/^[\-\*•]\s+(.+)/)) {
          const instruction = trimmed.replace(/^[\d\.\-\*•]\s*/, '').trim();
          if (instruction.length > 0) {
            instructions.push(instruction);
          }
        }
      }
      
      if (instructions.length > 0) break; // Found instructions, no need to try other patterns
    }
  }

  return instructions;
}

function extractTips(text: string): string[] {
  const tips: string[] = [];
  
  // Look for tips/variations section
  const tipsMatch = text.match(/\*\*(tips?|variations?|notes?)\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is);
  if (tipsMatch) {
    const tipsText = tipsMatch[2];
    const lines = tipsText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[\-\*•]\s+(.+)/) || trimmed.match(/^\d+\.\s+(.+)/)) {
        const tip = trimmed.replace(/^[\-\*•\d\.]\s*/, '').trim();
        if (tip.length > 0) {
          tips.push(tip);
        }
      }
    }
  }

  return tips;
}

function extractServings(text: string): number | undefined {
  const servingsMatch = text.match(/servings?:?\s*(\d+)/i) || text.match(/serves?\s+(\d+)/i);
  return servingsMatch ? parseInt(servingsMatch[1]) : undefined;
}

function extractTimes(text: string): { prepTime?: string; cookTime?: string; totalTime?: string } {
  const prepMatch = text.match(/prep(?:aration)?\s*time:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i);
  const cookMatch = text.match(/cook(?:ing)?\s*time:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i);
  const totalMatch = text.match(/total\s*time:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i);

  return {
    prepTime: prepMatch?.[1],
    cookTime: cookMatch?.[1],
    totalTime: totalMatch?.[1],
  };
}

function extractNutrition(text: string): RecipeNutrition | undefined {
  const nutritionMatch = text.match(/\*\*nutrition.*?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is);
  if (!nutritionMatch) return undefined;

  const nutritionText = nutritionMatch[1];
  const nutrition: RecipeNutrition = {};

  const patterns = {
    calories: /(\d+)\s*(?:kcal|cal|calories?)/i,
    protein: /(\d+)g?\s*protein/i,
    carbs: /(\d+)g?\s*carb?s?/i,
    fat: /(\d+)g?\s*fat/i,
    fiber: /(\d+)g?\s*fiber/i,
    sugar: /(\d+)g?\s*sugar/i,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = nutritionText.match(pattern);
    if (match) {
      nutrition[key as keyof RecipeNutrition] = parseInt(match[1]);
    }
  }

  return Object.keys(nutrition).length > 0 ? nutrition : undefined;
}

function generateTags(text: string): string[] {
  const tags: string[] = [];
  
  // Cuisine detection
  const cuisines = ['italian', 'chinese', 'mexican', 'indian', 'french', 'thai', 'japanese', 'mediterranean', 'american'];
  for (const cuisine of cuisines) {
    if (new RegExp(cuisine, 'i').test(text)) {
      tags.push(cuisine);
    }
  }

  // Meal type detection
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer'];
  for (const mealType of mealTypes) {
    if (new RegExp(mealType, 'i').test(text)) {
      tags.push(mealType);
    }
  }

  // Dietary restrictions
  const dietary = ['vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 'dairy-free'];
  for (const diet of dietary) {
    if (new RegExp(diet.replace('-', '[-\\s]?'), 'i').test(text)) {
      tags.push(diet);
    }
  }

  // Cooking methods
  const methods = ['baked', 'grilled', 'fried', 'steamed', 'roasted', 'sautéed'];
  for (const method of methods) {
    if (new RegExp(method, 'i').test(text)) {
      tags.push(method);
    }
  }

  return [...new Set(tags)]; // Remove duplicates
}