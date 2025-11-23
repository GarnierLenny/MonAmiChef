import { Module } from '@nestjs/common';
import { GroceryListController } from '../controllers/grocery-list.controller';
import { GroceryListService } from '../services/grocery-list.service';
import { GroceryListRepository } from '../repositories/grocery-list.repository';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GroceryListController],
  providers: [GroceryListService, GroceryListRepository],
  exports: [GroceryListService],
})
export class GroceryListModule {}
