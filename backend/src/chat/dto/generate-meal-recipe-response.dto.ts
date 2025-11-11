import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for recipe response (within generate meal response)
const RecipeResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content_json: z.any(),
  nutrition: z.any(),
  tags: z.array(z.string()),
  created_at: z.string(),
});

// Define Zod schema for generate meal recipe response
const GenerateMealRecipeResponseSchema = z.object({
  recipe: RecipeResponseSchema,
});

// Create DTO classes from schemas
export class RecipeResponseDto extends createZodDto(RecipeResponseSchema) {}
export class GenerateMealRecipeResponseDto extends createZodDto(GenerateMealRecipeResponseSchema) {}

// Export inferred types
export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
export type GenerateMealRecipeResponse = z.infer<typeof GenerateMealRecipeResponseSchema>;
