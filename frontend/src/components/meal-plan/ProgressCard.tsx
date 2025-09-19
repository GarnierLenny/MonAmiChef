import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DonutChart } from "./DonutChart";
import { calculateDayProgress, getMacroProgressClass, getMacroBadgeClass } from "./utils";
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
          <h2 className={`font-semibold text-gray-900 ${isMobile ? "text-sm" : "text-lg"}`}>
            Today's Progress
          </h2>
          <ChevronRight className={`text-gray-400 ${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
        </div>

        {!hasMeals ? (
          <div className={`text-center ${isMobile ? "py-4" : "py-6"}`}>
            <TrendingUp className={`mx-auto mb-3 text-gray-400 ${isMobile ? "w-8 h-8 mb-2" : "w-12 h-12"}`} />
            <p className={`text-gray-500 ${isMobile ? "text-sm" : ""}`}>
              No meals yet — add breakfast to start tracking
            </p>
          </div>
        ) : (
          <div className={`flex items-center ${isMobile ? "gap-4" : "gap-8"}`}>
            {/* Calories Donut */}
            <div className="flex-shrink-0">
              <DonutChart
                percentage={dayProgress.calories.percentage}
                size={isMobile ? 64 : 80}
                strokeWidth={isMobile ? 6 : 8}
              />
              <div className={`text-center ${isMobile ? "mt-1" : "mt-2"}`}>
                <p className={`text-gray-600 ${isMobile ? "text-xs" : "text-sm"}`}>
                  {dayProgress.calories.used}/{dayProgress.calories.goal} cal
                </p>
              </div>
            </div>

            {/* Macro Bars */}
            <div className={`flex-1 ${isMobile ? "space-y-2" : "space-y-3"}`}>
              {[
                { key: "protein", label: "P" },
                { key: "carbs", label: "C" },
                { key: "fat", label: "F" },
              ].map(({ key, label }) => {
                const macro = dayProgress[key as keyof typeof dayProgress];
                return (
                  <div key={key} className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`}>
                    {isMobile ? (
                      <Badge
                        className={cn(
                          "w-6 h-6 p-0 flex items-center justify-center text-xs",
                          getMacroBadgeClass(key as "protein" | "carbs" | "fat")
                        )}
                      >
                        {label}
                      </Badge>
                    ) : (
                      <span className="text-sm font-medium text-gray-600 w-4">
                        {label}
                      </span>
                    )}
                    <Progress
                      value={Math.min(macro.percentage, 100)}
                      className={cn(
                        `flex-1 ${isMobile ? "h-2" : "h-2.5"}`,
                        getMacroProgressClass(key as "protein" | "carbs" | "fat")
                      )}
                    />
                    <span className={`text-gray-600 text-right ${isMobile ? "text-xs w-8" : "text-sm w-12"}`}>
                      {macro.percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};