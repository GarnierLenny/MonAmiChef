import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeContent, RecipeNutrition } from '../../types/RecipeTypes';

export class RecipeContentDto implements RecipeContent {
  @ApiProperty({ description: 'Recipe title' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'List of ingredients', type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @ApiProperty({ description: 'List of cooking instructions', type: [String] })
  @IsArray()
  @IsString({ each: true })
  instructions!: string[];

  @ApiProperty({ description: 'Optional cooking tips', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tips?: string[];

  @ApiProperty({ description: 'Number of servings', required: false })
  @IsOptional()
  servings?: number;

  @ApiProperty({ description: 'Preparation time', required: false })
  @IsOptional()
  @IsString()
  prepTime?: string;

  @ApiProperty({ description: 'Cooking time', required: false })
  @IsOptional()
  @IsString()
  cookTime?: string;

  @ApiProperty({ description: 'Total time', required: false })
  @IsOptional()
  @IsString()
  totalTime?: string;
}

export class RecipeNutritionDto implements RecipeNutrition {
  @ApiProperty({ description: 'Calories', required: false })
  @IsOptional()
  calories?: number;

  @ApiProperty({ description: 'Protein in grams', required: false })
  @IsOptional()
  protein?: number;

  @ApiProperty({ description: 'Carbohydrates in grams', required: false })
  @IsOptional()
  carbs?: number;

  @ApiProperty({ description: 'Fat in grams', required: false })
  @IsOptional()
  fat?: number;

  @ApiProperty({ description: 'Fiber in grams', required: false })
  @IsOptional()
  fiber?: number;

  @ApiProperty({ description: 'Sugar in grams', required: false })
  @IsOptional()
  sugar?: number;

  @ApiProperty({ description: 'Nutrition rating', enum: ['A', 'B', 'C', 'D'], required: false })
  @IsOptional()
  rating?: 'A' | 'B' | 'C' | 'D';
}

export class CreateRecipeDto {
  @ApiProperty({ description: 'Recipe title' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Recipe content in JSON format', type: RecipeContentDto })
  @ValidateNested()
  @Type(() => RecipeContentDto)
  content_json!: RecipeContent;

  @ApiProperty({ description: 'Nutrition information', type: RecipeNutritionDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecipeNutritionDto)
  nutrition?: RecipeNutrition;

  @ApiProperty({ description: 'Recipe tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
