// Grocery List TypeScript Types

export interface GroceryListResponse {
  id: string;
  userId: string;
  meals: GroceryMealResponse[];
  customItems: CustomGroceryItemResponse[];
  aggregatedIngredients: CategoryIngredients[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroceryMealResponse {
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

export interface CustomGroceryItemResponse {
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
  recipes: string[]; // Recipe titles
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

// Internal types for service layer
export interface ParsedIngredient {
  original: string;
  name: string;
  quantity: string;
  unit?: string;
}
