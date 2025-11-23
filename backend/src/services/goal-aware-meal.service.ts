import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

interface UserGoals {
  id: string;
  profile_id: string;
  target_weight: any | null; // Decimal from Prisma
  target_body_fat: any | null; // Decimal from Prisma
  daily_protein_goal: number | null;
  daily_carbs_goal: number | null;
  daily_fat_goal: number | null;
  daily_calories_goal: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface GoalContext {
  hasGoals: boolean;
  goalMessage: string;
}

@Injectable()
export class GoalAwareMealService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get goal context for meal generation based on user's current progress and targets
   */
  async getGoalContext(userId: string, day: string): Promise<GoalContext> {
    try {
      // Get user's goals
      const userGoals = await this.getUserGoals(userId);

      if (!userGoals) {
        return {
          hasGoals: false,
          goalMessage: '',
        };
      }

      // Create simple goal message with calorie guidance
      const goalParts = [];
      if (userGoals.daily_calories_goal) goalParts.push(`${userGoals.daily_calories_goal} calories`);
      if (userGoals.daily_protein_goal) goalParts.push(`${userGoals.daily_protein_goal}g protein`);
      if (userGoals.daily_carbs_goal) goalParts.push(`${userGoals.daily_carbs_goal}g carbs`);
      if (userGoals.daily_fat_goal) goalParts.push(`${userGoals.daily_fat_goal}g fat`);

      let goalMessage = '';
      if (goalParts.length > 0) {
        goalMessage = `The user has daily goals: ${goalParts.join(', ')}. `;

        // Add specific calorie guidance based on meal type
        if (userGoals.daily_calories_goal) {
          const dailyCalories = userGoals.daily_calories_goal;
          const targetCalories = Math.round(dailyCalories * 0.33); // ~33% of daily calories per main meal
          goalMessage += `CRITICAL: This meal MUST contain approximately ${targetCalories} calories. This is NOT optional - it's required to help the user reach their ${dailyCalories} daily calorie goal. `;
        }

        goalMessage +=
          'SERVING SIZE CONSTRAINT: Always set servings = 1. To reach the calorie target, use calorie-dense ingredients (nuts, oils, dairy, proteins), larger portions, and multiple dishes. Examples: avocado toast + protein smoothie + fruit, or salmon + quinoa + vegetables with olive oil. The meal should be filling and substantial for ONE person.';
      }

      return {
        hasGoals: true,
        goalMessage,
      };
    } catch (error) {
      console.error('Error getting goal context:', error);
      return {
        hasGoals: false,
        goalMessage: '',
      };
    }
  }

  /**
   * Get user's goals from database
   */
  private async getUserGoals(userId: string): Promise<UserGoals | null> {
    try {
      const goals = await this.prisma.userGoals.findUnique({
        where: { profile_id: userId },
      });
      return goals;
    } catch (error) {
      console.error('Error fetching user goals:', error);
      return null;
    }
  }
}
