import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Sparkles, User, Clock, Zap } from "lucide-react";
import { getGradeStyles } from "./utils";
import type { Meal, MealSlot } from "./constants";

interface SimpleMealCardProps {
  mealSlot: MealSlot;
  meal?: Meal;
  onGenerate: () => void;
  onSaved: () => void;
  isGenerating?: boolean;
}

export const SimpleMealCard = ({
  mealSlot,
  meal,
  onGenerate,
  onSaved,
  isGenerating = false,
}: SimpleMealCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
      {/* Meal Type Header */}
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wide text-sm">
          {mealSlot}
        </h3>
      </div>

      {/* Meal Content or Empty State */}
      {meal ? (
        <div className="space-y-2">
          {/* Recipe Title and Grade */}
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 text-base leading-tight flex-1">
              {meal.title}
            </h4>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 ${getGradeStyles(meal.grade)}`}
            >
              {meal.grade}
            </div>
          </div>

          {/* Servings and Time */}
          <div className="flex items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="text-xs">Servings: {meal.servings}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{meal.cookingTime} min</span>
            </div>
          </div>

          {/* Calories */}
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-lg text-gray-900">{meal.calories} cal</span>
          </div>

          {/* Macros */}
          <div className="flex items-center gap-1.5">
            <Badge className="bg-green-500 hover:bg-green-600 text-white px-2 py-0.5 text-xs">
              P {meal.macros.protein}g
            </Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 text-xs">
              C {meal.macros.carbs}g
            </Badge>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-0.5 text-xs">
              F {meal.macros.fat}g
            </Badge>
          </div>
        </div>
      ) : (
        <>
          <div className="py-2">
            <p className="text-gray-500 text-sm">No meal selected</p>
          </div>

          {/* Action Buttons - Only show when no meal */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 py-2.5"
              onClick={onSaved}
              disabled={isGenerating}
            >
              <BookmarkIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </Button>

            <Button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800"
              onClick={onGenerate}
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isGenerating ? "Generating..." : "Generate"}
              </span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};