import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for updating a meal plan item
const UpdateMealPlanItemSchema = z.object({
  day: z.number().min(0).max(6),
  mealSlot: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  recipeId: z.string().optional(),
});

// Create DTO class from schema
export class UpdateMealPlanItemDto extends createZodDto(UpdateMealPlanItemSchema) {}

// Export inferred type
export type UpdateMealPlanItem = z.infer<typeof UpdateMealPlanItemSchema>;
