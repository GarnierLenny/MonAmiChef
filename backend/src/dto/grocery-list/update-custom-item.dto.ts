import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for updating a custom grocery item
const UpdateCustomItemSchema = z.object({
  name: z.string().optional(),
  quantity: z.string().optional(),
  category: z.string().optional(),
  checked: z.boolean().optional(),
});

// Create DTO class from schema
export class UpdateCustomItemDto extends createZodDto(UpdateCustomItemSchema) {}

// Export inferred type
export type UpdateCustomItem = z.infer<typeof UpdateCustomItemSchema>;
