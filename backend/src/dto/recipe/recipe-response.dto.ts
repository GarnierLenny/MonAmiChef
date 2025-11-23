import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Import schemas from create-recipe.dto
const RecipeContentSchema = z.object({
  title: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  tips: z.array(z.string()).optional(),
  servings: z.number().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  totalTime: z.string().optional(),
});

const RecipeNutritionSchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  rating: z.enum(['A', 'B', 'C', 'D']).optional(),
});

// Define Zod schema for recipe response
const RecipeResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content_json: RecipeContentSchema,
  nutrition: RecipeNutritionSchema.optional(),
  tags: z.array(z.string()),
  created_at: z.string(),
  is_saved: z.boolean().optional(),
});

// Define Zod schema for saved recipe response
const SavedRecipeResponseSchema = z.object({
  id: z.string(),
  recipe: RecipeResponseSchema,
  created_at: z.string(),
});

// Define Zod schema for save recipe response
const SaveRecipeResponseSchema = z.object({
  success: z.boolean(),
  is_saved: z.boolean(),
});

// Define Zod schema for unsave recipe response
const UnsaveRecipeResponseSchema = z.object({
  success: z.boolean(),
});

// Create DTO classes from schemas
export class RecipeResponseDto extends createZodDto(RecipeResponseSchema) {}
export class SavedRecipeResponseDto extends createZodDto(SavedRecipeResponseSchema) {}
export class SaveRecipeResponseDto extends createZodDto(SaveRecipeResponseSchema) {}
export class UnsaveRecipeResponseDto extends createZodDto(UnsaveRecipeResponseSchema) {}

// Export inferred types
export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
export type SavedRecipeResponse = z.infer<typeof SavedRecipeResponseSchema>;
export type SaveRecipeResponse = z.infer<typeof SaveRecipeResponseSchema>;
export type UnsaveRecipeResponse = z.infer<typeof UnsaveRecipeResponseSchema>;
