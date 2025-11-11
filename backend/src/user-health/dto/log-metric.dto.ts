import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class LogMetricDto {
  @ApiProperty({
    description: 'Weight in pounds or kilograms',
    example: 175,
    required: false,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  weight?: number;

  @ApiProperty({
    description: 'Body fat percentage',
    example: 18.5,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  body_fat?: number;

  @ApiProperty({
    description: 'Date when the metric was recorded (ISO date string)',
    example: '2025-11-11T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsString()
  recorded_at?: string;
}
