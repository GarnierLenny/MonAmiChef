import { TrendingUp, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { UserGoals, DashboardData } from "../../lib/api/healthApi";

interface TodayProgressProps {
  goals: UserGoals;
  dashboardData?: DashboardData;
  isLoading?: boolean;
  onViewMealPlan: () => void;
}

export const TodayProgress = ({
  goals,
  dashboardData,
  isLoading,
  onViewMealPlan,
}: TodayProgressProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  const todayMacros = dashboardData?.todayMacros || {
    protein: { current: 0, goal: goals.daily_protein_goal || 0 },
    carbs: { current: 0, goal: goals.daily_carbs_goal || 0 },
    fat: { current: 0, goal: goals.daily_fat_goal || 0 },
    calories: { current: 0, goal: goals.daily_calories_goal || 0 },
  };

  const calculatePercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const formatNumber = (num: number) => Math.round(num);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Tosday's Progress
            </h3>
            <p className="text-gray-600 text-sm">
              Your nutrition intake vs goals
            </p>
          </div>
        </div>
        <button
          onClick={onViewMealPlan}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4" />
          View Meal Plan
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Goals Not Set Warning */}
      {todayMacros.calories.goal === 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-orange-700 mb-2">
              No calorie goals set yet
            </p>
            <button
              onClick={() => (window.location.href = "/calories")}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 underline"
            >
              Calculate your daily goals →
            </button>
          </div>
        </div>
      )}

      {/* Progress Section */}
      <div className="space-y-4">
        {/* Calories */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Calories</span>
            <span className="text-sm text-gray-600">
              {formatNumber(todayMacros.calories.current)} /{" "}
              {formatNumber(todayMacros.calories.goal)}
            </span>
          </div>
          <Progress
            value={calculatePercentage(
              todayMacros.calories.current,
              todayMacros.calories.goal,
            )}
            className="h-2 bg-gray-200"
          />
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          {/* Protein */}
          <div className="text-center">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Protein</div>
              <div className="text-lg font-bold text-red-600">
                {formatNumber(todayMacros.protein.current)}g
              </div>
              <Progress
                value={calculatePercentage(
                  todayMacros.protein.current,
                  todayMacros.protein.goal,
                )}
                className="h-2 bg-gray-200"
              />
              <div className="text-xs text-gray-500">
                of {formatNumber(todayMacros.protein.goal)}g
              </div>
            </div>
          </div>

          {/* Carbs */}
          <div className="text-center">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Carbs</div>
              <div className="text-lg font-bold text-blue-600">
                {formatNumber(todayMacros.carbs.current)}g
              </div>
              <Progress
                value={calculatePercentage(
                  todayMacros.carbs.current,
                  todayMacros.carbs.goal,
                )}
                className="h-2 bg-gray-200"
              />
              <div className="text-xs text-gray-500">
                of {formatNumber(todayMacros.carbs.goal)}g
              </div>
            </div>
          </div>

          {/* Fat */}
          <div className="text-center">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700">Fat</div>
              <div className="text-lg font-bold text-yellow-600">
                {formatNumber(todayMacros.fat.current)}g
              </div>
              <Progress
                value={calculatePercentage(
                  todayMacros.fat.current,
                  todayMacros.fat.goal,
                )}
                className="h-2 bg-gray-200"
              />
              <div className="text-xs text-gray-500">
                of {formatNumber(todayMacros.fat.goal)}g
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {todayMacros.calories.current === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            <p>No meals logged for today.</p>
            {todayMacros.calories.goal === 0 ? (
              <button
                onClick={() => (window.location.href = "/calories")}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Set your goals first →
              </button>
            ) : (
              <button
                onClick={onViewMealPlan}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Start planning your meals →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

