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
import { PrismaService } from '../services/prisma.service';
import { JwtOptionalAuthGuard } from '../guards/jwt-optional-auth.guard';
import { resolveOptimizedOwner } from '../utils/owner.util';
import { MealPlanService } from '../services/meal-plan.service';
import { CreateMealPlanDto } from '../dto/meal-plan/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/meal-plan/update-meal-plan.dto';
import { UpdateMealPlanItemDto } from '../dto/meal-plan/update-meal-plan-item.dto';
import { MealPlan } from '../types/MealPlanTypes';

@ApiTags('Meal Plans')
@Controller('meal-plans')
export class MealPlanController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mealPlanService: MealPlanService,
  ) {}

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
    return this.mealPlanService.getUserMealPlans(owner);
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
    return this.mealPlanService.createMealPlan(requestBody, owner);
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
    return this.mealPlanService.getMealPlan(id, owner);
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
    return this.mealPlanService.updateMealPlan(id, requestBody, owner);
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
    return this.mealPlanService.deleteMealPlan(id, owner);
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
    return this.mealPlanService.addMealPlanItem(id, requestBody, owner);
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
    return this.mealPlanService.removeMealPlanItem(id, itemId, owner);
  }
}
