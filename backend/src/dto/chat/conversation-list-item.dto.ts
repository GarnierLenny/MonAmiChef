import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for conversation list item
const ConversationListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(), // ISO 8601 date string
});

// Create DTO class from schema
export class ConversationListItemDto extends createZodDto(ConversationListItemSchema) {}

// Export inferred type
export type ConversationListItem = z.infer<typeof ConversationListItemSchema>;
