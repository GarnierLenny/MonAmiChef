import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for logging health metrics
const LogMetricSchema = z.object({
  weight: z.number().min(1).max(1000).optional(),
  body_fat: z.number().min(0).max(100).optional(),
  recorded_at: z.string().optional(),
});

// Create DTO class from schema
export class LogMetricDto extends createZodDto(LogMetricSchema) {}

// Export inferred type
export type LogMetric = z.infer<typeof LogMetricSchema>;
