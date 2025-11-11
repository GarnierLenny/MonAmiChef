import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RenameChatRequestDto {
  @ApiProperty({
    description: 'New title for the conversation',
    example: 'My favorite pasta recipe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newTitle!: string;
}
