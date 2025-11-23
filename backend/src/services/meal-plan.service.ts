import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MealPlanRepository } from '../repositories/meal-plan.repository';
import { Owner } from '../utils/owner.util';
import { CreateMealPlanDto } from '../dto/meal-plan/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/meal-plan/update-meal-plan.dto';
import { UpdateMealPlanItemDto } from '../dto/meal-plan/update-meal-plan-item.dto';
import { MealPlan } from '../types/MealPlanTypes';

@Injectable()
export class MealPlanService {
  constructor(private readonly mealPlanRepository: MealPlanRepository) {}

  async getUserMealPlans(owner: Owner): Promise<MealPlan[]> {
    // Only authenticated users can have meal plans
    if (!owner.userId) {
      // Return empty array for guests instead of throwing error
      return [];
    }

    const mealPlans = await this.mealPlanRepository.findManyByUserId(owner.userId);

    return mealPlans.map((plan) => ({
      id: plan.id,
      userId: plan.userId,
      weekStartDate: plan.weekStartDate,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      title: plan.title || undefined,
      generationPrompt: plan.generationPrompt || undefined,
      generationMethod: plan.generationMethod || undefined,
      aiPreferences: plan.aiPreferences as any,
      items: plan.items.map((item) => ({
        id: item.id,
        mealPlanId: item.mealPlanId,
        day: item.day,
        mealSlot: item.mealSlot,
        recipeId: item.recipeId || undefined,
        createdAt: item.createdAt,
        recipe: item.recipe
          ? {
              id: item.recipe.id,
              title: item.recipe.title,
              content_json: item.recipe.content_json as any,
              nutrition: item.recipe.nutrition as any,
              tags: item.recipe.tags,
              created_at: item.recipe.created_at.toISOString(),
            }
          : undefined,
      })),
    }));
  }

  async createMealPlan(requestBody: CreateMealPlanDto, owner: Owner): Promise<MealPlan> {
    // Only authenticated users can create meal plans
    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to create meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Validate date
    const weekStart = new Date(requestBody.weekStartDate);
    if (isNaN(weekStart.getTime())) {
      throw new HttpException(
        'Invalid date format for weekStartDate',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if meal plan already exists for this week
    const existingPlan = await this.mealPlanRepository.findByUserIdAndWeek(
      owner.userId,
      weekStart,
    );

    if (existingPlan) {
      throw new HttpException(
        'A meal plan already exists for this week',
        HttpStatus.CONFLICT,
      );
    }

    const mealPlan = await this.mealPlanRepository.create({
      userId: owner.userId,
      weekStartDate: weekStart,
      title: requestBody.title,
      generationMethod: requestBody.generationMethod || 'manual',
    });

    return {
      id: mealPlan.id,
      userId: mealPlan.userId,
      weekStartDate: mealPlan.weekStartDate,
      createdAt: mealPlan.createdAt,
      updatedAt: mealPlan.updatedAt,
      title: mealPlan.title || undefined,
      generationPrompt: mealPlan.generationPrompt || undefined,
      generationMethod: mealPlan.generationMethod || undefined,
      aiPreferences: mealPlan.aiPreferences as any,
      items: [],
    };
  }

  async getMealPlan(id: string, owner: Owner): Promise<MealPlan> {
    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mealPlan = await this.mealPlanRepository.findById(id, owner.userId);

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: mealPlan.id,
      userId: mealPlan.userId,
      weekStartDate: mealPlan.weekStartDate,
      createdAt: mealPlan.createdAt,
      updatedAt: mealPlan.updatedAt,
      title: mealPlan.title || undefined,
      generationPrompt: mealPlan.generationPrompt || undefined,
      generationMethod: mealPlan.generationMethod || undefined,
      aiPreferences: mealPlan.aiPreferences as any,
      items: mealPlan.items.map((item) => ({
        id: item.id,
        mealPlanId: item.mealPlanId,
        day: item.day,
        mealSlot: item.mealSlot,
        recipeId: item.recipeId || undefined,
        createdAt: item.createdAt,
        recipe: item.recipe
          ? {
              id: item.recipe.id,
              title: item.recipe.title,
              content_json: item.recipe.content_json as any,
              nutrition: item.recipe.nutrition as any,
              tags: item.recipe.tags,
              created_at: item.recipe.created_at.toISOString(),
            }
          : undefined,
      })),
    };
  }

  async updateMealPlan(
    id: string,
    requestBody: UpdateMealPlanDto,
    owner: Owner,
  ): Promise<MealPlan> {
    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if meal plan exists and belongs to user
    const existingPlan = await this.mealPlanRepository.findById(id, owner.userId);

    if (!existingPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    const updatedPlan = await this.mealPlanRepository.update(id, {
      title:
        requestBody.title !== undefined ? requestBody.title : existingPlan.title,
      generationPrompt:
        requestBody.generationPrompt !== undefined
          ? requestBody.generationPrompt
          : existingPlan.generationPrompt,
      generationMethod:
        requestBody.generationMethod !== undefined
          ? requestBody.generationMethod
          : existingPlan.generationMethod,
      aiPreferences:
        requestBody.aiPreferences !== undefined
          ? (requestBody.aiPreferences as any)
          : existingPlan.aiPreferences,
    });

    return {
      id: updatedPlan.id,
      userId: updatedPlan.userId,
      weekStartDate: updatedPlan.weekStartDate,
      createdAt: updatedPlan.createdAt,
      updatedAt: updatedPlan.updatedAt,
      title: updatedPlan.title || undefined,
      generationPrompt: updatedPlan.generationPrompt || undefined,
      generationMethod: updatedPlan.generationMethod || undefined,
      aiPreferences: updatedPlan.aiPreferences as any,
      items: updatedPlan.items.map((item) => ({
        id: item.id,
        mealPlanId: item.mealPlanId,
        day: item.day,
        mealSlot: item.mealSlot,
        recipeId: item.recipeId || undefined,
        createdAt: item.createdAt,
        recipe: item.recipe
          ? {
              id: item.recipe.id,
              title: item.recipe.title,
              content_json: item.recipe.content_json as any,
              nutrition: item.recipe.nutrition as any,
              tags: item.recipe.tags,
              created_at: item.recipe.created_at.toISOString(),
            }
          : undefined,
      })),
    };
  }

  async deleteMealPlan(id: string, owner: Owner): Promise<{ success: boolean }> {
    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mealPlan = await this.mealPlanRepository.findById(id, owner.userId);

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    await this.mealPlanRepository.delete(id);

    return { success: true };
  }

  async addMealPlanItem(
    id: string,
    requestBody: UpdateMealPlanItemDto,
    owner: Owner,
  ): Promise<{ success: boolean }> {
    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Validate inputs
    if (requestBody.day < 0 || requestBody.day > 6) {
      throw new HttpException(
        'Day must be between 0 (Sunday) and 6 (Saturday)',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !['breakfast', 'lunch', 'dinner', 'snack'].includes(requestBody.mealSlot)
    ) {
      throw new HttpException(
        'Invalid meal slot. Must be: breakfast, lunch, dinner, or snack',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Verify meal plan ownership
    const mealPlan = await this.mealPlanRepository.findById(id, owner.userId);

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    // Upsert meal plan item
    await this.mealPlanRepository.upsertMealPlanItem({
      mealPlanId: id,
      day: requestBody.day,
      mealSlot: requestBody.mealSlot,
      recipeId: requestBody.recipeId || null,
    });

    return { success: true };
  }

  async removeMealPlanItem(
    id: string,
    itemId: string,
    owner: Owner,
  ): Promise<{ success: boolean }> {
    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify meal plan ownership
    const mealPlan = await this.mealPlanRepository.findById(id, owner.userId);

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    // Find and delete the meal plan item
    const item = await this.mealPlanRepository.findMealPlanItem(itemId, id);

    if (!item) {
      throw new HttpException('Meal plan item not found', HttpStatus.NOT_FOUND);
    }

    await this.mealPlanRepository.deleteMealPlanItem(itemId);

    return { success: true };
  }
}
