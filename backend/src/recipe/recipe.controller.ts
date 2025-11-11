import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-optional-auth.guard';
import { resolveOptimizedOwner, ownerWhereOptimized } from '../common/utils/owner.util';
import {
  CreateRecipeDto,
  RecipeResponseDto,
  SavedRecipeResponseDto,
  SaveRecipeResponseDto,
  UnsaveRecipeResponseDto,
} from './dto';

@ApiTags('Recipe')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new recipe
   */
  @Post()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({
    status: 201,
    description: 'Recipe created successfully',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRecipe(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: CreateRecipeDto,
  ): Promise<RecipeResponseDto> {
    const owner = await resolveOptimizedOwner(req, res, this.prisma);

    const recipe = await this.prisma.recipe.create({
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
  @Get('saved')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's saved recipes" })
  @ApiResponse({
    status: 200,
    description: 'Saved recipes retrieved successfully',
    type: [SavedRecipeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Saved recipes are only available for registered users',
  })
  async getSavedRecipes(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SavedRecipeResponseDto[]> {
    const owner = await resolveOptimizedOwner(req, res, this.prisma);

    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      throw new HttpException(
        'Saved recipes are only available for registered users. Please sign up or log in.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const savedRecipes = await this.prisma.savedRecipe.findMany({
      where: {
        ...ownerWhereOptimized(owner),
      },
      include: {
        Recipe: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

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

  /**
   * Get a single recipe by ID
   */
  @Get(':recipeId')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single recipe by ID' })
  @ApiParam({ name: 'recipeId', description: 'Recipe ID' })
  @ApiResponse({
    status: 200,
    description: 'Recipe retrieved successfully',
    type: RecipeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async getRecipe(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('recipeId') recipeId: string,
  ): Promise<RecipeResponseDto> {
    const owner = await resolveOptimizedOwner(req, res, this.prisma);

    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    // Check if this recipe is saved by the current user
    const savedRecipe = await this.prisma.savedRecipe.findFirst({
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
  @Post(':recipeId/save')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save or unsave a recipe for the current user' })
  @ApiParam({ name: 'recipeId', description: 'Recipe ID' })
  @ApiResponse({
    status: 200,
    description: 'Recipe saved/unsaved successfully',
    type: SaveRecipeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Recipe saving is only available for registered users',
  })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async saveRecipe(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('recipeId') recipeId: string,
  ): Promise<SaveRecipeResponseDto> {
    const owner = await resolveOptimizedOwner(req, res, this.prisma);

    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      throw new HttpException(
        'Recipe saving is only available for registered users. Please sign up or log in.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check if recipe exists
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
    }

    // Check if already saved
    const existingSave = await this.prisma.savedRecipe.findFirst({
      where: {
        recipe_id: recipeId,
        ...ownerWhereOptimized(owner),
      },
    });

    if (existingSave) {
      // Unsave (remove from saved recipes)
      await this.prisma.savedRecipe.delete({
        where: { id: existingSave.id },
      });
      return { success: true, is_saved: false };
    } else {
      // Save recipe
      await this.prisma.savedRecipe.create({
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
  @Delete(':recipeId/save')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove recipe from saved recipes' })
  @ApiParam({ name: 'recipeId', description: 'Recipe ID' })
  @ApiResponse({
    status: 200,
    description: 'Recipe unsaved successfully',
    type: UnsaveRecipeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Recipe saving is only available for registered users',
  })
  @ApiResponse({ status: 404, description: 'Saved recipe not found' })
  async unsaveRecipe(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('recipeId') recipeId: string,
  ): Promise<UnsaveRecipeResponseDto> {
    const owner = await resolveOptimizedOwner(req, res, this.prisma);

    // Check if user is authenticated (not a guest)
    if (!owner.userId) {
      throw new HttpException(
        'Recipe saving is only available for registered users. Please sign up or log in.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const savedRecipe = await this.prisma.savedRecipe.findFirst({
      where: {
        recipe_id: recipeId,
        ...ownerWhereOptimized(owner),
      },
    });

    if (!savedRecipe) {
      throw new HttpException('Saved recipe not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.savedRecipe.delete({
      where: { id: savedRecipe.id },
    });

    return { success: true };
  }
}
