import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCustomItemDto {
  @ApiPropertyOptional({
    description: 'Updated name of the item',
    example: 'Extra virgin olive oil',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated quantity of the item',
    example: '3 bottles',
  })
  @IsString()
  @IsOptional()
  quantity?: string;

  @ApiPropertyOptional({
    description: 'Updated category of the item',
    example: 'spices',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Whether the item is checked off',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  checked?: boolean;
}
