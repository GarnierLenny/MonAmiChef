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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../services/prisma.service';
import { JwtOptionalAuthGuard } from '../guards/jwt-optional-auth.guard';
import { resolveOptimizedOwner } from '../utils/owner.util';
import { RecipeService } from '../services/recipe.service';
import {
  CreateRecipeDto,
  RecipeResponseDto,
  SavedRecipeResponseDto,
  SaveRecipeResponseDto,
  UnsaveRecipeResponseDto,
} from '../dto/recipe';

@ApiTags('Recipe')
@Controller('recipes')
export class RecipeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recipeService: RecipeService,
  ) {}

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
    await resolveOptimizedOwner(req, res, this.prisma);
    return this.recipeService.createRecipe(body);
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
    return this.recipeService.getSavedRecipes(owner);
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
    return this.recipeService.getRecipe(recipeId, owner);
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
    return this.recipeService.saveRecipe(recipeId, owner);
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
    return this.recipeService.unsaveRecipe(recipeId, owner);
  }
}
