import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class AddMealsDto {
  @ApiProperty({
    description: 'Array of meal plan item IDs to add to grocery list',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  mealPlanItemIds!: string[];
}
