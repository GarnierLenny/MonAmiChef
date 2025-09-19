import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, User, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGradeStyles, getMacroBadgeClass } from "./utils";
import type { Meal } from "./constants";

interface MealCardProps {
  meal?: Meal;
  mealSlot: string;
  onClick: () => void;
  onRemove?: () => void;
  isDesktop?: boolean;
}

export const MealCard = ({
  meal,
  mealSlot,
  onClick,
  onRemove,
  isDesktop = false,
}: MealCardProps) => {
  if (isDesktop) {
    return (
      <Card
        className="h-48 cursor-pointer hover:shadow-md transition-shadow group"
        onClick={onClick}
      >
        <CardContent className="p-3 h-full flex flex-col">
          {meal ? (
            <div className="flex flex-col h-full">
              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                className="self-end p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                }}
              >
                <X className="h-3 w-3" />
              </Button>

              {/* Header with title and grade */}
              <div className="flex items-start justify-between mb-2 -mt-6">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {meal.title}
                  </h4>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 ${getGradeStyles(meal.grade)}`}
                >
                  {meal.grade}
                </div>
              </div>

              {/* Info Row */}
              <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{meal.servings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{meal.cookingTime}m</span>
                </div>
              </div>

              {/* Calories */}
              <div className="flex items-center gap-1 mb-2 text-xs">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="font-medium">{meal.calories} cal</span>
              </div>

              {/* Macros */}
              <div className="flex items-center gap-1 flex-wrap mt-auto">
                <Badge className={cn("text-xs", getMacroBadgeClass("protein"))}>
                  P {meal.macros.protein}g
                </Badge>
                <Badge className={cn("text-xs", getMacroBadgeClass("carbs"))}>
                  C {meal.macros.carbs}g
                </Badge>
                <Badge className={cn("text-xs", getMacroBadgeClass("fat"))}>
                  F {meal.macros.fat}g
                </Badge>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Plus className="h-6 w-6 mx-auto mb-1" />
                <span className="text-xs">Add Meal</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Mobile version
  return (
    <Card
      className="flex-1 w-full border-2 border-gray-200 rounded-xl min-h-0 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3 h-full flex flex-col">
        {meal ? (
          <div className="flex flex-col h-full">
            {/* Header with meal type, title and grade */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {mealSlot}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {meal.title}
                </h3>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ml-2 flex-shrink-0 ${getGradeStyles(meal.grade)}`}
              >
                {meal.grade}
              </div>
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-4 mb-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Servings: {meal.servings}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{meal.cookingTime} min</span>
              </div>
            </div>

            {/* Calories and Macros Row */}
            <div className="flex items-center justify-between">
              {/* Calories */}
              <div className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="font-medium">{meal.calories} cal</span>
              </div>

              {/* Macros */}
              <div className="flex items-center gap-1">
                <Badge className={cn("text-xs", getMacroBadgeClass("protein"))}>
                  P {meal.macros.protein}g
                </Badge>
                <Badge className={cn("text-xs", getMacroBadgeClass("carbs"))}>
                  C {meal.macros.carbs}g
                </Badge>
                <Badge className={cn("text-xs", getMacroBadgeClass("fat"))}>
                  F {meal.macros.fat}g
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-3">
              <span className="text-base font-semibold text-gray-700 capitalize">
                {mealSlot}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Add {mealSlot}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};