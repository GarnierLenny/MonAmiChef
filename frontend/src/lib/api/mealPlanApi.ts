// API client for meal plan operations
import { apiFetch } from '../apiClient';

// Backend types - matching the backend API responses
export interface BackendMealPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  generationPrompt?: string;
  generationMethod?: "manual" | "ai_generated" | "ai_assisted";
  aiPreferences?: AIPreferences;
  items?: BackendMealPlanItem[];
}

export interface AIPreferences {
  dietary_restrictions?: string[];
  cuisine_preferences?: string[];
  cooking_time_max?: string;
  budget_range?: "low" | "moderate" | "high";
  servings?: number;
  avoid_ingredients?: string[];
}

export interface BackendMealPlanItem {
  id: string;
  mealPlanId: string;
  day: number; // 0-6 (Sunday-Saturday)
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

// API functions
export const mealPlanApi = {
  // Get all meal plans for the current user
  async getUserMealPlans(): Promise<BackendMealPlan[]> {
    return apiFetch<BackendMealPlan[]>('/meal-plans', {
      method: 'GET',
      auth: 'optional',
    });
  },

  // Create a new meal plan
  async createMealPlan(data: CreateMealPlanRequest): Promise<BackendMealPlan> {
    return apiFetch<BackendMealPlan>('/meal-plans', {
      method: 'POST',
      body: data,
    });
  },

  // Get a specific meal plan by ID
  async getMealPlan(id: string): Promise<BackendMealPlan> {
    return apiFetch<BackendMealPlan>(`/meal-plans/${id}`, {
      method: 'GET',
    });
  },

  // Update a meal plan
  async updateMealPlan(id: string, data: UpdateMealPlanRequest): Promise<BackendMealPlan> {
    return apiFetch<BackendMealPlan>(`/meal-plans/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  // Delete a meal plan
  async deleteMealPlan(id: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/meal-plans/${id}`, {
      method: 'DELETE',
    });
  },

  // Add or update a meal plan item
  async addMealPlanItem(id: string, data: UpdateMealPlanItemRequest): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/meal-plans/${id}/items`, {
      method: 'POST',
      body: data,
    });
  },

  // Remove a meal plan item
  async removeMealPlanItem(planId: string, itemId: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/meal-plans/${planId}/items/${itemId}`, {
      method: 'DELETE',
    });
  },
};