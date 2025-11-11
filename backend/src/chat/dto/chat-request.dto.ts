import { IsString, IsNotEmpty, MaxLength, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Preferences } from '../../types/ChatTypes';

export class ChatRequestDto {
  @ApiProperty({
    description: 'User message',
    example: 'I want to cook pasta tonight',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  userMessage!: string;

  @ApiProperty({
    description: 'User preferences for recipe generation',
    required: false,
  })
  @IsOptional()
  preferences!: Preferences;
}
