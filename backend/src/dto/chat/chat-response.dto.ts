import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for chat response
const ChatResponseSchema = z.object({
  reply: z.string(),
  conversationId: z.string().nullable(),
});

// Create DTO class from schema
export class ChatResponseDto extends createZodDto(ChatResponseSchema) {}

// Export inferred type
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
