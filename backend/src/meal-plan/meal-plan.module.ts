import { Module } from '@nestjs/common';
import { MealPlanController } from './meal-plan.controller';
import { GoalAwareMealService } from './services/goal-aware-meal.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MealPlanController],
  providers: [GoalAwareMealService],
  exports: [GoalAwareMealService],
})
export class MealPlanModule {}
