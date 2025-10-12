import { PrismaClient } from '@prisma/client';
import type {
  GroceryListResponse,
  AddMealsRequest,
  AddCustomItemRequest,
  UpdateCustomItemRequest,
  CategoryIngredients,
  AggregatedIngredient,
  ParsedIngredient,
} from '../types/groceryList';

const prisma = new PrismaClient();

export class GroceryListService {
  /**
   * Get or create a grocery list for a user (singleton pattern)
   */
  async getOrCreateGroceryList(userId: string): Promise<GroceryListResponse> {
    let groceryList = await prisma.groceryList.findUnique({
      where: { userId },
      include: {
        meals: true,
        customItems: true,
      },
    });

    if (!groceryList) {
      groceryList = await prisma.groceryList.create({
        data: { userId },
        include: {
          meals: true,
          customItems: true,
        },
      });
    }

    // Fetch recipes for all meals
    const mealPlanItemIds = groceryList.meals.map((m) => m.mealPlanItemId);
    const mealPlanItems = await prisma.mealPlanItem.findMany({
      where: {
        id: { in: mealPlanItemIds },
      },
      include: {
        recipe: true,
      },
    });

    // Map meals with recipe data
    const mealsWithRecipes = groceryList.meals.map((meal) => {
      const mealPlanItem = mealPlanItems.find((mpi) => mpi.id === meal.mealPlanItemId);
      const recipe = mealPlanItem?.recipe;

      return {
        id: meal.id,
        mealPlanItemId: meal.mealPlanItemId,
        day: meal.day,
        mealSlot: meal.mealSlot,
        recipe: {
          id: recipe?.id || '',
          title: recipe?.title || 'Unknown Recipe',
          ingredients: recipe?.content_json
            ? ((recipe.content_json as any).ingredients as string[]) || []
            : [],
        },
        addedAt: meal.addedAt,
      };
    });

    // Aggregate ingredients by category
    const aggregatedIngredients = this.aggregateIngredients(mealsWithRecipes);

    return {
      id: groceryList.id,
      userId: groceryList.userId,
      meals: mealsWithRecipes,
      customItems: groceryList.customItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity || undefined,
        category: item.category || undefined,
        checked: item.checked,
        createdAt: item.createdAt,
      })),
      aggregatedIngredients,
      createdAt: groceryList.createdAt,
      updatedAt: groceryList.updatedAt,
    };
  }

  /**
   * Add meals to grocery list
   */
  async addMeals(userId: string, request: AddMealsRequest): Promise<GroceryListResponse> {
    const { mealPlanItemIds } = request;

    // Get or create grocery list
    let groceryList = await prisma.groceryList.findUnique({
      where: { userId },
    });

    if (!groceryList) {
      groceryList = await prisma.groceryList.create({
        data: { userId },
      });
    }

    // Fetch meal plan items to get day and mealSlot
    const mealPlanItems = await prisma.mealPlanItem.findMany({
      where: {
        id: { in: mealPlanItemIds },
      },
    });

    // Add meals (upsert to avoid duplicates)
    for (const mealPlanItem of mealPlanItems) {
      await prisma.groceryMeal.upsert({
        where: {
          listId_mealPlanItemId: {
            listId: groceryList.id,
            mealPlanItemId: mealPlanItem.id,
          },
        },
        create: {
          listId: groceryList.id,
          mealPlanItemId: mealPlanItem.id,
          day: mealPlanItem.day,
          mealSlot: mealPlanItem.mealSlot,
        },
        update: {}, // No update needed if already exists
      });
    }

    return this.getOrCreateGroceryList(userId);
  }

  /**
   * Remove a meal from grocery list
   */
  async removeMeal(userId: string, mealPlanItemId: string): Promise<void> {
    const groceryList = await prisma.groceryList.findUnique({
      where: { userId },
    });

    if (!groceryList) return;

    await prisma.groceryMeal.deleteMany({
      where: {
        listId: groceryList.id,
        mealPlanItemId,
      },
    });
  }

  /**
   * Add a custom item to grocery list
   */
  async addCustomItem(userId: string, request: AddCustomItemRequest): Promise<any> {
    const groceryList = await this.getOrCreateGroceryListRecord(userId);

    // Auto-detect category if not provided
    const category = request.category || this.categorizeIngredient(request.name);

    const customItem = await prisma.customGroceryItem.create({
      data: {
        listId: groceryList.id,
        name: request.name,
        quantity: request.quantity,
        category,
      },
    });

    return {
      id: customItem.id,
      name: customItem.name,
      quantity: customItem.quantity || undefined,
      category: customItem.category || undefined,
      checked: customItem.checked,
      createdAt: customItem.createdAt,
    };
  }

  /**
   * Update a custom item
   */
  async updateCustomItem(
    userId: string,
    itemId: string,
    updates: UpdateCustomItemRequest
  ): Promise<any> {
    const groceryList = await prisma.groceryList.findUnique({
      where: { userId },
    });

    if (!groceryList) {
      throw new Error('Grocery list not found');
    }

    // Verify item belongs to user's list
    const existingItem = await prisma.customGroceryItem.findFirst({
      where: {
        id: itemId,
        listId: groceryList.id,
      },
    });

    if (!existingItem) {
      throw new Error('Custom item not found');
    }

    const updatedItem = await prisma.customGroceryItem.update({
      where: { id: itemId },
      data: updates,
    });

    return {
      id: updatedItem.id,
      name: updatedItem.name,
      quantity: updatedItem.quantity || undefined,
      category: updatedItem.category || undefined,
      checked: updatedItem.checked,
      createdAt: updatedItem.createdAt,
    };
  }

  /**
   * Delete a custom item
   */
  async deleteCustomItem(userId: string, itemId: string): Promise<void> {
    const groceryList = await prisma.groceryList.findUnique({
      where: { userId },
    });

    if (!groceryList) return;

    await prisma.customGroceryItem.deleteMany({
      where: {
        id: itemId,
        listId: groceryList.id,
      },
    });
  }

  /**
   * Clear entire grocery list
   */
  async clearGroceryList(userId: string): Promise<void> {
    const groceryList = await prisma.groceryList.findUnique({
      where: { userId },
    });

    if (!groceryList) return;

    // Delete all meals and custom items (cascade will handle this)
    await prisma.groceryList.delete({
      where: { id: groceryList.id },
    });
  }

  /**
   * Helper: Get or create grocery list record (without full response)
   */
  private async getOrCreateGroceryListRecord(userId: string) {
    let groceryList = await prisma.groceryList.findUnique({
      where: { userId },
    });

    if (!groceryList) {
      groceryList = await prisma.groceryList.create({
        data: { userId },
      });
    }

    return groceryList;
  }

  /**
   * Aggregate ingredients from multiple meals, group by category
   */
  private aggregateIngredients(meals: any[]): CategoryIngredients[] {
    const ingredientMap = new Map<string, AggregatedIngredient>();

    // Extract and parse all ingredients
    for (const meal of meals) {
      for (const ingredient of meal.recipe.ingredients) {
        const parsed = this.parseIngredient(ingredient);
        const key = parsed.name.toLowerCase();

        if (ingredientMap.has(key)) {
          // Ingredient already exists, merge quantities
          const existing = ingredientMap.get(key)!;
          existing.quantity = this.mergeQuantities(existing.quantity, parsed.quantity);
          existing.recipeIds.push(meal.recipe.id);
          existing.recipes.push(meal.recipe.title);
        } else {
          // New ingredient
          ingredientMap.set(key, {
            name: parsed.name,
            quantity: parsed.quantity,
            recipeIds: [meal.recipe.id],
            recipes: [meal.recipe.title],
          });
        }
      }
    }

    // Group by category
    const categories = new Map<string, AggregatedIngredient[]>();

    for (const ingredient of ingredientMap.values()) {
      const category = this.categorizeIngredient(ingredient.name);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(ingredient);
    }

    // Convert to array and sort
    const categoryList: CategoryIngredients[] = [];
    const categoryOrder = ['produce', 'protein', 'dairy', 'grains', 'spices', 'other'];

    for (const category of categoryOrder) {
      if (categories.has(category)) {
        categoryList.push({
          category,
          emoji: this.getCategoryEmoji(category),
          items: categories.get(category)!.sort((a, b) => a.name.localeCompare(b.name)),
        });
      }
    }

    // Add any remaining categories not in the order
    for (const [category, items] of categories.entries()) {
      if (!categoryOrder.includes(category)) {
        categoryList.push({
          category,
          emoji: this.getCategoryEmoji(category),
          items: items.sort((a, b) => a.name.localeCompare(b.name)),
        });
      }
    }

    return categoryList;
  }

  /**
   * Parse ingredient string to extract name and quantity
   */
  private parseIngredient(ingredient: string): ParsedIngredient {
    // Simple parsing - can be enhanced later
    const match = ingredient.match(/^([\d./\s]+)?(.+)$/);
    if (match) {
      const quantity = match[1]?.trim() || '';
      const name = match[2]?.trim() || ingredient;
      return {
        original: ingredient,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        quantity: quantity || '1',
      };
    }

    return {
      original: ingredient,
      name: ingredient,
      quantity: '1',
    };
  }

  /**
   * Merge two quantity strings (simple addition for now)
   */
  private mergeQuantities(qty1: string, qty2: string): string {
    // Try to extract numbers and add them
    const num1 = parseFloat(qty1) || 0;
    const num2 = parseFloat(qty2) || 0;

    if (num1 > 0 && num2 > 0) {
      return (num1 + num2).toString();
    }

    // If can't parse, just concatenate
    return `${qty1}, ${qty2}`;
  }

  /**
   * Categorize an ingredient based on its name
   */
  private categorizeIngredient(name: string): string {
    const lowerName = name.toLowerCase();

    const categories: Record<string, string[]> = {
      produce: [
        'tomato',
        'lettuce',
        'onion',
        'garlic',
        'carrot',
        'celery',
        'potato',
        'pepper',
        'cucumber',
        'spinach',
        'broccoli',
        'cauliflower',
        'cabbage',
        'mushroom',
        'zucchini',
        'eggplant',
        'asparagus',
        'avocado',
        'lemon',
        'lime',
        'apple',
        'banana',
        'orange',
        'berry',
        'strawberry',
        'blueberry',
        'cilantro',
        'parsley',
        'basil',
        'thyme',
        'rosemary',
      ],
      protein: [
        'chicken',
        'beef',
        'pork',
        'fish',
        'salmon',
        'tuna',
        'shrimp',
        'egg',
        'tofu',
        'tempeh',
        'lentil',
        'bean',
        'chickpea',
        'turkey',
        'lamb',
        'bacon',
        'sausage',
      ],
      dairy: [
        'milk',
        'cheese',
        'yogurt',
        'butter',
        'cream',
        'sour cream',
        'mozzarella',
        'parmesan',
        'cheddar',
        'feta',
        'ricotta',
      ],
      grains: [
        'rice',
        'pasta',
        'bread',
        'flour',
        'oat',
        'quinoa',
        'couscous',
        'barley',
        'tortilla',
        'noodle',
      ],
      spices: [
        'salt',
        'pepper',
        'paprika',
        'cumin',
        'oregano',
        'cinnamon',
        'chili',
        'curry',
        'turmeric',
        'ginger',
        'coriander',
        'nutmeg',
      ],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword)) {
          return category;
        }
      }
    }

    return 'other';
  }

  /**
   * Get emoji for category
   */
  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      produce: '🥬',
      protein: '🥩',
      dairy: '🥛',
      grains: '🌾',
      spices: '🧂',
      other: '📦',
    };

    return emojis[category] || '📦';
  }
}

export const groceryListService = new GroceryListService();
