import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for adding meals to grocery list
const AddMealsSchema = z.object({
  mealPlanItemIds: z.array(z.string()).min(1),
});

// Create DTO class from schema
export class AddMealsDto extends createZodDto(AddMealsSchema) {}

// Export inferred type
export type AddMeals = z.infer<typeof AddMealsSchema>;
