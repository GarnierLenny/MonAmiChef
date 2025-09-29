import { Target, Edit, Loader2 } from "lucide-react";
import type { UserGoals } from "../../lib/api/healthApi";

interface UserGoalsSectionProps {
  goals: UserGoals;
  isLoading?: boolean;
  onEditGoals: () => void;
}

export const UserGoalsSection = ({ goals, isLoading, onEditGoals }: UserGoalsSectionProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nutrition Goals</h3>
            <p className="text-gray-600 text-sm">Your daily targets</p>
          </div>
        </div>
        <button
          onClick={onEditGoals}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Calories */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {goals.daily_calories_goal || 0}
            </div>
            <div className="text-gray-600 text-sm">Calories</div>
          </div>
        </div>

        {/* Protein */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border border-red-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {goals.daily_protein_goal || 0}g
            </div>
            <div className="text-gray-600 text-sm">Protein</div>
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {goals.daily_carbs_goal || 0}g
            </div>
            <div className="text-gray-600 text-sm">Carbs</div>
          </div>
        </div>

        {/* Fat */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {goals.daily_fat_goal || 0}g
            </div>
            <div className="text-gray-600 text-sm">Fat</div>
          </div>
        </div>
      </div>

      {/* Weight Goals (if set) */}
      {(goals.target_weight || goals.target_body_fat) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Weight Goals</h4>
          <div className="grid grid-cols-2 gap-4">
            {goals.target_weight && (
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 mb-1">
                  {goals.target_weight} kg
                </div>
                <div className="text-gray-600 text-sm">Target Weight</div>
              </div>
            )}
            {goals.target_body_fat && (
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600 mb-1">
                  {goals.target_body_fat}%
                </div>
                <div className="text-gray-600 text-sm">Target Body Fat</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};