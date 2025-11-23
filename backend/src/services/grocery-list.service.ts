import { Injectable } from '@nestjs/common';
import { GroceryListRepository } from '../repositories/grocery-list.repository';
import type {
  GroceryListResponse,
  AddMealsRequest,
  AddCustomItemRequest,
  UpdateCustomItemRequest,
  CategoryIngredients,
  AggregatedIngredient,
  ParsedIngredient,
} from '../types/groceryList';

@Injectable()
export class GroceryListService {
  constructor(private readonly groceryListRepository: GroceryListRepository) {}

  /**
   * Get or create a grocery list for a user (singleton pattern)
   */
  async getOrCreateGroceryList(userId: string): Promise<GroceryListResponse> {
    try {
      let groceryList = await this.groceryListRepository.findByUserId(userId);

      if (!groceryList) {
        groceryList = await this.groceryListRepository.create(userId);
      }

      // Fetch recipes for all meals (only if there are meals)
      const mealPlanItemIds = groceryList.meals?.map((m) => m.mealPlanItemId) || [];
      const mealPlanItems = mealPlanItemIds.length > 0
        ? await this.groceryListRepository.findMealPlanItemsWithRecipes(mealPlanItemIds)
        : [];

      // Create a map for faster lookup
      const mealPlanItemMap = new Map(mealPlanItems.map((item) => [item.id, item]));

      // Map meals with recipe data, filtering out meals with missing MealPlanItems
      const mealsWithRecipes = groceryList.meals
        .map((meal) => {
          const mealPlanItem = mealPlanItemMap.get(meal.mealPlanItemId);

          // Skip meals where the MealPlanItem no longer exists
          if (!mealPlanItem) {
            console.warn(`GroceryMeal ${meal.id} references non-existent MealPlanItem ${meal.mealPlanItemId}`);
            return null;
          }

          const recipe = mealPlanItem.recipe;

          // Extract ingredients safely
          let ingredients: string[] = [];
          try {
            if (recipe?.content_json) {
              const contentJson = recipe.content_json as any;
              if (contentJson.ingredients && Array.isArray(contentJson.ingredients)) {
                ingredients = contentJson.ingredients;
              }
            }
          } catch (error) {
            console.error(`Error parsing ingredients for recipe ${recipe?.id}:`, error);
          }

          return {
            id: meal.id,
            mealPlanItemId: meal.mealPlanItemId,
            day: meal.day,
            mealSlot: meal.mealSlot,
            recipe: {
              id: recipe?.id || '',
              title: recipe?.title || 'Unknown Recipe',
              ingredients,
            },
            addedAt: meal.addedAt,
          };
        })
        .filter((meal) => meal !== null) as any[];

      // Aggregate ingredients by category
      const aggregatedIngredients = this.aggregateIngredients(mealsWithRecipes);

      return {
        id: groceryList.id,
        userId: groceryList.userId,
        meals: mealsWithRecipes,
        customItems: groceryList.customItems?.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity || undefined,
          category: item.category || undefined,
          checked: item.checked,
          createdAt: item.createdAt,
        })) || [],
        aggregatedIngredients,
        createdAt: groceryList.createdAt,
        updatedAt: groceryList.updatedAt,
      };
    } catch (error) {
      console.error('Error in getOrCreateGroceryList:', error);
      throw error;
    }
  }

  /**
   * Add meals to grocery list
   */
  async addMeals(userId: string, request: AddMealsRequest): Promise<GroceryListResponse> {
    const { mealPlanItemIds } = request;

    // Get or create grocery list
    let groceryList = await this.groceryListRepository.findByUserId(userId);

    if (!groceryList) {
      groceryList = await this.groceryListRepository.create(userId);
    }

    // Fetch meal plan items to get day and mealSlot
    const mealPlanItems = await this.groceryListRepository.findMealPlanItems(
      mealPlanItemIds,
    );

    // Add meals (upsert to avoid duplicates)
    for (const mealPlanItem of mealPlanItems) {
      await this.groceryListRepository.upsertGroceryMeal({
        listId: groceryList.id,
        mealPlanItemId: mealPlanItem.id,
        day: mealPlanItem.day,
        mealSlot: mealPlanItem.mealSlot,
      });
    }

    return this.getOrCreateGroceryList(userId);
  }

  /**
   * Remove a meal from grocery list
   */
  async removeMeal(userId: string, mealPlanItemId: string): Promise<void> {
    const groceryList = await this.groceryListRepository.findByUserId(userId);

    if (!groceryList) return;

    await this.groceryListRepository.deleteGroceryMeals(
      groceryList.id,
      mealPlanItemId,
    );
  }

  /**
   * Add a custom item to grocery list
   */
  async addCustomItem(userId: string, request: AddCustomItemRequest): Promise<any> {
    const groceryList = await this.getOrCreateGroceryListRecord(userId);

    // Auto-detect category if not provided
    const category = request.category || this.categorizeIngredient(request.name);

    const customItem = await this.groceryListRepository.createCustomItem({
      listId: groceryList.id,
      name: request.name,
      quantity: request.quantity,
      category,
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
    updates: UpdateCustomItemRequest,
  ): Promise<any> {
    const groceryList = await this.groceryListRepository.findByUserId(userId);

    if (!groceryList) {
      throw new Error('Grocery list not found');
    }

    // Verify item belongs to user's list
    const existingItem = await this.groceryListRepository.findCustomItem(
      itemId,
      groceryList.id,
    );

    if (!existingItem) {
      throw new Error('Custom item not found');
    }

    const updatedItem = await this.groceryListRepository.updateCustomItem(
      itemId,
      updates,
    );

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
    const groceryList = await this.groceryListRepository.findByUserId(userId);

    if (!groceryList) return;

    await this.groceryListRepository.deleteCustomItems(itemId, groceryList.id);
  }

  /**
   * Clear entire grocery list
   */
  async clearGroceryList(userId: string): Promise<void> {
    const groceryList = await this.groceryListRepository.findByUserId(userId);

    if (!groceryList) return;

    await this.groceryListRepository.deleteGroceryList(groceryList.id);
  }

  /**
   * Helper: Get or create grocery list record (without full response)
   */
  private async getOrCreateGroceryListRecord(userId: string) {
    let groceryList = await this.groceryListRepository.findByUserId(userId);

    if (!groceryList) {
      groceryList = await this.groceryListRepository.create(userId);
    }

    return groceryList;
  }

  /**
   * Aggregate ingredients from multiple meals, group by category
   */
  private aggregateIngredients(meals: any[]): CategoryIngredients[] {
    const ingredientMap = new Map<string, AggregatedIngredient>();

    try {
      // Extract and parse all ingredients
      for (const meal of meals) {
        // Safety check: ensure recipe and ingredients exist
        if (!meal?.recipe?.ingredients || !Array.isArray(meal.recipe.ingredients)) {
          continue;
        }

        for (const ingredient of meal.recipe.ingredients) {
          // Skip null, undefined, or empty ingredients
          if (!ingredient || typeof ingredient !== 'string') {
            continue;
          }

          try {
            const parsed = this.parseIngredient(ingredient);
            const key = parsed.name.toLowerCase();

            if (ingredientMap.has(key)) {
              // Ingredient already exists, merge quantities
              const existing = ingredientMap.get(key)!;
              existing.quantity = this.mergeQuantities(existing.quantity, parsed.quantity);
              if (meal.recipe.id && !existing.recipeIds.includes(meal.recipe.id)) {
                existing.recipeIds.push(meal.recipe.id);
              }
              if (meal.recipe.title && !existing.recipes.includes(meal.recipe.title)) {
                existing.recipes.push(meal.recipe.title);
              }
            } else {
              // New ingredient
              ingredientMap.set(key, {
                name: parsed.name,
                quantity: parsed.quantity,
                recipeIds: meal.recipe.id ? [meal.recipe.id] : [],
                recipes: meal.recipe.title ? [meal.recipe.title] : [],
              });
            }
          } catch (error) {
            console.error(`Error parsing ingredient "${ingredient}":`, error);
            // Continue with next ingredient
          }
        }
      }
    } catch (error) {
      console.error('Error aggregating ingredients:', error);
      // Return empty array on error to prevent complete failure
      return [];
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
    // Remove cooking instructions (anything after comma or in parentheses)
    let cleanedIngredient = ingredient.split(',')[0].trim();
    cleanedIngredient = cleanedIngredient.split('(')[0].trim();

    // Extract quantity and name
    const match = cleanedIngredient.match(
      /^([\d./\s¼½¾⅓⅔⅛⅜⅝⅞]+(?:\s*(?:cup|cups|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|lbs|ounce|ounces|oz|gram|grams|g|kilogram|kilograms|kg|ml|milliliter|milliliters|liter|liters|l|piece|pieces|slice|slices|clove|cloves|can|cans|package|packages|pkg))?)?(.+)$/i,
    );

    if (match) {
      const quantity = match[1]?.trim() || '';
      let name = match[2]?.trim() || cleanedIngredient;

      // Capitalize first letter
      name = name.charAt(0).toUpperCase() + name.slice(1);

      return {
        original: ingredient,
        name,
        quantity: quantity || '1',
      };
    }

    // Fallback: if no match, try simple split
    const simpleParts = cleanedIngredient.split(/\s+/);
    if (simpleParts.length > 1 && /^[\d./¼½¾⅓⅔⅛⅜⅝⅞]+$/.test(simpleParts[0])) {
      return {
        original: ingredient,
        name:
          simpleParts.slice(1).join(' ').charAt(0).toUpperCase() +
          simpleParts.slice(1).join(' ').slice(1),
        quantity: simpleParts[0],
      };
    }

    return {
      original: ingredient,
      name: cleanedIngredient.charAt(0).toUpperCase() + cleanedIngredient.slice(1),
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
