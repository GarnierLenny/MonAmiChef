import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional-auth.guard';
import { resolveOptimizedOwner } from '../common/utils/owner.util';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { UpdateMealPlanItemDto } from './dto/update-meal-plan-item.dto';
import { MealPlan } from '../types/MealPlanTypes';

@ApiTags('Meal Plans')
@Controller('meal-plans')
export class MealPlanController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all meal plans for the current user/guest
   */
  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get all meal plans for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all meal plans for the user',
  })
  async getUserMealPlans(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MealPlan[]> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    // Only authenticated users can have meal plans
    if (!owner.userId) {
      // Return empty array for guests instead of throwing error
      // Frontend should handle the authentication check
      return [];
    }

    const mealPlans = await this.prisma.mealPlan.findMany({
      where: { userId: owner.userId },
      include: {
        items: {
          include: {
            recipe: true, // Include the actual recipe data
          },
          orderBy: [{ day: 'asc' }, { mealSlot: 'asc' }],
        },
      },
      orderBy: { weekStartDate: 'desc' },
    });

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

  /**
   * Create a new meal plan
   */
  @Post()
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new meal plan' })
  @ApiResponse({
    status: 201,
    description: 'Meal plan created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format',
  })
  @ApiResponse({
    status: 409,
    description: 'Meal plan already exists for this week',
  })
  async createMealPlan(
    @Body() requestBody: CreateMealPlanDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MealPlan> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

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
    const existingPlan = await this.prisma.mealPlan.findFirst({
      where: {
        userId: owner.userId,
        weekStartDate: weekStart,
      },
    });

    if (existingPlan) {
      throw new HttpException(
        'A meal plan already exists for this week',
        HttpStatus.CONFLICT,
      );
    }

    const mealPlan = await this.prisma.mealPlan.create({
      data: {
        userId: owner.userId,
        weekStartDate: weekStart,
        title: requestBody.title,
        generationMethod: requestBody.generationMethod || 'manual',
      },
      include: { items: true },
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

  /**
   * Get a specific meal plan by ID
   */
  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get a specific meal plan by ID' })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the meal plan',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Meal plan not found',
  })
  async getMealPlan(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MealPlan> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mealPlan = await this.prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId,
      },
      include: {
        items: {
          include: {
            recipe: true, // Include the actual recipe data
          },
          orderBy: [{ day: 'asc' }, { mealSlot: 'asc' }],
        },
      },
    });

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

  /**
   * Update a meal plan
   */
  @Put(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Update a meal plan' })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal plan updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Meal plan not found',
  })
  async updateMealPlan(
    @Param('id') id: string,
    @Body() requestBody: UpdateMealPlanDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MealPlan> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if meal plan exists and belongs to user
    const existingPlan = await this.prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId,
      },
    });

    if (!existingPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    const updatedPlan = await this.prisma.mealPlan.update({
      where: { id },
      data: {
        title:
          requestBody.title !== undefined
            ? requestBody.title
            : existingPlan.title,
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

  /**
   * Delete a meal plan
   */
  @Delete(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Delete a meal plan' })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal plan deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Meal plan not found',
  })
  async deleteMealPlan(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const mealPlan = await this.prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId,
      },
    });

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.mealPlan.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Add or update a meal plan item (recipe in a specific day/meal slot)
   */
  @Post(':id/items')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Add or update a meal plan item' })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal plan item added/updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 404,
    description: 'Meal plan not found',
  })
  async addMealPlanItem(
    @Param('id') id: string,
    @Body() requestBody: UpdateMealPlanItemDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Validate inputs (class-validator already handles basic validation)
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
    const mealPlan = await this.prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId,
      },
    });

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    // Upsert meal plan item
    await this.prisma.mealPlanItem.upsert({
      where: {
        mealPlanId_day_mealSlot: {
          mealPlanId: id,
          day: requestBody.day,
          mealSlot: requestBody.mealSlot as any,
        },
      },
      update: {
        recipeId: requestBody.recipeId || null,
      },
      create: {
        mealPlanId: id,
        day: requestBody.day,
        mealSlot: requestBody.mealSlot as any,
        recipeId: requestBody.recipeId || null,
      },
    });

    return { success: true };
  }

  /**
   * Remove a recipe from a specific meal plan slot
   */
  @Delete(':id/items/:itemId')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Remove a meal plan item' })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiParam({ name: 'itemId', description: 'Meal plan item ID' })
  @ApiResponse({
    status: 200,
    description: 'Meal plan item removed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Meal plan or item not found',
  })
  async removeMealPlanItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access meal plans.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify meal plan ownership
    const mealPlan = await this.prisma.mealPlan.findFirst({
      where: {
        id,
        userId: owner.userId,
      },
    });

    if (!mealPlan) {
      throw new HttpException('Meal plan not found', HttpStatus.NOT_FOUND);
    }

    // Find and delete the meal plan item
    const item = await this.prisma.mealPlanItem.findFirst({
      where: {
        id: itemId,
        mealPlanId: id,
      },
    });

    if (!item) {
      throw new HttpException(
        'Meal plan item not found',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.mealPlanItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }
}
