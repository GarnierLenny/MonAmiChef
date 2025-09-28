import { Recipe, SavedRecipe, CreateRecipeRequest } from '../types/recipe';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8888';

class RecipeService {
  private async getAccessToken(): Promise<string | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session?.access_token ?? null;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers,
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

}

export const recipeService = new RecipeService();