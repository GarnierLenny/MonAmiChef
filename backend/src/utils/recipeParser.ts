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

  console.log('=== EXTRACTING INGREDIENTS ===');

  // More flexible patterns for ingredients section
  const ingredientsMatch = text.match(/###\s*ingredients?\s*\n(.*?)(?=###|$)/is) ||
                          text.match(/\*\*ingredients?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is) ||
                          text.match(/ingredients?:?(.*?)(?=\n\n|\*\*\w|instructions?|directions?|method|steps)/is);

  console.log('Ingredients section found:', !!ingredientsMatch);

  if (ingredientsMatch) {
    const ingredientsText = ingredientsMatch[1];
    console.log('Ingredients text:', ingredientsText);
    const lines = ingredientsText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // More flexible patterns for ingredient lines
      if (trimmed.match(/^[\-\*•]\s+(.+)/) ||
          trimmed.match(/^\d+\.\s+(.+)/) ||
          trimmed.match(/^[•]\s+(.+)/) ||
          (trimmed.length > 3 && !trimmed.match(/^\*\*/) && trimmed.includes(' '))) {

        let ingredient = trimmed.replace(/^[\-\*•\d\.]\s*/, '').trim();
        // Skip lines that look like headers or are too short
        if (ingredient.length > 2 &&
            !ingredient.match(/^(ingredients?|instructions?|directions?|method|steps|tips?|variations?)/i)) {
          ingredients.push(ingredient);
          console.log('Extracted ingredient:', ingredient);
        }
      }
    }
  }

  console.log('Total ingredients extracted:', ingredients.length);
  return ingredients;
}

function extractInstructions(text: string): string[] {
  const instructions: string[] = [];

  console.log('=== EXTRACTING INSTRUCTIONS ===');

  // More flexible patterns for instructions section
  const instructionsMatch = text.match(/###\s*instructions?\s*\n(.*?)(?=###|$)/is) ||
                           text.match(/\*\*instructions?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is) ||
                           text.match(/instructions?:?(.*?)(?=\n\n|\*\*\w|tips?|variations?|nutrition)/is) ||
                           text.match(/\*\*directions?\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is) ||
                           text.match(/\*\*method\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is) ||
                           text.match(/\*\*steps\*\*:?(.*?)(?=\*\*\w|\n\n|$)/is);

  console.log('Instructions section found:', !!instructionsMatch);

  if (instructionsMatch) {
    const instructionsText = instructionsMatch[1];
    console.log('Instructions text:', instructionsText);
    const lines = instructionsText.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // More flexible patterns for instruction lines
      if (trimmed.match(/^\d+\.\s+(.+)/) ||
          trimmed.match(/^[\-\*•]\s+(.+)/) ||
          trimmed.match(/^step\s*\d+:?\s*(.+)/i) ||
          (trimmed.length > 5 && !trimmed.match(/^\*\*/) && !trimmed.match(/^(instructions?|directions?|method|steps|tips?|variations?|nutrition)/i))) {

        let instruction = trimmed.replace(/^[\d\.\-\*•]\s*/, '').replace(/^step\s*\d+:?\s*/i, '').trim();
        // Skip lines that look like headers or are too short
        if (instruction.length > 3 &&
            !instruction.match(/^(instructions?|directions?|method|steps|tips?|variations?|nutrition)/i)) {
          instructions.push(instruction);
          console.log('Extracted instruction:', instruction);
        }
      }
    }
  }

  console.log('Total instructions extracted:', instructions.length);
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
  // More precise patterns that avoid nutrition calculation numbers
  const servingsMatch = text.match(/(?:^|\n)\s*(?:servings?|serves?):\s*(\d+)/im) ||
                       text.match(/(?:^|\n)\s*(?:serves?|for)\s+(\d+)\s+(?:people|persons?|servings?)/im) ||
                       text.match(/(?:^|\n)\s*yield:\s*(\d+)/im);

  if (servingsMatch) {
    const servings = parseInt(servingsMatch[1]);
    // Hard constraint: meal planning should always be 1 serving
    // If AI generates more than 1, force it to 1
    if (servings > 1) {
      console.warn(`AI generated ${servings} servings, forcing to 1 for meal planning`);
      return 1;
    }
    return servings;
  }

  // Default to 1 serving for meal planning
  return 1;
}

function extractTimes(text: string): { prepTime?: string; cookTime?: string; totalTime?: string } {
  // More flexible patterns for time extraction
  const prepMatch = text.match(/prep(?:aration)?\s*time:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i) ||
                   text.match(/prep:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i);

  const cookMatch = text.match(/cook(?:ing)?\s*time:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i) ||
                   text.match(/cook:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i) ||
                   text.match(/bake:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i);

  const totalMatch = text.match(/total\s*time:?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i) ||
                    text.match(/(?:ready\s+in|takes):?\s*(\d+\s*(?:min|minutes?|hrs?|hours?))/i);

  return {
    prepTime: prepMatch?.[1],
    cookTime: cookMatch?.[1],
    totalTime: totalMatch?.[1],
  };
}

function extractNutrition(text: string): RecipeNutrition | undefined {
  console.log('=== EXTRACTING NUTRITION ===');

  // More flexible pattern to match various nutrition section formats, including calculation breakdowns
  const nutritionMatch = text.match(/###\s*nutrition(?:\s*\([^)]*\))?\s*\n(.*?)(?=###|$)/is) ||
                        text.match(/\*\*nutrition(?:\s*\([^)]*\))?\*\*:?(.*?)(?=\*\*\w|\n\s*\n|$)/is) ||
                        text.match(/nutrition(?:\s*\([^)]*\))?:?(.*?)(?=\n\s*\n|\*\*\w|$)/is);

  console.log('Nutrition section found:', !!nutritionMatch);
  if (nutritionMatch) {
    console.log('Nutrition text:', nutritionMatch[1]);
  }

  if (!nutritionMatch) {
    // Also try to find nutrition info anywhere in the text without a specific header
    const directPatterns = {
      calories: /(\d+)\s*(?:kcal|cal|calories?)/i,
      protein: /(\d+)g?\s*protein/i,
      carbs: /(\d+)g?\s*carb?s?/i,
      fat: /(\d+)g?\s*fat/i,
    };

    const nutrition: RecipeNutrition = {};
    for (const [key, pattern] of Object.entries(directPatterns)) {
      const match = text.match(pattern);
      if (match) {
        (nutrition as any)[key] = parseInt(match[1]);
      }
    }

    // Extract nutrition rating even when no nutrition header found
    const ratingMatch = text.match(/\*\*nutrition\s*rating\*\*:?\s*([A-D])/i) ||
                       text.match(/nutrition\s*rating:?\s*([A-D])/i) ||
                       text.match(/rating:?\s*([A-D])/i);

    if (ratingMatch) {
      nutrition.rating = ratingMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
    }

    return Object.keys(nutrition).length > 0 ? nutrition : undefined;
  }

  const nutritionText = nutritionMatch[1];
  const nutrition: RecipeNutrition = {};

  // First try to extract from Total line with specific format variations
  const totalMatch = nutritionText.match(/\*\*Total per serving:\*\*\s*(\d+)\s*(?:kcal|cal|calories?),?\s*(\d+(?:\.\d+)?)g?\s*protein,?\s*(\d+(?:\.\d+)?)g?\s*carb?s?,?\s*(\d+(?:\.\d+)?)g?\s*fat/i) ||
                    nutritionText.match(/Total.*?:\s*\*?\*?(\d+)\s*(?:kcal|cal|calories?),?\s*(\d+(?:\.\d+)?)g?\s*protein,?\s*(\d+(?:\.\d+)?)g?\s*carb?s?,?\s*(\d+(?:\.\d+)?)g?\s*fat/i) ||
                    nutritionText.match(/=\s*Total.*?:\s*\*?\*?(\d+)\s*(?:kcal|cal|calories?),?\s*(\d+(?:\.\d+)?)g?\s*protein,?\s*(\d+(?:\.\d+)?)g?\s*carb?s?,?\s*(\d+(?:\.\d+)?)g?\s*fat/i) ||
                    nutritionText.match(/\*\*Total.*?:\*\*\s*(\d+)\s*(?:kcal|cal|calories?),?\s*(\d+(?:\.\d+)?)g?\s*protein,?\s*(\d+(?:\.\d+)?)g?\s*carb?s?,?\s*(\d+(?:\.\d+)?)g?\s*fat/i);

  if (totalMatch) {
    nutrition.calories = parseInt(totalMatch[1]);
    nutrition.protein = Math.round(parseFloat(totalMatch[2]));
    nutrition.carbs = Math.round(parseFloat(totalMatch[3]));
    nutrition.fat = Math.round(parseFloat(totalMatch[4]));
    console.log(`Extracted from total line - calories: ${totalMatch[1]}, protein: ${totalMatch[2]}, carbs: ${totalMatch[3]}, fat: ${totalMatch[4]}`);
  } else {
    // Fallback to individual patterns if no total line found
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
        (nutrition as any)[key] = parseInt(match[1]);
        console.log(`Extracted ${key}: ${match[1]}`);
      }
    }
  }

  // Extract nutrition rating
  const ratingMatch = text.match(/\*\*nutrition\s*rating\*\*:?\s*([A-D])/i) ||
                     text.match(/nutrition\s*rating:?\s*([A-D])/i) ||
                     text.match(/rating:?\s*([A-D])/i);

  if (ratingMatch) {
    nutrition.rating = ratingMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
    console.log(`Extracted rating: ${nutrition.rating}`);
  }

  console.log('Final nutrition object:', nutrition);
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
  console.log('=== FULL AI RESPONSE ===');
  console.log(text);
  console.log('=== END AI RESPONSE ===');
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