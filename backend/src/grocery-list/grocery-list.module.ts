import { Module } from '@nestjs/common';
import { GroceryListController } from './grocery-list.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GroceryListController],
})
export class GroceryListModule {}
