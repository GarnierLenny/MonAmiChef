import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';

export class UpdateMealPlanItemDto {
  @ApiProperty({
    description: 'Day of the week (0-6, Sunday-Saturday)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  day!: number;

  @ApiProperty({
    description: 'Meal slot',
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    example: 'lunch',
  })
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  mealSlot!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @ApiPropertyOptional({
    description: 'Recipe ID to assign to this meal slot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  recipeId?: string;
}
