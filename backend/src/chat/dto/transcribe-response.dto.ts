import { ApiProperty } from '@nestjs/swagger';

export class TranscribeResponseDto {
  @ApiProperty({
    description: 'Transcribed text from audio',
    example: 'I want to cook pasta tonight',
  })
  text!: string;
}
