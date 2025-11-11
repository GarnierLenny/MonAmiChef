import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateGoalsDto {
  @ApiProperty({
    description: 'Target weight goal',
    example: 170,
    required: false,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  target_weight?: number;

  @ApiProperty({
    description: 'Target body fat percentage goal',
    example: 15,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  target_body_fat?: number;

  @ApiProperty({
    description: 'Daily protein goal in grams',
    example: 150,
    required: false,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  daily_protein_goal?: number;

  @ApiProperty({
    description: 'Daily carbohydrates goal in grams',
    example: 200,
    required: false,
    minimum: 0,
    maximum: 2000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  daily_carbs_goal?: number;

  @ApiProperty({
    description: 'Daily fat goal in grams',
    example: 65,
    required: false,
    minimum: 0,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  daily_fat_goal?: number;

  @ApiProperty({
    description: 'Daily calories goal',
    example: 2200,
    required: false,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  daily_calories_goal?: number;
}
