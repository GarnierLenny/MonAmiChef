import { IsString, IsNotEmpty, IsIn, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateMealRecipeRequestDto {
  @ApiProperty({
    description: 'Type of meal to generate',
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    example: 'dinner',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['breakfast', 'lunch', 'dinner', 'snack'])
  mealType!: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  @ApiPropertyOptional({
    description: 'User preferences for the meal',
    example: 'I like spicy food',
  })
  @IsOptional()
  @IsString()
  preferences?: string;

  @ApiPropertyOptional({
    description: 'Dietary restrictions',
    example: ['vegetarian', 'gluten-free'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryRestrictions?: string[];

  @ApiPropertyOptional({
    description: 'Day for meal planning (ISO date string)',
    example: '2025-11-11',
  })
  @IsOptional()
  @IsString()
  day?: string;
}
