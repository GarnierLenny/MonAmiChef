import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { AIPreferences } from '../../types/MealPlanTypes';

export class UpdateMealPlanDto {
  @ApiPropertyOptional({
    description: 'Title of the meal plan',
    example: 'My Weekly Meal Plan',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Prompt used for AI generation',
    example: 'Create healthy meals for weight loss',
  })
  @IsOptional()
  @IsString()
  generationPrompt?: string;

  @ApiPropertyOptional({
    description: 'Method used to generate the meal plan',
    enum: ['manual', 'ai_generated', 'ai_assisted'],
    example: 'manual',
  })
  @IsOptional()
  @IsEnum(['manual', 'ai_generated', 'ai_assisted'])
  generationMethod?: 'manual' | 'ai_generated' | 'ai_assisted';

  @ApiPropertyOptional({
    description: 'AI preferences for meal generation',
  })
  @IsOptional()
  @IsObject()
  aiPreferences?: AIPreferences;
}
