import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddCustomItemDto {
  @ApiProperty({
    description: 'Name of the custom grocery item',
    example: 'Olive oil',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Quantity of the item',
    example: '2 bottles',
  })
  @IsString()
  @IsOptional()
  quantity?: string;

  @ApiPropertyOptional({
    description: 'Category of the item',
    example: 'other',
  })
  @IsString()
  @IsOptional()
  category?: string;
}
