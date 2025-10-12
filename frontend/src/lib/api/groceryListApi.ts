// API client for grocery list operations
import { apiFetch } from '../apiClient';

// Backend types - matching the backend API responses
export interface GroceryList {
  id: string;
  userId: string;
  meals: GroceryMeal[];
  customItems: CustomGroceryItem[];
  aggregatedIngredients: CategoryIngredients[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroceryMeal {
  id: string;
  mealPlanItemId: string;
  day: number;
  mealSlot: string;
  recipe: {
    id: string;
    title: string;
    ingredients: string[];
  };
  addedAt: Date;
}

export interface CustomGroceryItem {
  id: string;
  name: string;
  quantity?: string;
  category?: string;
  checked: boolean;
  createdAt: Date;
}

export interface CategoryIngredients {
  category: string;
  emoji: string;
  items: AggregatedIngredient[];
}

export interface AggregatedIngredient {
  name: string;
  quantity: string;
  recipeIds: string[];
  recipes: string[];
}

// Request types
export interface AddMealsRequest {
  mealPlanItemIds: string[];
}

export interface AddCustomItemRequest {
  name: string;
  quantity?: string;
  category?: string;
}

export interface UpdateCustomItemRequest {
  name?: string;
  quantity?: string;
  category?: string;
  checked?: boolean;
}

// API functions
export const groceryListApi = {
  // Get the user's grocery list (creates one if it doesn't exist)
  async getGroceryList(): Promise<GroceryList> {
    return apiFetch<GroceryList>('/grocery-list', {
      method: 'GET',
    });
  },

  // Add meals to the grocery list
  async addMeals(mealPlanItemIds: string[]): Promise<GroceryList> {
    return apiFetch<GroceryList>('/grocery-list/meals', {
      method: 'POST',
      body: { mealPlanItemIds },
    });
  },

  // Remove a meal from the grocery list
  async removeMeal(mealPlanItemId: string): Promise<void> {
    return apiFetch<void>(`/grocery-list/meals/${mealPlanItemId}`, {
      method: 'DELETE',
    });
  },

  // Add a custom item to the grocery list
  async addCustomItem(
    name: string,
    quantity?: string,
    category?: string
  ): Promise<CustomGroceryItem> {
    return apiFetch<CustomGroceryItem>('/grocery-list/items', {
      method: 'POST',
      body: { name, quantity, category },
    });
  },

  // Update a custom item
  async updateCustomItem(
    itemId: string,
    updates: UpdateCustomItemRequest
  ): Promise<CustomGroceryItem> {
    return apiFetch<CustomGroceryItem>(`/grocery-list/items/${itemId}`, {
      method: 'PATCH',
      body: updates,
    });
  },

  // Delete a custom item
  async deleteCustomItem(itemId: string): Promise<void> {
    return apiFetch<void>(`/grocery-list/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Clear the entire grocery list
  async clearGroceryList(): Promise<void> {
    return apiFetch<void>('/grocery-list', {
      method: 'DELETE',
    });
  },
};
