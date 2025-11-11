import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { MealPlanModule } from '../meal-plan/meal-plan.module';

@Module({
  imports: [PrismaModule, MealPlanModule],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
  exports: [ChatService],
})
export class ChatModule {}
