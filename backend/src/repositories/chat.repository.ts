import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Conversation, ChatMessage, Recipe } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(data: {
    title: string;
    owner_profile_id?: string;
    owner_guest_id?: string;
  }): Promise<Conversation> {
    return this.prisma.conversation.create({
      data,
    });
  }

  async findConversationById(
    id: string,
    where: { owner_profile_id?: string; owner_guest_id?: string },
  ): Promise<Conversation | null> {
    return this.prisma.conversation.findFirst({
      where: {
        id,
        ...where,
      },
    });
  }

  async findConversationWithMessages(
    id: string,
    where: { owner_profile_id?: string; owner_guest_id?: string },
  ): Promise<
    | (Conversation & {
        ChatMessage: Array<{
          messages: any;
          created_at: Date;
        }>;
      })
    | null
  > {
    const result = await this.prisma.conversation.findFirst({
      where: {
        id,
        ...where,
      },
      include: {
        ChatMessage: {
          select: {
            messages: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    return result as any;
  }

  async findUserConversations(where: {
    owner_profile_id?: string;
    owner_guest_id?: string;
  }): Promise<
    Array<{
      id: string;
      created_at: Date;
      title: string | null;
    }>
  > {
    return this.prisma.conversation.findMany({
      where,
      select: {
        id: true,
        created_at: true,
        title: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 100,
    });
  }

  async updateConversation(
    id: string,
    where: { owner_profile_id?: string; owner_guest_id?: string },
    data: { title: string },
  ): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: {
        id,
        ...where,
      },
      data,
    });
  }

  async createChatMessage(data: {
    conversation_id: string;
    history: Prisma.InputJsonValue;
    messages: any[];
  }): Promise<ChatMessage> {
    return this.prisma.chatMessage.create({
      data: {
        conversation_id: data.conversation_id,
        history: data.history,
        messages: data.messages,
      },
    });
  }

  async findChatMessage(conversationId: string): Promise<{
    messages: any;
    history: any;
  } | null> {
    return this.prisma.chatMessage.findFirst({
      where: {
        conversation_id: conversationId,
      },
      select: {
        messages: true,
        history: true,
      },
    });
  }

  async updateChatMessage(
    conversationId: string,
    data: {
      history: Prisma.InputJsonValue;
      messages: any[];
    },
  ): Promise<ChatMessage> {
    return this.prisma.chatMessage.update({
      where: {
        conversation_id: conversationId,
      },
      data,
    });
  }

  async deleteConversationWithMessages(conversationId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Delete messages first (foreign key constraint)
      await tx.chatMessage.deleteMany({
        where: {
          conversation_id: conversationId,
        },
      });

      // Then delete conversation
      await tx.conversation.delete({
        where: {
          id: conversationId,
        },
      });
    });
  }

  async createRecipe(data: {
    title: string;
    content_json: any;
    nutrition: any;
    tags: string[];
  }): Promise<Recipe> {
    return this.prisma.recipe.create({
      data: {
        title: data.title,
        content_json: data.content_json as any,
        nutrition: data.nutrition as any,
        tags: data.tags,
      },
    });
  }
}
