import { Recipe, SavedRecipe, RecipeHistory, CreateRecipeRequest } from '../types/recipe';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class RecipeService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async createRecipe(recipeData: CreateRecipeRequest): Promise<Recipe> {
    const response = await this.makeRequest('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
    return response.json();
  }

  async getRecipe(recipeId: string): Promise<Recipe> {
    const response = await this.makeRequest(`/recipes/${recipeId}`);
    return response.json();
  }

  async saveRecipe(recipeId: string): Promise<{ success: boolean; is_saved: boolean }> {
    const response = await this.makeRequest(`/recipes/${recipeId}/save`, {
      method: 'POST',
    });
    return response.json();
  }

  async unsaveRecipe(recipeId: string): Promise<{ success: boolean }> {
    const response = await this.makeRequest(`/recipes/${recipeId}/save`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async getSavedRecipes(): Promise<SavedRecipe[]> {
    const response = await this.makeRequest('/recipes/saved');
    return response.json();
  }

  async getRecipeHistory(): Promise<RecipeHistory[]> {
    const response = await this.makeRequest('/recipes/history');
    return response.json();
  }
}

export const recipeService = new RecipeService();