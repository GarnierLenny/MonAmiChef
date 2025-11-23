import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { HealthMetric, UserGoals, MealPlan } from '@prisma/client';

@Injectable()
export class UserHealthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findHealthMetrics(where: any, orderBy?: any, take?: number): Promise<HealthMetric[]> {
    return this.prisma.healthMetric.findMany({
      where,
      orderBy,
      take,
    });
  }

  async findHealthMetricByProfileAndDate(
    profileId: string,
    recordedAt: Date,
  ): Promise<HealthMetric | null> {
    return this.prisma.healthMetric.findFirst({
      where: {
        profile_id: profileId,
        recorded_at: recordedAt,
      },
    });
  }

  async createHealthMetric(data: {
    profile_id: string;
    weight?: number;
    body_fat?: number;
    recorded_at: Date;
  }): Promise<HealthMetric> {
    return this.prisma.healthMetric.create({
      data,
    });
  }

  async updateHealthMetric(
    id: string,
    data: { weight?: number; body_fat?: number },
  ): Promise<HealthMetric> {
    return this.prisma.healthMetric.update({
      where: { id },
      data,
    });
  }

  async findUserGoals(profileId: string): Promise<UserGoals | null> {
    return this.prisma.userGoals.findUnique({
      where: { profile_id: profileId },
    });
  }

  async upsertUserGoals(
    profileId: string,
    data: {
      target_weight?: number;
      target_body_fat?: number;
      daily_protein_goal?: number;
      daily_carbs_goal?: number;
      daily_fat_goal?: number;
      daily_calories_goal?: number;
    },
  ): Promise<UserGoals> {
    return this.prisma.userGoals.upsert({
      where: { profile_id: profileId },
      update: data,
      create: {
        profile_id: profileId,
        ...data,
      },
    });
  }

  async findMealPlanForWeek(
    userId: string,
    weekStart: Date,
  ): Promise<
    | (MealPlan & {
        items: Array<{
          day: number;
          recipe: {
            nutrition: any;
          } | null;
        }>;
      })
    | null
  > {
    return this.prisma.mealPlan.findFirst({
      where: {
        userId,
        weekStartDate: weekStart,
      },
      include: {
        items: {
          include: {
            recipe: {
              select: {
                nutrition: true,
              },
            },
          },
        },
      },
    });
  }
}
