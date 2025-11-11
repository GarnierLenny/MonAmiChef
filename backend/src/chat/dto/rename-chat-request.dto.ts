import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for rename chat request
const RenameChatRequestSchema = z.object({
  newTitle: z.string().min(1).max(100),
});

// Create DTO class from schema
export class RenameChatRequestDto extends createZodDto(RenameChatRequestSchema) {}

// Export inferred type
export type RenameChatRequest = z.infer<typeof RenameChatRequestSchema>;
