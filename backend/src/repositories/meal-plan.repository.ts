import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { MealPlan, MealPlanItem } from '@prisma/client';

@Injectable()
export class MealPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUserId(
    userId: string,
  ): Promise<
    Array<
      MealPlan & {
        items: Array<
          MealPlanItem & {
            recipe: any | null;
          }
        >;
      }
    >
  > {
    return this.prisma.mealPlan.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            recipe: true,
          },
          orderBy: [{ day: 'asc' }, { mealSlot: 'asc' }],
        },
      },
      orderBy: { weekStartDate: 'desc' },
    });
  }

  async findById(
    id: string,
    userId: string,
  ): Promise<
    | (MealPlan & {
        items: Array<
          MealPlanItem & {
            recipe: any | null;
          }
        >;
      })
    | null
  > {
    return this.prisma.mealPlan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            recipe: true,
          },
          orderBy: [{ day: 'asc' }, { mealSlot: 'asc' }],
        },
      },
    });
  }

  async findByUserIdAndWeek(userId: string, weekStartDate: Date): Promise<MealPlan | null> {
    return this.prisma.mealPlan.findFirst({
      where: {
        userId,
        weekStartDate,
      },
    });
  }

  async create(data: {
    userId: string;
    weekStartDate: Date;
    title?: string;
    generationMethod?: string;
  }): Promise<MealPlan & { items: MealPlanItem[] }> {
    return this.prisma.mealPlan.create({
      data: {
        userId: data.userId,
        weekStartDate: data.weekStartDate,
        title: data.title,
        generationMethod: data.generationMethod as any,
      },
      include: { items: true },
    });
  }

  async update(
    id: string,
    data: {
      title?: string | null;
      generationPrompt?: string | null;
      generationMethod?: string | null;
      aiPreferences?: any;
    },
  ): Promise<
    MealPlan & {
      items: Array<
        MealPlanItem & {
          recipe: any | null;
        }
      >;
    }
  > {
    return this.prisma.mealPlan.update({
      where: { id },
      data: {
        title: data.title,
        generationPrompt: data.generationPrompt,
        generationMethod: data.generationMethod as any,
        aiPreferences: data.aiPreferences,
      },
      include: {
        items: {
          include: {
            recipe: true,
          },
          orderBy: [{ day: 'asc' }, { mealSlot: 'asc' }],
        },
      },
    });
  }

  async delete(id: string): Promise<MealPlan> {
    return this.prisma.mealPlan.delete({
      where: { id },
    });
  }

  async upsertMealPlanItem(data: {
    mealPlanId: string;
    day: number;
    mealSlot: string;
    recipeId: string | null;
  }): Promise<MealPlanItem> {
    return this.prisma.mealPlanItem.upsert({
      where: {
        mealPlanId_day_mealSlot: {
          mealPlanId: data.mealPlanId,
          day: data.day,
          mealSlot: data.mealSlot as any,
        },
      },
      update: {
        recipeId: data.recipeId || null,
      },
      create: {
        mealPlanId: data.mealPlanId,
        day: data.day,
        mealSlot: data.mealSlot as any,
        recipeId: data.recipeId || null,
      },
    });
  }

  async findMealPlanItem(
    itemId: string,
    mealPlanId: string,
  ): Promise<MealPlanItem | null> {
    return this.prisma.mealPlanItem.findFirst({
      where: {
        id: itemId,
        mealPlanId,
      },
    });
  }

  async deleteMealPlanItem(itemId: string): Promise<MealPlanItem> {
    return this.prisma.mealPlanItem.delete({
      where: { id: itemId },
    });
  }
}
