import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for creating a meal plan
const CreateMealPlanSchema = z.object({
  weekStartDate: z.string(),
  title: z.string().optional(),
  generationMethod: z.enum(['manual', 'ai_generated', 'ai_assisted']).optional(),
});

// Create DTO class from schema
export class CreateMealPlanDto extends createZodDto(CreateMealPlanSchema) {}

// Export inferred type
export type CreateMealPlan = z.infer<typeof CreateMealPlanSchema>;
