import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Define Zod schema for querying health metrics
const GetMetricsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).optional(),
});

// Create DTO class from schema
export class GetMetricsQueryDto extends createZodDto(GetMetricsQuerySchema) {}

// Export inferred type
export type GetMetricsQuery = z.infer<typeof GetMetricsQuerySchema>;
