import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI assistant reply',
    example: 'Here is a delicious pasta recipe...',
  })
  reply!: string;

  @ApiProperty({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  conversationId!: string | null;
}
