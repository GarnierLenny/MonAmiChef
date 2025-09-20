import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Utensils, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { DonutChart } from "./DonutChart";
import { calculateDayProgress, getProgressStatus, getMacroBadgeClass, getMacroProgressClass } from "./utils";
import type { MealPlan } from "./constants";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  mealPlan: MealPlan;
  currentDay: string;
}

export const ProgressModal = ({
  isOpen,
  onClose,
  mealPlan,
  currentDay,
}: ProgressModalProps) => {
  const dayProgress = calculateDayProgress(mealPlan, currentDay);
  const hasMeals = Object.keys(mealPlan[currentDay] || {}).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-sm max-w-sm w-[calc(100vw-2rem)] pb-7 max-h-[85dvh] mx-auto overflow-hidden border-none shadow-lg focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Progress Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-80 overflow-y-auto">
          {!hasMeals ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">
                No Progress Yet
              </h3>
              <p className="text-sm text-gray-500">
                Add meals to track your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Calories Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Calories</h3>
                </div>
                <div className="flex items-center gap-4">
                  <DonutChart
                    percentage={dayProgress.calories.percentage}
                    size={60}
                    strokeWidth={6}
                  />
                  <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Consumed</p>
                      <p className="font-semibold text-gray-900">
                        {dayProgress.calories.used}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Goal</p>
                      <p className="font-semibold text-gray-900">
                        {dayProgress.calories.goal}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Left</p>
                      <p
                        className={`font-semibold ${getProgressStatus(dayProgress.calories.percentage).color}`}
                      >
                        {Math.max(
                          0,
                          dayProgress.calories.goal - dayProgress.calories.used
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macros Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Macros</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { key: "protein", label: "Protein" },
                    { key: "carbs", label: "Carbs" },
                    { key: "fat", label: "Fat" },
                  ].map(({ key, label }) => {
                    const macro = dayProgress[key as keyof typeof dayProgress];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "w-6 h-6 p-0 flex items-center justify-center text-xs shrink-0",
                            getMacroBadgeClass(key as "protein" | "carbs" | "fat")
                          )}
                        >
                          {key.charAt(0).toUpperCase()}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {macro.used}g / {macro.goal}g
                            </span>
                          </div>
                          <Progress
                            value={Math.min(macro.percentage, 100)}
                            className={cn(
                              "h-2",
                              getMacroProgressClass(key as "protein" | "carbs" | "fat")
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};