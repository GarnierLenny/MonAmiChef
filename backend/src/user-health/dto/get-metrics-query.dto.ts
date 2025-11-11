import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMetricsQueryDto {
  @ApiProperty({
    description: 'Start date for filtering metrics (ISO date string)',
    example: '2025-10-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering metrics (ISO date string)',
    example: '2025-11-11T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Maximum number of metrics to return',
    example: 100,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
