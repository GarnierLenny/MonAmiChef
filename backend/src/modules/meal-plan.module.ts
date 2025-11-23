import { Module } from '@nestjs/common';
import { MealPlanController } from '../controllers/meal-plan.controller';
import { MealPlanService } from '../services/meal-plan.service';
import { MealPlanRepository } from '../repositories/meal-plan.repository';
import { GoalAwareMealService } from '../services/goal-aware-meal.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MealPlanController],
  providers: [MealPlanService, MealPlanRepository, GoalAwareMealService],
  exports: [MealPlanService, GoalAwareMealService],
})
export class MealPlanModule {}
