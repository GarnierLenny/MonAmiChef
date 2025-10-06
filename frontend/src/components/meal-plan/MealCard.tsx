// Import UI components from shadcn/ui library
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Import icons from lucide-react
import { Plus, X, User, Clock, Zap, Circle, CircleDot } from "lucide-react";

// Import utility functions
import { cn } from "@/lib/utils";
import { getGradeStyles, getMacroBadgeClass } from "./utils";

// Import types
import type { Meal } from "./constants";

// Import i18n for translations
import { useTranslation } from "react-i18next";

/**
 * Props interface for MealCard component
 */
interface MealCardProps {
  meal?: Meal; // Optional meal data to display
  mealSlot: string; // Meal slot identifier (breakfast, lunch, dinner, snack)
  onClick: () => void; // Handler for card click
  onRemove?: () => void; // Optional handler for removing the meal
  isDesktop?: boolean; // Flag to render desktop or mobile version
  isSelected?: boolean; // Flag indicating if meal is selected
  onMealSelection?: () => void; // Optional handler for meal selection toggle
}

/**
 * MealCard Component
 *
 * Displays a meal card with nutritional information, cooking time, and servings.
 * Supports both desktop and mobile layouts with different visual styles.
 * Allows meal selection, removal, and clicking for more details.
 */
export const MealCard = ({
  meal,
  mealSlot,
  onClick,
  onRemove,
  isDesktop = false,
  isSelected = false,
  onMealSelection,
}: MealCardProps) => {
  // Get translation function
  const { t } = useTranslation();

  // Render desktop version of the card
  if (isDesktop) {
    return (
      <Card
        className={cn(
          "h-48 cursor-pointer hover:shadow-md transition-all duration-300 group",
          isSelected
            ? "border-orange-500 bg-orange-50 shadow-md scale-[1.02] animate-in fade-in-0 zoom-in-95"
            : "border-gray-200 hover:border-gray-300"
        )}
        onClick={onClick}
      >
        <CardContent className="p-3 h-full flex flex-col">
          {meal ? (
            <div className="flex flex-col h-full">
              {/* Action buttons */}
              <div className="flex justify-end gap-1">
                {onMealSelection && (
                  <button
                    className={cn(
                      "p-1 transition-all duration-200 hover:scale-110 active:scale-95",
                      !isSelected && "opacity-0 group-hover:opacity-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMealSelection();
                    }}
                  >
                    {isSelected ? (
                      <CircleDot className="h-4 w-4 text-orange-500 fill-orange-100 animate-in zoom-in-50 duration-300" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

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

              {/* Info Row - Servings and cooking time (dimmed for less emphasis) */}
              <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{meal.servings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{meal.cookingTime}{t('mealPlan.min')}</span>
                </div>
              </div>

              {/* Calories - More prominent display with orange accent */}
              <div className="flex items-center gap-1 mb-2 text-xs">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="font-bold text-xs text-gray-900">{meal.calories} {t('mealPlan.cal')}</span>
              </div>

              {/* Macros - Protein, Carbs, Fat badges with color coding */}
              <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                {/* Protein badge - Green */}
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium">
                  P {meal.macros.protein}g
                </Badge>
                {/* Carbohydrates badge - Blue */}
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium">
                  C {meal.macros.carbs}g
                </Badge>
                {/* Fat badge - Amber */}
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium">
                  F {meal.macros.fat}g
                </Badge>
              </div>
            </div>
          ) : (
            // Empty state - Show "Add Meal" placeholder
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Plus className="h-6 w-6 mx-auto mb-1" />
                <span className="text-xs">{t('mealPlan.addMeal')}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ========================================
  // Mobile version - Optimized for touch and smaller screens
  // ========================================
  return (
    <Card
      className={cn(
        "flex-1 w-full border-2 rounded-xl min-h-0 cursor-pointer hover:shadow-md transition-all duration-300",
        // Selected state - Orange border with background tint and scale animation
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-md scale-[1.02] animate-in fade-in-0 zoom-in-95"
          : "border-gray-200 hover:border-gray-300"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 h-full flex flex-col">
        {meal ? (
          <div className="flex flex-col h-full">
            {/* Header with meal type label, title and nutrition grade */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {mealSlot}
                  </div>
                  {onMealSelection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMealSelection();
                      }}
                      className="transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                      {isSelected ? (
                        <CircleDot className="w-4 h-4 text-orange-500 fill-orange-100 animate-in zoom-in-50 duration-300" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}
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

            {/* Info Row - Servings and cooking time (dimmed for secondary emphasis) */}
            <div className="flex items-center gap-4 mb-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{t('mealPlan.servingsLabel')} {meal.servings}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{meal.cookingTime} {t('mealPlan.min')}</span>
              </div>
            </div>

            {/* Calories and Macros Row - Horizontal layout */}
            <div className="flex items-center justify-between gap-2">
              {/* Calories - Prominent display with energy icon */}
              <div className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="font-bold text-xs text-gray-900">{meal.calories} {t('mealPlan.cal')}</span>
              </div>

              {/* Macros - Color-coded badges for quick visual scanning */}
              <div className="flex items-center gap-1.5">
                {/* Protein - Green */}
                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium">
                  P {meal.macros.protein}g
                </Badge>
                {/* Carbs - Blue */}
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium">
                  C {meal.macros.carbs}g
                </Badge>
                {/* Fat - Amber */}
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium">
                  F {meal.macros.fat}g
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          // Empty state - Show meal slot name and "Add" prompt
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-3">
              <span className="text-base font-semibold text-gray-700 capitalize">
                {mealSlot}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              {/* Dashed border placeholder for adding meal */}
              <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">{t('mealPlan.add')} {mealSlot}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};