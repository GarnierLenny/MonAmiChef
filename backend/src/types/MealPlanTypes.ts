// backend/src/types/MealPlanTypes.ts
export interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  generationPrompt?: string;
  generationMethod?: "manual" | "ai_generated" | "ai_assisted";
  aiPreferences?: AIPreferences;
  items?: MealPlanItem[];
}

export interface AIPreferences {
  dietary_restrictions?: string[];
  cuisine_preferences?: string[];
  cooking_time_max?: string;
  budget_range?: "low" | "moderate" | "high";
  servings?: number;
  avoid_ingredients?: string[];
}

export interface MealPlanItem {
  id: string;
  mealPlanId: string;
  day: number;
  mealSlot: "breakfast" | "lunch" | "dinner" | "snack";
  recipeId?: string;
  createdAt: Date;
  recipe?: {
    id: string;
    title: string;
    content_json: any;
    nutrition?: any;
    tags: string[];
    created_at: string;
  };
}

export interface CreateMealPlanRequest {
  weekStartDate: string; // ISO date string
  title?: string;
  generationMethod?: "manual" | "ai_generated" | "ai_assisted";
}

export interface CreateAIMealPlanRequest {
  weekStartDate: string;
  preferences: string; // Natural language
  dietary_restrictions?: string[];
  cooking_time_max?: string;
  servings?: number;
}

export interface UpdateMealPlanItemRequest {
  day: number; // 0-6 (Sunday-Saturday)
  mealSlot: "breakfast" | "lunch" | "dinner" | "snack";
  recipeId?: string; // Optional for removing items
}

export interface UpdateMealPlanRequest {
  title?: string;
  generationPrompt?: string;
  generationMethod?: "manual" | "ai_generated" | "ai_assisted";
  aiPreferences?: AIPreferences;
}
