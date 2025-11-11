import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateMealPlanDto {
  @ApiProperty({
    description: 'Week start date in ISO format',
    example: '2025-01-06',
  })
  @IsString()
  weekStartDate!: string;

  @ApiPropertyOptional({
    description: 'Title of the meal plan',
    example: 'My Weekly Meal Plan',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Method used to generate the meal plan',
    enum: ['manual', 'ai_generated', 'ai_assisted'],
    example: 'manual',
  })
  @IsOptional()
  @IsEnum(['manual', 'ai_generated', 'ai_assisted'])
  generationMethod?: 'manual' | 'ai_generated' | 'ai_assisted';
}
