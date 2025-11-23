import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for adding a custom grocery item
const AddCustomItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  category: z.string().optional(),
});

// Create DTO class from schema
export class AddCustomItemDto extends createZodDto(AddCustomItemSchema) {}

// Export inferred type
export type AddCustomItem = z.infer<typeof AddCustomItemSchema>;
