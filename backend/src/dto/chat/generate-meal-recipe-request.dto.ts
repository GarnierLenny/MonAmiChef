import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for generating meal recipe request
const GenerateMealRecipeRequestSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  preferences: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  day: z.string().optional(),
});

// Create DTO class from schema
export class GenerateMealRecipeRequestDto extends createZodDto(GenerateMealRecipeRequestSchema) {}

// Export inferred type
export type GenerateMealRecipeRequest = z.infer<typeof GenerateMealRecipeRequestSchema>;
