import { RecipeContent, RecipeNutrition } from "../types/RecipeTypes";

export interface ParsedRecipe {
  title: string;
  content: RecipeContent;
  nutrition?: RecipeNutrition;
  tags: string[];
}

export interface ParsedRecipeForDB {
  title: string;
  content_json: RecipeContent;
  nutrition?: RecipeNutrition;
  tags: string[];
}

/**
 * Parse AI response text to extract recipe information
 */
export function parseRecipeFromText(text: string): ParsedRecipe | null {
  // Check if the text contains recipe-like content (more lenient)
  const hasRecipeIndicators = /\b(ingredients?|instructions?|steps?|recipe|cook|preparation|ingredients list|make|directions|method|serves?|serving|cal|calories|protein|carb|fat)\b/i.test(text);
  if (!hasRecipeIndicators) {
    return null;
  }

  // Extract title - look for various patterns
  let title = '';

  // Try multiple title patterns
  const titlePatterns = [
    /^#\s+(.+)$/m,                           // # Title
    /^\*\*(.+)\*\*$/m,                       // **Title**
    /^##?\s*(.+)$/m,                         // ## Title or # Title
    /(?:^|\n)\s*\*\*([^*]+)\*\*(?:\s*\n|$)/m, // **Title** anywhere
    /Recipe:\s*(.+?)(?:\n|$)/i,              // Recipe: Title
    /^(.+)\s+Recipe/im,                      // Title Recipe
    /(.+?)\s*(?:\n|$)/                       // First line fallback
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim()) {
      title = match[1].trim();
      // Clean up common title artifacts
      title = title.replace(/^(Recipe:?\s*|Cook:?\s*|Make:?\s*)/i, '');
      title = title.replace(/\s+Recipe\s*$/i, '');
      if (title.length > 3 && title.length < 100) { // Reasonable title length
        break;
      }
    }
  }

  // Final fallback
  if (!title) {
    title = extractTitleFromContent(text);
  }

  // Extract ingredients
  const ingredients = extractIngredients(text);
  
  // Extract instructions
  const instructions = extractInstructions(text);
  
  // If we don't have basic recipe components, still try to create a recipe with the title
  if (ingredients.length === 0 && instructions.length === 0) {
    console.warn('Recipe parsing: No ingredients or instructions found, but title exists:', title);
    // Don't return null - create a minimal recipe structure
  }

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
  
  // Look for ingredients section
  const ingredientsMatch = text.match(/\*\*ingredients?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is);
  if (ingredientsMatch) {
    const ingredientsText = ingredientsMatch[1];
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
  }

  return ingredients;
}

function extractInstructions(text: string): string[] {
  const instructions: string[] = [];
  
  // Look for instructions section
  const instructionsMatch = text.match(/\*\*instructions?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is);
  if (instructionsMatch) {
    const instructionsText = instructionsMatch[1];
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

/**
 * Parse AI response text to extract recipe information for database storage
 */
export function parseRecipeFromAI(text: string): ParsedRecipeForDB {
  console.log('Parsing AI recipe text:', text.substring(0, 200) + '...');

  const parsed = parseRecipeFromText(text);

  if (!parsed) {
    // Try to extract at least a title from the first line or fall back to a better default
    const firstLine = text.split('\n')[0]?.trim();
    const fallbackTitle = firstLine && firstLine.length > 3 && firstLine.length < 100
      ? firstLine.replace(/^[#*\s]+/, '').replace(/[#*\s]+$/, '')
      : 'Delicious Recipe';

    console.warn('Recipe parsing failed, using fallback title:', fallbackTitle);

    return {
      title: fallbackTitle,
      content_json: {
        title: fallbackTitle,
        ingredients: ['Recipe parsing failed - please regenerate'],
        instructions: ['Please try generating again'],
      },
      tags: ['ai-generated'],
    };
  }

  console.log('Successfully parsed recipe:', parsed.title);
  return {
    title: parsed.title,
    content_json: parsed.content,
    nutrition: parsed.nutrition,
    tags: parsed.tags,
  };
}