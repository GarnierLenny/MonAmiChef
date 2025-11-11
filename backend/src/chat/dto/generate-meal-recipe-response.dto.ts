import { ApiProperty } from '@nestjs/swagger';

export class RecipeResponseDto {
  @ApiProperty({
    description: 'Recipe ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Recipe title',
    example: 'Grilled Salmon with Quinoa',
  })
  title!: string;

  @ApiProperty({
    description: 'Recipe content in JSON format',
  })
  content_json!: any;

  @ApiProperty({
    description: 'Nutrition information',
  })
  nutrition!: any;

  @ApiProperty({
    description: 'Recipe tags',
    type: [String],
    example: ['dinner', 'healthy', 'high-protein'],
  })
  tags!: string[];

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-11T10:30:00.000Z',
  })
  created_at!: string;
}

export class GenerateMealRecipeResponseDto {
  @ApiProperty({
    description: 'Generated recipe',
    type: RecipeResponseDto,
  })
  recipe!: RecipeResponseDto;
}
