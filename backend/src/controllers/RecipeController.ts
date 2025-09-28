import {
  Body,
  Path,
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Delete,
  Security,
  Request,
} from "tsoa";
import { prisma } from "../app";
import * as express from "express";
import { resolveOptimizedOwner, ownerWhereOptimized } from '../utils/optimizedOwner';
import {
  CreateRecipeRequest,
  RecipeResponse,
  SavedRecipeResponse,
} from "../types/RecipeTypes";

@Route("recipes")
@Tags("Recipe")
export class RecipeController extends Controller {
  
  /**
   * Create a new recipe
   */
  @Post("")
  @Security("optionalAuth")
  public async createRecipe(
    @Request() request: express.Request,
    @Body() body: CreateRecipeRequest,
  ): Promise<RecipeResponse> {
    const owner = await resolveOptimizedOwner(request, request.res, this);
    
    const recipe = await prisma.recipe.create({
      data: {
        title: body.title,
        content_json: body.content_json as any,
        nutrition: body.nutrition ? (body.nutrition as any) : null,
        tags: body.tags,
      },
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

  /**
   * Get user's saved recipes
   */
  @Get("saved")
  @Security("optionalAuth")
  public async getSavedRecipes(
    @Request() request: express.Request,
  ): Promise<SavedRecipeResponse[]> {
    const owner = await resolveOptimizedOwner(request, request.res, this);
    
    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Saved recipes are only available for registered users. Please sign up or log in.");
    }
    
    const savedRecipes = await prisma.savedRecipe.findMany({
      where: {
        ...ownerWhereOptimized(owner),
      },
      include: {
        Recipe: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return savedRecipes.map(saved => ({
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


  /**
   * Get a single recipe by ID
   */
  @Get("{recipeId}")
  @Security("optionalAuth")
  public async getRecipe(
    @Request() request: express.Request,
    @Path("recipeId") recipeId: string,
  ): Promise<RecipeResponse> {
    const owner = await resolveOptimizedOwner(request, request.res, this);
    
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      this.setStatus(404);
      throw new Error("Recipe not found");
    }

    // Check if this recipe is saved by the current user
    const savedRecipe = await prisma.savedRecipe.findFirst({
      where: {
        recipe_id: recipeId,
        ...ownerWhereOptimized(owner),
      },
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

  /**
   * Save a recipe for the current user
   */
  @Post("{recipeId}/save")
  @Security("optionalAuth")
  public async saveRecipe(
    @Request() request: express.Request,
    @Path("recipeId") recipeId: string,
  ): Promise<{ success: boolean; is_saved: boolean }> {
    const owner = await resolveOptimizedOwner(request, request.res, this);
    
    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Recipe saving is only available for registered users. Please sign up or log in.");
    }
    
    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      this.setStatus(404);
      throw new Error("Recipe not found");
    }

    // Check if already saved
    const existingSave = await prisma.savedRecipe.findFirst({
      where: {
        recipe_id: recipeId,
        ...ownerWhereOptimized(owner),
      },
    });

    if (existingSave) {
      // Unsave (remove from saved recipes)
      await prisma.savedRecipe.delete({
        where: { id: existingSave.id },
      });
      return { success: true, is_saved: false };
    } else {
      // Save recipe
      await prisma.savedRecipe.create({
        data: {
          ...ownerWhereOptimized(owner),
          recipe_id: recipeId,
        },
      });
      return { success: true, is_saved: true };
    }
  }

  /**
   * Remove recipe from saved recipes
   */
  @Delete("{recipeId}/save")
  @Security("optionalAuth")
  public async unsaveRecipe(
    @Request() request: express.Request,
    @Path("recipeId") recipeId: string,
  ): Promise<{ success: boolean }> {
    const owner = await resolveOptimizedOwner(request, request.res, this);
    
    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("Recipe saving is only available for registered users. Please sign up or log in.");
    }
    
    const savedRecipe = await prisma.savedRecipe.findFirst({
      where: {
        recipe_id: recipeId,
        ...ownerWhereOptimized(owner),
      },
    });

    if (!savedRecipe) {
      this.setStatus(404);
      throw new Error("Saved recipe not found");
    }

    await prisma.savedRecipe.delete({
      where: { id: savedRecipe.id },
    });

    return { success: true };
  }
}