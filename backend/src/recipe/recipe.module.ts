import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecipeController],
})
export class RecipeModule {}
