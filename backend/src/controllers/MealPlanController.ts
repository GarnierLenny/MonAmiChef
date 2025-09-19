import {
  Body,
  Path,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Route,
  Tags,
  Security,
  Request,
  SuccessResponse,
} from "tsoa";
import { prisma } from "../app";
import * as express from "express";
import { resolveOptimizedOwner } from '../utils/optimizedOwner';
import {
  MealPlan,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
  UpdateMealPlanItemRequest,
} from "../types/MealPlanTypes";

@Route("meal-plans")
@Tags("MealPlans")
export class MealPlanController extends Controller {

  /**
   * Get all meal plans for the current user/guest
   */
  @Get("/")
  @Security("optionalAuth")
  public async getUserMealPlans(
    @Request() request: express.Request
  ): Promise<MealPlan[]> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    // Only authenticated users can have meal plans for now
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId: owner.userId },
      include: {
        items: {
          include: {
            recipe: true // Include the actual recipe data
          },
          orderBy: [
            { day: 'asc' },
            { mealSlot: 'asc' }
          ]
        }
      },
      orderBy: { weekStartDate: 'desc' }
    });

    return mealPlans.map(plan => ({
      id: plan.id,
      userId: plan.userId,
      weekStartDate: plan.weekStartDate,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      title: plan.title || undefined,
      generationPrompt: plan.generationPrompt || undefined,
      generationMethod: plan.generationMethod || undefined,
      aiPreferences: plan.aiPreferences as any,
      items: plan.items.map(item => ({
        id: item.id,
        mealPlanId: item.mealPlanId,
        day: item.day,
        mealSlot: item.mealSlot,
        recipeId: item.recipeId || undefined,
        createdAt: item.createdAt,
        recipe: item.recipe ? {
          id: item.recipe.id,
          title: item.recipe.title,
          content_json: item.recipe.content_json as any,
          nutrition: item.recipe.nutrition as any,
          tags: item.recipe.tags,
          created_at: item.recipe.created_at.toISOString(),
        } : undefined,
      }))
    }));
  }

  /**
   * Create a new meal plan
   */
  @Post("/")
  @Security("optionalAuth")
  @SuccessResponse(201, "Created")
  public async createMealPlan(
    @Body() requestBody: CreateMealPlanRequest,
    @Request() request: express.Request
  ): Promise<MealPlan> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    // Only authenticated users can create meal plans
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    // Validate date
    const weekStart = new Date(requestBody.weekStartDate);
    if (isNaN(weekStart.getTime())) {
      this.setStatus(400);
      throw new Error("Invalid date format for weekStartDate");
    }

    // Check if meal plan already exists for this week
    const existingPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: owner.userId,
        weekStartDate: weekStart
      }
    });

    if (existingPlan) {
      this.setStatus(409);
      throw new Error("A meal plan already exists for this week");
    }

    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: owner.userId,
        weekStartDate: weekStart,
        title: requestBody.title,
        generationMethod: requestBody.generationMethod || 'manual',
      },
      include: { items: true }
    });

    this.setStatus(201);
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

  /**
   * Get a specific meal plan by ID
   */
  @Get("{id}")
  @Security("optionalAuth")
  public async getMealPlan(
    @Path() id: string,
    @Request() request: express.Request
  ): Promise<MealPlan> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId
      },
      include: {
        items: {
          include: {
            recipe: true // Include the actual recipe data
          },
          orderBy: [
            { day: 'asc' },
            { mealSlot: 'asc' }
          ]
        }
      }
    });

    if (!mealPlan) {
      this.setStatus(404);
      throw new Error('Meal plan not found');
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
      items: mealPlan.items.map(item => ({
        id: item.id,
        mealPlanId: item.mealPlanId,
        day: item.day,
        mealSlot: item.mealSlot,
        recipeId: item.recipeId || undefined,
        createdAt: item.createdAt,
        recipe: item.recipe ? {
          id: item.recipe.id,
          title: item.recipe.title,
          content_json: item.recipe.content_json as any,
          nutrition: item.recipe.nutrition as any,
          tags: item.recipe.tags,
          created_at: item.recipe.created_at.toISOString(),
        } : undefined,
      }))
    };
  }

  /**
   * Update a meal plan
   */
  @Put("{id}")
  @Security("optionalAuth")
  public async updateMealPlan(
    @Path() id: string,
    @Body() requestBody: UpdateMealPlanRequest,
    @Request() request: express.Request
  ): Promise<MealPlan> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    // Check if meal plan exists and belongs to user
    const existingPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId
      }
    });

    if (!existingPlan) {
      this.setStatus(404);
      throw new Error('Meal plan not found');
    }

    const updatedPlan = await prisma.mealPlan.update({
      where: { id },
      data: {
        title: requestBody.title !== undefined ? requestBody.title : existingPlan.title,
        generationPrompt: requestBody.generationPrompt !== undefined ? requestBody.generationPrompt : existingPlan.generationPrompt,
        generationMethod: requestBody.generationMethod !== undefined ? requestBody.generationMethod : existingPlan.generationMethod,
        aiPreferences: requestBody.aiPreferences !== undefined ? requestBody.aiPreferences as any : existingPlan.aiPreferences,
      },
      include: {
        items: {
          include: {
            recipe: true
          },
          orderBy: [
            { day: 'asc' },
            { mealSlot: 'asc' }
          ]
        }
      }
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
      items: updatedPlan.items.map(item => ({
        id: item.id,
        mealPlanId: item.mealPlanId,
        day: item.day,
        mealSlot: item.mealSlot,
        recipeId: item.recipeId || undefined,
        createdAt: item.createdAt,
        recipe: item.recipe ? {
          id: item.recipe.id,
          title: item.recipe.title,
          content_json: item.recipe.content_json as any,
          nutrition: item.recipe.nutrition as any,
          tags: item.recipe.tags,
          created_at: item.recipe.created_at.toISOString(),
        } : undefined,
      }))
    };
  }

  /**
   * Delete a meal plan
   */
  @Delete("{id}")
  @Security("optionalAuth")
  public async deleteMealPlan(
    @Path() id: string,
    @Request() request: express.Request
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId
      }
    });

    if (!mealPlan) {
      this.setStatus(404);
      throw new Error('Meal plan not found');
    }

    await prisma.mealPlan.delete({
      where: { id }
    });

    return { success: true };
  }

  /**
   * Add or update a meal plan item (recipe in a specific day/meal slot)
   */
  @Post("{id}/items")
  @Security("optionalAuth")
  public async addMealPlanItem(
    @Path() id: string,
    @Body() requestBody: UpdateMealPlanItemRequest,
    @Request() request: express.Request
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    // Validate inputs
    if (requestBody.day < 0 || requestBody.day > 6) {
      this.setStatus(400);
      throw new Error("Day must be between 0 (Sunday) and 6 (Saturday)");
    }

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(requestBody.mealSlot)) {
      this.setStatus(400);
      throw new Error("Invalid meal slot. Must be: breakfast, lunch, dinner, or snack");
    }

    // Verify meal plan ownership
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId
      }
    });

    if (!mealPlan) {
      this.setStatus(404);
      throw new Error('Meal plan not found');
    }

    // Upsert meal plan item
    await prisma.mealPlanItem.upsert({
      where: {
        mealPlanId_day_mealSlot: {
          mealPlanId: id,
          day: requestBody.day,
          mealSlot: requestBody.mealSlot as any,
        }
      },
      update: {
        recipeId: requestBody.recipeId || null
      },
      create: {
        mealPlanId: id,
        day: requestBody.day,
        mealSlot: requestBody.mealSlot as any,
        recipeId: requestBody.recipeId || null
      }
    });

    return { success: true };
  }

  /**
   * Remove a recipe from a specific meal plan slot
   */
  @Delete("{id}/items/{itemId}")
  @Security("optionalAuth")
  public async removeMealPlanItem(
    @Path() id: string,
    @Path() itemId: string,
    @Request() request: express.Request
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Meal plans are only available for registered users. Please sign up or log in.");
    }

    // Verify meal plan ownership
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId
      }
    });

    if (!mealPlan) {
      this.setStatus(404);
      throw new Error('Meal plan not found');
    }

    // Find and delete the meal plan item
    const item = await prisma.mealPlanItem.findFirst({
      where: {
        id: itemId,
        mealPlanId: id
      }
    });

    if (!item) {
      this.setStatus(404);
      throw new Error('Meal plan item not found');
    }

    await prisma.mealPlanItem.delete({
      where: { id: itemId }
    });

    return { success: true };
  }
}