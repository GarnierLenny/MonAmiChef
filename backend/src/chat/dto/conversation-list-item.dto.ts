import { ApiProperty } from '@nestjs/swagger';

export class ConversationListItemDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Conversation title',
    example: 'My favorite pasta recipe',
  })
  title!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-11-11T10:30:00.000Z',
  })
  created_at!: Date;
}
