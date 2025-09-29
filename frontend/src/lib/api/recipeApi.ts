// API client for recipe operations
import { apiFetch } from '../apiClient';

// Recipe types matching backend
export interface RecipeContent {
  title: string;
  ingredients: string[];
  instructions: string[];
  tips?: string[];
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  rating?: "A" | "B" | "C" | "D";
}

export interface Recipe {
  id: string;
  title: string;
  content_json: RecipeContent;
  nutrition?: RecipeNutrition;
  tags: string[];
  created_at: string;
}

export interface GenerateMealRecipeRequest {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  preferences?: string;
  dietaryRestrictions?: string[];
  day?: string;
}

export interface GenerateMealRecipeResponse {
  recipe: Recipe;
}

// API functions
export const recipeApi = {
  // Generate a recipe for a specific meal slot
  async generateMealRecipe(data: GenerateMealRecipeRequest): Promise<Recipe> {
    const response = await apiFetch<GenerateMealRecipeResponse>('/chat/generate-meal-recipe', {
      method: 'POST',
      body: data,
      auth: 'optional',
    });
    return response.recipe;
  },

  // Get a specific recipe by ID
  async getRecipe(id: string): Promise<Recipe> {
    return apiFetch<Recipe>(`/recipes/${id}`, {
      method: 'GET',
    });
  },
};