import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for user preferences
const PreferencesSchema = z.object({
  mealType: z.array(z.string()).optional(),
  mealOccasion: z.array(z.string()).optional(),
  cookingEquipment: z.array(z.string()).optional(),
  cookingTime: z.array(z.string()).optional(),
  skillLevel: z.array(z.string()).optional(),
  nutrition: z.array(z.string()).optional(),
  cuisine: z.array(z.string()).optional(),
  spiceLevel: z.array(z.string()).optional(),
  meat: z.array(z.string()).optional(),
  vegetables: z.array(z.string()).optional(),
  servings: z.number().nullable().optional(),
});

// Define Zod schema for chat request
const ChatRequestSchema = z.object({
  userMessage: z.string().min(1).max(1000),
  preferences: PreferencesSchema,
});

// Create DTO class from schema
export class ChatRequestDto extends createZodDto(ChatRequestSchema) {}

// Export inferred types
export type Preferences = z.infer<typeof PreferencesSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
