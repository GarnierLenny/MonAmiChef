import {
  Body,
  Path,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Route,
  Tags,
  Security,
  Request,
  SuccessResponse,
} from 'tsoa';
import * as express from 'express';
import { resolveOptimizedOwner } from '../utils/optimizedOwner';
import { groceryListService } from '../services/GroceryListService';
import type {
  GroceryListResponse,
  AddMealsRequest,
  AddCustomItemRequest,
  UpdateCustomItemRequest,
  CustomGroceryItemResponse,
} from '../types/groceryList';

@Route('grocery-list')
@Tags('GroceryList')
export class GroceryListController extends Controller {
  /**
   * Get the user's grocery list (creates one if it doesn't exist)
   */
  @Get('/')
  @Security('optionalAuth')
  public async getGroceryList(
    @Request() request: express.Request
  ): Promise<GroceryListResponse> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    return groceryListService.getOrCreateGroceryList(owner.userId);
  }

  /**
   * Add meals to the grocery list
   */
  @Post('/meals')
  @Security('optionalAuth')
  @SuccessResponse(200, 'Meals added successfully')
  public async addMeals(
    @Body() requestBody: AddMealsRequest,
    @Request() request: express.Request
  ): Promise<GroceryListResponse> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    if (!requestBody.mealPlanItemIds || requestBody.mealPlanItemIds.length === 0) {
      this.setStatus(400);
      throw new Error('mealPlanItemIds is required and must not be empty');
    }

    return groceryListService.addMeals(owner.userId, requestBody);
  }

  /**
   * Remove a meal from the grocery list
   */
  @Delete('/meals/{mealPlanItemId}')
  @Security('optionalAuth')
  @SuccessResponse(204, 'Meal removed successfully')
  public async removeMeal(
    @Path() mealPlanItemId: string,
    @Request() request: express.Request
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    await groceryListService.removeMeal(owner.userId, mealPlanItemId);
    this.setStatus(204);
  }

  /**
   * Add a custom item to the grocery list
   */
  @Post('/items')
  @Security('optionalAuth')
  @SuccessResponse(201, 'Custom item added successfully')
  public async addCustomItem(
    @Body() requestBody: AddCustomItemRequest,
    @Request() request: express.Request
  ): Promise<CustomGroceryItemResponse> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    if (!requestBody.name || requestBody.name.trim() === '') {
      this.setStatus(400);
      throw new Error('Item name is required');
    }

    const item = await groceryListService.addCustomItem(owner.userId, requestBody);
    this.setStatus(201);
    return item;
  }

  /**
   * Update a custom item in the grocery list
   */
  @Patch('/items/{itemId}')
  @Security('optionalAuth')
  @SuccessResponse(200, 'Custom item updated successfully')
  public async updateCustomItem(
    @Path() itemId: string,
    @Body() requestBody: UpdateCustomItemRequest,
    @Request() request: express.Request
  ): Promise<CustomGroceryItemResponse> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    return groceryListService.updateCustomItem(owner.userId, itemId, requestBody);
  }

  /**
   * Delete a custom item from the grocery list
   */
  @Delete('/items/{itemId}')
  @Security('optionalAuth')
  @SuccessResponse(204, 'Custom item deleted successfully')
  public async deleteCustomItem(
    @Path() itemId: string,
    @Request() request: express.Request
  ): Promise<void> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    await groceryListService.deleteCustomItem(owner.userId, itemId);
    this.setStatus(204);
  }

  /**
   * Clear the entire grocery list (remove all meals and custom items)
   */
  @Delete('/')
  @Security('optionalAuth')
  @SuccessResponse(204, 'Grocery list cleared successfully')
  public async clearGroceryList(@Request() request: express.Request): Promise<void> {
    const owner = await resolveOptimizedOwner(request, request.res, this);

    if (!owner.userId) {
      this.setStatus(401);
      throw new Error('Please sign up or log in to access grocery list.');
    }

    await groceryListService.clearGroceryList(owner.userId);
    this.setStatus(204);
  }
}
