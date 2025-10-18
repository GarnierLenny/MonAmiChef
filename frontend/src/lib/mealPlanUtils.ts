// Utility functions to bridge frontend and backend meal plan types
import { startOfWeek, format } from 'date-fns';
import type {
  BackendMealPlan,
  BackendMealPlanItem,
  CreateMealPlanRequest,
  UpdateMealPlanItemRequest
} from './api/mealPlanApi';
import type { MealPlan, Meal, MealSlot } from '@/components/meal-plan/constants';
import type { Recipe } from './api/recipeApi';

// Convert day names to backend day numbers (0-6, Sunday-Saturday)
const DAY_NAME_TO_NUMBER: Record<string, number> = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

// Convert backend day numbers to day names
const DAY_NUMBER_TO_NAME: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

// Convert frontend meal plan to backend format for week creation
export function createMealPlanRequest(weekStart: Date, title?: string): CreateMealPlanRequest {
  return {
    weekStartDate: weekStart.toISOString(),
    title: title || `Meal Plan for ${format(weekStart, 'MMM d, yyyy')}`,
    generationMethod: 'manual',
  };
}

// Convert frontend meal slot click to backend meal plan item request
export function createMealPlanItemRequest(
  dayName: string,
  mealSlot: MealSlot,
  recipeId?: string
): UpdateMealPlanItemRequest {
  const day = DAY_NAME_TO_NUMBER[dayName];
  if (day === undefined) {
    throw new Error(`Invalid day name: ${dayName}`);
  }

  return {
    day,
    mealSlot,
    recipeId,
  };
}

// Convert backend meal plan to frontend format
export function convertBackendToFrontendMealPlan(
  backendPlan: BackendMealPlan
): MealPlan {
  const frontendPlan: MealPlan = {};

  if (backendPlan.items && backendPlan.items.length > 0) {
    backendPlan.items.forEach((item) => {
      const dayName = DAY_NUMBER_TO_NAME[item.day];

      // Validate day name exists
      if (!dayName) {
        console.warn(`Invalid day number: ${item.day}`);
        return;
      }

      if (!frontendPlan[dayName]) {
        frontendPlan[dayName] = {};
      }

      // If we have a recipe, convert it to meal format
      if (item.recipe && item.recipeId) {
        const recipe: Recipe = {
          id: item.recipe.id,
          title: item.recipe.title,
          content_json: item.recipe.content_json,
          nutrition: item.recipe.nutrition,
          tags: item.recipe.tags,
          created_at: item.recipe.created_at,
        };
        frontendPlan[dayName][item.mealSlot as MealSlot] = convertRecipeToMeal(recipe);
      }
      // Note: We don't create placeholder meals here because the frontend
      // manages display meals separately from backend meal plan structure
    });
  }

  return frontendPlan;
}

// Find meal plan for a specific week
export function findMealPlanForWeek(
  mealPlans: BackendMealPlan[],
  weekStart: Date
): BackendMealPlan | undefined {
  const weekStartStr = startOfWeek(weekStart, { weekStartsOn: 1 }).toISOString().split('T')[0];

  return mealPlans.find(plan => {
    const planWeekStart = new Date(plan.weekStartDate).toISOString().split('T')[0];
    return planWeekStart === weekStartStr;
  });
}

// Get meal plan item by day and meal slot
export function findMealPlanItem(
  backendPlan: BackendMealPlan,
  dayName: string,
  mealSlot: MealSlot
): BackendMealPlanItem | undefined {
  const day = DAY_NAME_TO_NUMBER[dayName];
  if (day === undefined || !backendPlan.items) {
    return undefined;
  }

  return backendPlan.items.find(item =>
    item.day === day && item.mealSlot === mealSlot
  );
}

// Check if user is authenticated (has access to meal plans)
export function requiresAuthentication(error: unknown): boolean {
  const err = error as { message?: string; statusCode?: number };
  return err?.message?.includes?.('only available for registered users') ||
         err?.statusCode === 401;
}

// Convert recipe to meal format for display
export function convertRecipeToMeal(recipe: Recipe): Meal {
  const nutrition = recipe.nutrition;
  const content = recipe.content_json;

  // Extract emoji from title if present, default based on meal type
  const emojiMatch = recipe.title.match(/([🍳🥣🍽️🥗🌯🍲🥪🍝🐟🍜🌮🍛🍕🥤🥑])/);
  const emoji = emojiMatch ? emojiMatch[1] : getDefaultEmojiForTags(recipe.tags);

  // Validate nutrition data - if missing critical data, log warning
  if (!nutrition || typeof nutrition.calories !== 'number' || nutrition.calories <= 0) {
    console.warn(`Recipe ${recipe.id} missing valid nutrition data. This should not happen with the new validation.`, nutrition);
  }

  // Use AI-provided nutrition rating, fallback to calculated grade
  let grade: "A" | "B" | "C" | "D" = nutrition?.rating || "B";

  return {
    id: recipe.id,
    title: recipe.title.replace(/[🍳🥣🍽️🥗🌯🍲🥪🍝🐟🍜🌮🍛🍕🥤🥑]/g, '').trim(),
    image: emoji,
    description: content.ingredients.slice(0, 3).join(', ') + (content.ingredients.length > 3 ? '...' : ''),
    servings: content.servings || 1,
    cookingTime: parseCookingTime(content.cookTime || content.totalTime) || 20,
    // Nutrition should always be present now due to backend validation
    // Only use fallback values as absolute last resort
    calories: nutrition?.calories || 0,
    grade,
    macros: {
      protein: nutrition?.protein || 0,
      carbs: nutrition?.carbs || 0,
      fat: nutrition?.fat || 0,
    },
  };
}

// Get default emoji based on recipe tags
function getDefaultEmojiForTags(tags: string[]): string {
  const emojiMap: Record<string, string> = {
    'breakfast': '🥣',
    'lunch': '🍽️',
    'dinner': '🍽️',
    'snack': '🥨',
    'italian': '🍝',
    'asian': '🍜',
    'mexican': '🌮',
    'mediterranean': '🥗',
    'grilled': '🔥',
    'baked': '🍞',
    'salad': '🥗',
    'soup': '🍲',
    'pasta': '🍝',
    'rice': '🍛',
    'sandwich': '🥪',
    'stir-fry': '🍜',
  };

  for (const tag of tags) {
    if (emojiMap[tag.toLowerCase()]) {
      return emojiMap[tag.toLowerCase()];
    }
  }

  return '🍽️'; // Default emoji
}

// Parse cooking time string to minutes
function parseCookingTime(timeStr?: string): number | undefined {
  if (!timeStr) return undefined;

  const hourMatch = timeStr.match(/(\d+)\s*(?:hrs?|hours?)/i);
  const minMatch = timeStr.match(/(\d+)\s*(?:mins?|minutes?)/i);

  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);

  return minutes > 0 ? minutes : undefined;
}