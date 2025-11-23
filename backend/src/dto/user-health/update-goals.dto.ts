import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for updating health goals
const UpdateGoalsSchema = z.object({
  target_weight: z.number().min(1).max(1000).optional(),
  target_body_fat: z.number().min(0).max(100).optional(),
  daily_protein_goal: z.number().min(0).max(1000).optional(),
  daily_carbs_goal: z.number().min(0).max(2000).optional(),
  daily_fat_goal: z.number().min(0).max(500).optional(),
  daily_calories_goal: z.number().min(0).max(10000).optional(),
});

// Create DTO class from schema
export class UpdateGoalsDto extends createZodDto(UpdateGoalsSchema) {}

// Export inferred type
export type UpdateGoals = z.infer<typeof UpdateGoalsSchema>;
