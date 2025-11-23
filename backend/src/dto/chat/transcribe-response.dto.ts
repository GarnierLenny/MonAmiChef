import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for transcribe response
const TranscribeResponseSchema = z.object({
  text: z.string(),
});

// Create DTO class from schema
export class TranscribeResponseDto extends createZodDto(TranscribeResponseSchema) {}

// Export inferred type
export type TranscribeResponse = z.infer<typeof TranscribeResponseSchema>;
