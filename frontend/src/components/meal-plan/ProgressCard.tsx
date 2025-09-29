import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CountUp } from "@/components/ui/count-up";
import { ChevronRight, TrendingUp, Target, Calculator } from "lucide-react";
import { calculateDayProgress } from "./utils";
import type { MealPlan } from "./constants";
import type { UserGoals } from "../../lib/api/healthApi";

interface ProgressCardProps {
  mealPlan: MealPlan;
  currentDay: string;
  onDetailsClick: () => void;
  isMobile?: boolean;
  userGoals?: UserGoals | null;
}

export const ProgressCard = ({
  mealPlan,
  currentDay,
  onDetailsClick,
  isMobile = false,
  userGoals,
}: ProgressCardProps) => {
  const hasGoals =
    userGoals &&
    userGoals.daily_calories_goal &&
    userGoals.daily_calories_goal > 0;
  const dayProgress = calculateDayProgress(mealPlan, currentDay, userGoals);
  const hasMeals = Object.keys(mealPlan[currentDay] || {}).length > 0;

  // If no goals are set, show CTA card
  if (!hasGoals) {
    return (
      <Card
        className={`border border-orange-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r from-orange-50 to-pink-50 ${
          isMobile ? "border-2" : ""
        }`}
        onClick={() => (window.location.href = "/calories")}
      >
        <CardContent className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2
              className={`font-semibold text-gray-900 ${isMobile ? "text-sm" : "text-lg"}`}
            >
              Set Your Goals
            </h2>
            <Target
              className={`text-orange-500 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
            />
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`text-gray-600 flex-1 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              Track your nutrition progress
            </p>

            <div className="inline-flex items-center gap-1 py-2 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-xs font-medium ml-3">
              <Calculator className="w-3 h-3" />
              {isMobile ? "Set Goals" : "Calculate"}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow ${
        isMobile ? "border-2" : ""
      }`}
      onClick={onDetailsClick}
    >
      <CardContent className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`font-semibold text-gray-900 ${isMobile ? "text-sm" : "text-lg"}`}
          >
            Today's Progress
          </h2>
          <ChevronRight
            className={`text-gray-400 ${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left side - Current calories */}
          <div className="text-left">
            <CountUp
              end={dayProgress.calories.used}
              duration={600}
              suffix=" cal"
              className="text-sm font-semibold text-green-600"
            />
          </div>

          {/* Center - Progress bar */}
          <div className="flex-1 mx-6">
            <Progress
              value={Math.min(dayProgress.calories.percentage, 100)}
              className="h-3 bg-gray-200 progress-calories"
            />
          </div>

          {/* Right side - Goal calories */}
          <div className="text-right">
            <CountUp
              end={dayProgress.calories.goal}
              duration={600}
              suffix=" cal"
              className="text-sm font-medium text-gray-600"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
