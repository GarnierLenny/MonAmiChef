import { Injectable } from '@nestjs/common';
import { UserHealthRepository } from '../repositories/user-health.repository';

export interface MacroNutrition {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface DayMacros {
  day: string;
  macros: MacroNutrition;
}

@Injectable()
export class UserHealthService {
  constructor(private readonly userHealthRepository: UserHealthRepository) {}

  /**
   * Calculate today's macros from user's meal plan
   */
  async calculateTodayMacros(userId: string): Promise<MacroNutrition> {
    const today = new Date();
    const weekStart = this.getWeekStart(today);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    try {
      // Find user's meal plan for this week
      const mealPlan = await this.userHealthRepository.findMealPlanForWeek(
        userId,
        weekStart,
      );

      if (!mealPlan || !mealPlan.items.length) {
        return { protein: 0, carbs: 0, fat: 0, calories: 0 };
      }

      // Filter items for today
      const todayItems = mealPlan.items.filter((item) => item.day === dayOfWeek);

      // Sum nutrition from all recipes for today
      const totalMacros = { protein: 0, carbs: 0, fat: 0, calories: 0 };

      for (const item of todayItems) {
        if (item.recipe && item.recipe.nutrition) {
          const nutrition = this.parseNutrition(item.recipe.nutrition);
          if (nutrition) {
            totalMacros.protein += nutrition.protein || 0;
            totalMacros.carbs += nutrition.carbs || 0;
            totalMacros.fat += nutrition.fat || 0;
            totalMacros.calories += nutrition.calories || 0;
          }
        }
      }

      return totalMacros;
    } catch (error) {
      console.error("Error calculating today's macros:", error);
      return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    }
  }

  /**
   * Calculate this week's daily macros from user's meal plan
   */
  async calculateWeekMacros(userId: string): Promise<DayMacros[]> {
    const today = new Date();
    const weekStart = this.getWeekStart(today);

    try {
      // Find user's meal plan for this week
      const mealPlan = await this.userHealthRepository.findMealPlanForWeek(
        userId,
        weekStart,
      );

      const weekMacros: DayMacros[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let day = 0; day < 7; day++) {
        const dayMacros = { protein: 0, carbs: 0, fat: 0, calories: 0 };

        if (mealPlan) {
          const dayItems = mealPlan.items.filter((item) => item.day === day);

          for (const item of dayItems) {
            if (item.recipe && item.recipe.nutrition) {
              const nutrition = this.parseNutrition(item.recipe.nutrition);
              if (nutrition) {
                dayMacros.protein += nutrition.protein || 0;
                dayMacros.carbs += nutrition.carbs || 0;
                dayMacros.fat += nutrition.fat || 0;
                dayMacros.calories += nutrition.calories || 0;
              }
            }
          }
        }

        weekMacros.push({
          day: dayNames[day],
          macros: dayMacros,
        });
      }

      return weekMacros;
    } catch (error) {
      console.error('Error calculating week macros:', error);
      return Array.from({ length: 7 }, (_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
      }));
    }
  }

  /**
   * Parse nutrition data from recipe JSON
   * This handles different possible formats of nutrition data
   */
  private parseNutrition(nutritionJson: any): MacroNutrition | null {
    if (!nutritionJson || typeof nutritionJson !== 'object') {
      return null;
    }

    try {
      // Handle different possible nutrition formats
      let nutrition = nutritionJson;

      // If it's a string, try to parse it
      if (typeof nutritionJson === 'string') {
        nutrition = JSON.parse(nutritionJson);
      }

      // Extract macro values with fallbacks for different property names
      const protein = this.extractNutrientValue(nutrition, [
        'protein',
        'proteins',
        'protein_g',
        'proteinGrams',
      ]);

      const carbs = this.extractNutrientValue(nutrition, [
        'carbs',
        'carbohydrates',
        'carbs_g',
        'carbsGrams',
        'carbohydrate',
      ]);

      const fat = this.extractNutrientValue(nutrition, [
        'fat',
        'fats',
        'fat_g',
        'fatGrams',
        'totalFat',
      ]);

      const calories = this.extractNutrientValue(nutrition, [
        'calories',
        'kcal',
        'energy',
        'calorie',
        'totalCalories',
      ]);

      return {
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        calories: calories || 0,
      };
    } catch (error) {
      console.error('Error parsing nutrition data:', error, nutritionJson);
      return null;
    }
  }

  /**
   * Extract nutrient value from nutrition object using various possible property names
   */
  private extractNutrientValue(nutrition: any, possibleKeys: string[]): number {
    for (const key of possibleKeys) {
      if (nutrition[key] !== undefined && nutrition[key] !== null) {
        const value = parseFloat(nutrition[key]);
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    return 0;
  }

  /**
   * Get the start of the week (Sunday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}
