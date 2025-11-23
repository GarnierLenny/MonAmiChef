import { Module } from '@nestjs/common';
import { RecipeController } from '../controllers/recipe.controller';
import { RecipeService } from '../services/recipe.service';
import { RecipeRepository } from '../repositories/recipe.repository';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecipeController],
  providers: [RecipeService, RecipeRepository],
  exports: [RecipeService],
})
export class RecipeModule {}
