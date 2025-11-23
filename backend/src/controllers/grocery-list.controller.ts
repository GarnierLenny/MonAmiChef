import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../services/prisma.service';
import { JwtOptionalAuthGuard } from '../guards/jwt-optional-auth.guard';
import { resolveOptimizedOwner } from '../utils/owner.util';
import { GroceryListService } from '../services/grocery-list.service';
import { AddMealsDto } from '../dto/grocery-list/add-meals.dto';
import { AddCustomItemDto } from '../dto/grocery-list/add-custom-item.dto';
import { UpdateCustomItemDto } from '../dto/grocery-list/update-custom-item.dto';
import type {
  GroceryListResponse,
  CustomGroceryItemResponse,
} from '../types/groceryList';

@ApiTags('Grocery List')
@Controller('grocery-list')
export class GroceryListController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly groceryListService: GroceryListService,
  ) {}

  /**
   * Get the user's grocery list (creates one if it doesn't exist)
   */
  @Get('/')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: "Get user's grocery list" })
  @ApiResponse({
    status: 200,
    description: 'Grocery list retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async getGroceryList(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GroceryListResponse> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      return await this.groceryListService.getOrCreateGroceryList(owner.userId);
    } catch (error) {
      console.error('Error getting grocery list:', error);
      throw new HttpException(
        'Failed to retrieve grocery list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Add meals to the grocery list
   */
  @Post('/meals')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add meals to grocery list' })
  @ApiResponse({
    status: 200,
    description: 'Meals added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async addMeals(
    @Body() body: AddMealsDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GroceryListResponse> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!body.mealPlanItemIds || body.mealPlanItemIds.length === 0) {
      throw new HttpException(
        'mealPlanItemIds is required and must not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.groceryListService.addMeals(owner.userId, body);
  }

  /**
   * Remove a meal from the grocery list
   */
  @Delete('/meals/:mealPlanItemId')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove meal from grocery list' })
  @ApiResponse({
    status: 204,
    description: 'Meal removed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async removeMeal(
    @Param('mealPlanItemId') mealPlanItemId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.groceryListService.removeMeal(owner.userId, mealPlanItemId);
  }

  /**
   * Add a custom item to the grocery list
   */
  @Post('/items')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add custom item to grocery list' })
  @ApiResponse({
    status: 201,
    description: 'Custom item added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async addCustomItem(
    @Body() body: AddCustomItemDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomGroceryItemResponse> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!body.name || body.name.trim() === '') {
      throw new HttpException('Item name is required', HttpStatus.BAD_REQUEST);
    }

    return this.groceryListService.addCustomItem(owner.userId, body);
  }

  /**
   * Update a custom item in the grocery list
   */
  @Patch('/items/:itemId')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update custom item in grocery list' })
  @ApiResponse({
    status: 200,
    description: 'Custom item updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
  })
  async updateCustomItem(
    @Param('itemId') itemId: string,
    @Body() body: UpdateCustomItemDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CustomGroceryItemResponse> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      return await this.groceryListService.updateCustomItem(
        owner.userId,
        itemId,
        body,
      );
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message === 'Grocery list not found' ||
          error.message === 'Custom item not found'
        ) {
          throw new HttpException(error.message, HttpStatus.NOT_FOUND);
        }
      }
      throw new HttpException(
        'Failed to update custom item',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a custom item from the grocery list
   */
  @Delete('/items/:itemId')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom item from grocery list' })
  @ApiResponse({
    status: 204,
    description: 'Custom item deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async deleteCustomItem(
    @Param('itemId') itemId: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.groceryListService.deleteCustomItem(owner.userId, itemId);
  }

  /**
   * Clear the entire grocery list (remove all meals and custom items)
   */
  @Delete('/')
  @UseGuards(JwtOptionalAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear entire grocery list' })
  @ApiResponse({
    status: 204,
    description: 'Grocery list cleared successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  async clearGroceryList(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, response, this.prisma);

    if (!owner.userId) {
      throw new HttpException(
        'Please sign up or log in to access grocery list.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.groceryListService.clearGroceryList(owner.userId);
  }
}
