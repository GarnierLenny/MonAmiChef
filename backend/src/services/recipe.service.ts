import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RecipeRepository } from '../repositories/recipe.repository';
import { Owner, ownerWhereOptimized } from '../utils/owner.util';
import {
  CreateRecipeDto,
  RecipeResponseDto,
  SavedRecipeResponseDto,
  SaveRecipeResponseDto,
  UnsaveRecipeResponseDto,
} from '../dto/recipe';

@Injectable()
export class RecipeService {
  constructor(private readonly recipeRepository: RecipeRepository) {}

  async createRecipe(body: CreateRecipeDto): Promise<RecipeResponseDto> {
    const recipe = await this.recipeRepository.create({
      title: body.title,
      content_json: body.content_json,
      nutrition: body.nutrition || null,
      tags: body.tags,
    });

    return {
      id: recipe.id,
      title: recipe.title,
      content_json: recipe.content_json as any,
      nutrition: recipe.nutrition as any,
      tags: recipe.tags,
      created_at: recipe.created_at.toISOString(),
    };
  }

  async getSavedRecipes(owner: Owner): Promise<SavedRecipeResponseDto[]> {
    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      throw new HttpException(
        'Saved recipes are only available for registered users. Please sign up or log in.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const savedRecipes = await this.recipeRepository.findSavedRecipesByOwner(
      ownerWhereOptimized(owner),
    );

    return savedRecipes.map((saved) => ({
      id: saved.id,
      recipe: {
        id: saved.Recipe.id,
        title: saved.Recipe.title,
        content_json: saved.Recipe.content_json as any,
        nutrition: saved.Recipe.nutrition as any,
        tags: saved.Recipe.tags,
        created_at: saved.Recipe.created_at.toISOString(),
        is_saved: true,
      },
      created_at: saved.created_at.toISOString(),
    }));
  }

  async getRecipe(recipeId: string, owner: Owner): Promise<RecipeResponseDto> {
    const recipe = await this.recipeRepository.findById(recipeId);

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    // Check if this recipe is saved by the current user
    const savedRecipe = await this.recipeRepository.findSavedRecipe({
      recipe_id: recipeId,
      ...ownerWhereOptimized(owner),
    });

    return {
      id: recipe.id,
      title: recipe.title,
      content_json: recipe.content_json as any,
      nutrition: recipe.nutrition as any,
      tags: recipe.tags,
      created_at: recipe.created_at.toISOString(),
      is_saved: !!savedRecipe,
    };
  }

  async saveRecipe(recipeId: string, owner: Owner): Promise<SaveRecipeResponseDto> {
    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      throw new HttpException(
        'Recipe saving is only available for registered users. Please sign up or log in.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if recipe exists
    const recipe = await this.recipeRepository.findById(recipeId);

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    // Check if already saved
    const existingSave = await this.recipeRepository.findSavedRecipe({
      recipe_id: recipeId,
      ...ownerWhereOptimized(owner),
    });

    if (existingSave) {
      // Unsave (remove from saved recipes)
      await this.recipeRepository.deleteSavedRecipe(existingSave.id);
      return { success: true, is_saved: false };
    } else {
      // Save recipe
      await this.recipeRepository.createSavedRecipe({
        ...ownerWhereOptimized(owner),
        recipe_id: recipeId,
      });
      return { success: true, is_saved: true };
    }
  }

  async unsaveRecipe(
    recipeId: string,
    owner: Owner,
  ): Promise<UnsaveRecipeResponseDto> {
    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      throw new HttpException(
        'Recipe saving is only available for registered users. Please sign up or log in.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const savedRecipe = await this.recipeRepository.findSavedRecipe({
      recipe_id: recipeId,
      ...ownerWhereOptimized(owner),
    });

    if (!savedRecipe) {
      throw new HttpException('Saved recipe not found', HttpStatus.NOT_FOUND);
    }

    await this.recipeRepository.deleteSavedRecipe(savedRecipe.id);

    return { success: true };
  }
}
