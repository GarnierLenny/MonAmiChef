import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Recipe, SavedRecipe } from '@prisma/client';

@Injectable()
export class RecipeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    content_json: any;
    nutrition: any | null;
    tags: string[];
  }): Promise<Recipe> {
    return this.prisma.recipe.create({
      data: {
        title: data.title,
        content_json: data.content_json as any,
        nutrition: data.nutrition as any,
        tags: data.tags,
      },
    });
  }

  async findById(id: string): Promise<Recipe | null> {
    return this.prisma.recipe.findUnique({
      where: { id },
    });
  }

  async findSavedRecipesByOwner(where: {
    owner_profile_id?: string;
    owner_guest_id?: string;
  }): Promise<Array<SavedRecipe & { Recipe: Recipe }>> {
    return this.prisma.savedRecipe.findMany({
      where,
      include: {
        Recipe: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findSavedRecipe(where: {
    recipe_id: string;
    owner_profile_id?: string;
    owner_guest_id?: string;
  }): Promise<SavedRecipe | null> {
    return this.prisma.savedRecipe.findFirst({
      where,
    });
  }

  async createSavedRecipe(data: {
    recipe_id: string;
    owner_profile_id?: string;
    owner_guest_id?: string;
  }): Promise<SavedRecipe> {
    return this.prisma.savedRecipe.create({
      data,
    });
  }

  async deleteSavedRecipe(id: string): Promise<SavedRecipe> {
    return this.prisma.savedRecipe.delete({
      where: { id },
    });
  }
}
