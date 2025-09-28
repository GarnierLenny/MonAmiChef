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
  is_saved?: boolean;
}

export interface SavedRecipe {
  id: string;
  recipe: Recipe;
  created_at: string;
}


export interface CreateRecipeRequest {
  title: string;
  content_json: RecipeContent;
  nutrition?: RecipeNutrition;
  tags: string[];
}

export interface ParsedRecipe {
  title: string;
  content: RecipeContent;
  nutrition?: RecipeNutrition;
  tags: string[];
}