import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CountUp } from "@/components/ui/count-up";
import { ChevronRight, TrendingUp } from "lucide-react";
import { calculateDayProgress } from "./utils";
import type { MealPlan } from "./constants";

interface ProgressCardProps {
  mealPlan: MealPlan;
  currentDay: string;
  onDetailsClick: () => void;
  isMobile?: boolean;
}

export const ProgressCard = ({
  mealPlan,
  currentDay,
  onDetailsClick,
  isMobile = false,
}: ProgressCardProps) => {
  const dayProgress = calculateDayProgress(mealPlan, currentDay);
  const hasMeals = Object.keys(mealPlan[currentDay] || {}).length > 0;

  return (
    <Card
      className={`border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow ${
        isMobile ? "border-2" : ""
      }`}
      onClick={onDetailsClick}
    >
      <CardContent className="p-4">
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

