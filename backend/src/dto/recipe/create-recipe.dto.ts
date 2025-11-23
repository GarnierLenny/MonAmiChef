import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for recipe content
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

// Define Zod schema for recipe nutrition
const RecipeNutritionSchema = z.object({
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  rating: z.enum(['A', 'B', 'C', 'D']).optional(),
});

// Define Zod schema for create recipe request
const CreateRecipeSchema = z.object({
  title: z.string(),
  content_json: RecipeContentSchema,
  nutrition: RecipeNutritionSchema.optional(),
  tags: z.array(z.string()),
});

// Create DTO classes from schemas
export class RecipeContentDto extends createZodDto(RecipeContentSchema) {}
export class RecipeNutritionDto extends createZodDto(RecipeNutritionSchema) {}
export class CreateRecipeDto extends createZodDto(CreateRecipeSchema) {}

// Export inferred types
export type RecipeContent = z.infer<typeof RecipeContentSchema>;
export type RecipeNutrition = z.infer<typeof RecipeNutritionSchema>;
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
