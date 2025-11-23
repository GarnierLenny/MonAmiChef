import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { GroceryList, GroceryMeal, CustomGroceryItem, MealPlanItem } from '@prisma/client';

@Injectable()
export class GroceryListRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(
    userId: string,
  ): Promise<
    | (GroceryList & {
        meals: GroceryMeal[];
        customItems: CustomGroceryItem[];
      })
    | null
  > {
    return this.prisma.groceryList.findUnique({
      where: { userId },
      include: {
        meals: true,
        customItems: true,
      },
    });
  }

  async create(
    userId: string,
  ): Promise<
    GroceryList & {
      meals: GroceryMeal[];
      customItems: CustomGroceryItem[];
    }
  > {
    return this.prisma.groceryList.create({
      data: { userId },
      include: {
        meals: true,
        customItems: true,
      },
    });
  }

  async findMealPlanItems(itemIds: string[]): Promise<MealPlanItem[]> {
    return this.prisma.mealPlanItem.findMany({
      where: {
        id: { in: itemIds },
      },
    });
  }

  async findMealPlanItemsWithRecipes(
    itemIds: string[],
  ): Promise<
    Array<
      MealPlanItem & {
        recipe: any | null;
      }
    >
  > {
    return this.prisma.mealPlanItem.findMany({
      where: {
        id: { in: itemIds },
      },
      include: {
        recipe: true,
      },
    });
  }

  async upsertGroceryMeal(data: {
    listId: string;
    mealPlanItemId: string;
    day: number;
    mealSlot: string;
  }): Promise<GroceryMeal> {
    return this.prisma.groceryMeal.upsert({
      where: {
        listId_mealPlanItemId: {
          listId: data.listId,
          mealPlanItemId: data.mealPlanItemId,
        },
      },
      create: {
        listId: data.listId,
        mealPlanItemId: data.mealPlanItemId,
        day: data.day,
        mealSlot: data.mealSlot as any,
      },
      update: {},
    });
  }

  async deleteGroceryMeals(listId: string, mealPlanItemId: string): Promise<void> {
    await this.prisma.groceryMeal.deleteMany({
      where: {
        listId,
        mealPlanItemId,
      },
    });
  }

  async createCustomItem(data: {
    listId: string;
    name: string;
    quantity?: string;
    category?: string;
  }): Promise<CustomGroceryItem> {
    return this.prisma.customGroceryItem.create({
      data,
    });
  }

  async findCustomItem(itemId: string, listId: string): Promise<CustomGroceryItem | null> {
    return this.prisma.customGroceryItem.findFirst({
      where: {
        id: itemId,
        listId,
      },
    });
  }

  async updateCustomItem(
    itemId: string,
    data: {
      name?: string;
      quantity?: string;
      category?: string;
      checked?: boolean;
    },
  ): Promise<CustomGroceryItem> {
    return this.prisma.customGroceryItem.update({
      where: { id: itemId },
      data,
    });
  }

  async deleteCustomItems(itemId: string, listId: string): Promise<void> {
    await this.prisma.customGroceryItem.deleteMany({
      where: {
        id: itemId,
        listId,
      },
    });
  }

  async deleteGroceryList(listId: string): Promise<void> {
    await this.prisma.groceryList.delete({
      where: { id: listId },
    });
  }
}
