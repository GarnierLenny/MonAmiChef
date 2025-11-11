import { ApiProperty } from '@nestjs/swagger';
import { RecipeContent, RecipeNutrition } from '../../types/RecipeTypes';

export class RecipeResponseDto {
  @ApiProperty({ description: 'Recipe ID' })
  id!: string;

  @ApiProperty({ description: 'Recipe title' })
  title!: string;

  @ApiProperty({ description: 'Recipe content in JSON format' })
  content_json!: RecipeContent;

  @ApiProperty({ description: 'Nutrition information', required: false })
  nutrition?: RecipeNutrition;

  @ApiProperty({ description: 'Recipe tags', type: [String] })
  tags!: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  created_at!: string;

  @ApiProperty({ description: 'Whether the recipe is saved by current user', required: false })
  is_saved?: boolean;
}

export class SavedRecipeResponseDto {
  @ApiProperty({ description: 'Saved recipe ID' })
  id!: string;

  @ApiProperty({ description: 'Recipe details', type: RecipeResponseDto })
  recipe!: RecipeResponseDto;

  @ApiProperty({ description: 'Saved timestamp' })
  created_at!: string;
}

export class SaveRecipeResponseDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success!: boolean;

  @ApiProperty({ description: 'Current saved state of the recipe' })
  is_saved!: boolean;
}

export class UnsaveRecipeResponseDto {
  @ApiProperty({ description: 'Whether the operation was successful' })
  success!: boolean;
}
