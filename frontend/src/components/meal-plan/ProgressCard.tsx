// Import UI components
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "./MealPlanProgressBar";
import { CountUp } from "@/components/ui/count-up";

// Import icons
import { ChevronRight, TrendingUp, Target, Calculator } from "lucide-react";

// Import utilities and types
import { calculateDayProgress } from "./utils";
import type { MealPlan, MealSlot } from "./constants";
import type { UserGoals } from "../../lib/api/healthApi";

// Import i18n for translations
import { useTranslation } from "react-i18next";

/**
 * Props interface for ProgressCard component
 */
interface ProgressCardProps {
  mealPlan: MealPlan; // Complete meal plan data for the week
  currentDay: string; // Current day identifier (e.g., "monday")
  onDetailsClick: () => void; // Handler for clicking to view detailed progress
  isMobile?: boolean; // Flag for mobile-optimized rendering
  userGoals?: UserGoals | null; // User's nutritional goals (optional)
  selectedMeals?: Set<string>; // Set of selected meal slot identifiers
}

/**
 * ProgressCard Component
 *
 * Displays daily caloric progress with a visual progress bar.
 * Shows current calories consumed vs. goal, with animated count-up numbers.
 * If user has no goals set, displays a call-to-action to set goals instead.
 */
export const ProgressCard = ({
  mealPlan,
  currentDay,
  onDetailsClick,
  isMobile = false,
  userGoals,
  selectedMeals = new Set(),
}: ProgressCardProps) => {
  // Get translation function
  const { t } = useTranslation();

  // Check if user has valid calorie goals set
  const hasGoals =
    userGoals &&
    userGoals.daily_calories_goal &&
    userGoals.daily_calories_goal > 0;

  // Calculate progress for the current day
  const dayProgress = calculateDayProgress(mealPlan, currentDay, userGoals);
  const hasMeals = Object.keys(mealPlan[currentDay] || {}).length > 0;

  // Filter selected meals for current day only
  const selectedMealSlots = Array.from(selectedMeals)
    .filter((key) => key.startsWith(currentDay))
    .map((key) => key.split("-")[1] as MealSlot);

  /**
   * Get meal summary for a specific slot
   * Returns calories and status (added, selected, not-selected)
   */
  const getMealSummary = (slot: MealSlot) => {
    const meal = mealPlan[currentDay]?.[slot];
    const isSelected = selectedMealSlots.includes(slot);

    if (meal) {
      return { calories: meal.calories, status: "added" };
    } else if (isSelected) {
      return { calories: 0, status: "selected" };
    }
    return { calories: 0, status: "not-selected" };
  };

  // Pre-calculate meal summaries for all meal slots
  const breakfastSummary = getMealSummary("breakfast");
  const lunchSummary = getMealSummary("lunch");
  const dinnerSummary = getMealSummary("dinner");

  // If no goals are set, show CTA (Call-To-Action) card
  if (!hasGoals) {
    return (
      <Card
        className={`border border-orange-200/50 rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm hover:scale-[1.01] shadow-sm ${
          isMobile ? "border-2" : ""
        }`}
        onClick={() => (window.location.href = "/calories")}
      >
        <CardContent className="px-4">
          {/* Header with title and target icon */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`font-bold text-gray-900 ${isMobile ? "text-sm" : "text-lg"}`}
            >
              {t('mealPlan.setYourGoals')}
            </h2>
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-2 rounded-lg">
              <Target
                className={`text-orange-600 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
              />
            </div>
          </div>

          {/* Description and CTA button */}
          <div className="flex items-center justify-between">
            <p
              className={`text-gray-600 flex-1 font-medium ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {t('mealPlan.trackNutritionProgress')}
            </p>

            {/* Gradient button with calculator icon */}
            <div className="inline-flex items-center gap-1.5 py-2 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg text-xs font-semibold ml-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95">
              <Calculator className="w-3.5 h-3.5" />
              {isMobile ? t('mealPlan.setGoals') : t('mealPlan.calculate')}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main progress card - shows calories consumed vs goal
  return (
    <Card
      className={`rounded-xl border border-orange-100/50 py-[4px] bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg cursor-pointer transition-all duration-200 hover:scale-[1.01]`}
      onClick={onDetailsClick}
    >
      <CardContent className="px-2">
        <div className="flex items-center justify-between">
          {/* Left side - Current calories consumed (green to indicate progress) */}
          <div className="text-left">
            <CountUp
              end={dayProgress.calories.used}
              duration={600}
              suffix={` ${t('mealPlan.cal')}`}
              className="text-sm font-bold text-green-600"
            />
          </div>

          {/* Center - Visual progress bar showing percentage of goal reached */}
          <div className="flex-1 mx-6">
            <Progress
              value={Math.min(dayProgress.calories.percentage, 100)}
              // Note: Progress bar capped at 100% even if exceeded
            />
          </div>

          {/* Right side - Goal calories (gray to indicate target) */}
          <div className="text-right">
            <CountUp
              end={dayProgress.calories.goal}
              duration={600}
              suffix={` ${t('mealPlan.cal')}`}
              className="text-sm font-semibold text-gray-600"
            />
          </div>

          {/* Chevron icon to indicate card is clickable for more details */}
          <ChevronRight
            className={`text-gray-400 ml-4 transition-transform group-hover:translate-x-1 ${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
