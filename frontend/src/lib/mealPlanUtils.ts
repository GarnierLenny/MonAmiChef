// Utility functions to bridge frontend and backend meal plan types
import { startOfWeek, format } from 'date-fns';
import type {
  BackendMealPlan,
  BackendMealPlanItem,
  CreateMealPlanRequest,
  UpdateMealPlanItemRequest
} from './api/mealPlanApi';
import type { MealPlan, Meal, MealSlot } from '@/components/meal-plan/constants';

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
  backendPlan: BackendMealPlan,
  meals: Record<string, Meal> = {}
): MealPlan {
  const frontendPlan: MealPlan = {};

  if (backendPlan.items) {
    backendPlan.items.forEach((item) => {
      const dayName = DAY_NUMBER_TO_NAME[item.day];
      if (!frontendPlan[dayName]) {
        frontendPlan[dayName] = {};
      }

      // If we have a recipeId, try to find the corresponding meal
      // For now, we'll create a placeholder meal - this can be enhanced with actual recipe data
      if (item.recipeId && meals[item.recipeId]) {
        frontendPlan[dayName][item.mealSlot as MealSlot] = meals[item.recipeId];
      }
    });
  }

  return frontendPlan;
}

// Find meal plan for a specific week
export function findMealPlanForWeek(
  mealPlans: BackendMealPlan[],
  weekStart: Date
): BackendMealPlan | undefined {
  const weekStartStr = startOfWeek(weekStart).toISOString().split('T')[0];

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