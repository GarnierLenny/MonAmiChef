import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for AI preferences
const AIPreferencesSchema = z.object({
  dietary_restrictions: z.array(z.string()).optional(),
  cuisine_preferences: z.array(z.string()).optional(),
  cooking_time_max: z.string().optional(),
  budget_range: z.enum(['low', 'moderate', 'high']).optional(),
  servings: z.number().optional(),
  avoid_ingredients: z.array(z.string()).optional(),
});

// Define Zod schema for updating a meal plan
const UpdateMealPlanSchema = z.object({
  title: z.string().optional(),
  generationPrompt: z.string().optional(),
  generationMethod: z.enum(['manual', 'ai_generated', 'ai_assisted']).optional(),
  aiPreferences: AIPreferencesSchema.optional(),
});

// Create DTO class from schema
export class UpdateMealPlanDto extends createZodDto(UpdateMealPlanSchema) {}

// Export inferred types
export type AIPreferences = z.infer<typeof AIPreferencesSchema>;
export type UpdateMealPlan = z.infer<typeof UpdateMealPlanSchema>;
