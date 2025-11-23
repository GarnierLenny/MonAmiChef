import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for message
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string(),
});

// Define Zod schema for conversation detail
const ConversationDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(), // ISO 8601 date string
  messages: z.array(MessageSchema),
});

// Create DTO classes from schemas
export class MessageDto extends createZodDto(MessageSchema) {}
export class ConversationDetailDto extends createZodDto(ConversationDetailSchema) {}

// Export inferred types
export type Message = z.infer<typeof MessageSchema>;
export type ConversationDetail = z.infer<typeof ConversationDetailSchema>;
