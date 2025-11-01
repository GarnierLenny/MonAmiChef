import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  Loader2,
  Coffee,
  Sun,
  Moon,
  CheckSquare,
  Zap,
} from "lucide-react";
import { getGradeStyles } from "./utils";
import type { Meal, MealSlot } from "./constants";
import { getRandomLoadingText } from "@/lib/utils/randomWords";

interface SimpleMealCardProps {
  mealSlot: MealSlot;
  meal?: Meal;
  onGenerate: () => void;
  onSaved: () => void;
  onCardClick?: () => void;
  isGenerating?: boolean;
  isRegenerating?: boolean;
  isSelected?: boolean;
  onMealSelection?: () => void;
}

export const SimpleMealCard = ({
  mealSlot,
  meal,
  onGenerate,
  onSaved,
  onCardClick,
  isGenerating = false,
  isRegenerating = false,
  isSelected = false,
  onMealSelection,
}: SimpleMealCardProps) => {
  const isCurrentlyGenerating = isGenerating || isRegenerating;
  const { t } = useTranslation();

  // Random words state for Claude-like dynamic text (only for loading)
  const [loadingData, setLoadingData] = useState(getRandomLoadingText());

  // Generate new random adjective when generation starts
  useEffect(() => {
    if (isCurrentlyGenerating) {
      setLoadingData(getRandomLoadingText());
    }
  }, [isCurrentlyGenerating]);

  // Get icon based on meal slot
  const getMealIcon = () => {
    switch (mealSlot) {
      case "breakfast":
        return <Coffee color="rgba(0, 0, 0, 0.5)" className="w-4 h-4" />;
      case "lunch":
        return <Sun color="rgba(0, 0, 0, 0.5)" className="w-4 h-4" />;
      case "dinner":
        return <Moon color="rgba(0, 0, 0, 0.5)" className="w-4 h-4" />;
      default:
        return <Coffee className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`bg-background rounded-xl w-full min-h-[160px] flex-1 border-2 shadow-sm p-4 flex flex-col space-y-2 relative transition-all duration-300 ${
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-md animate-in fade-in-0 zoom-in-95"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onMealSelection}
    >
      {/* Meal Type Header with Selection Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getMealIcon()}
          <h3 className="text-foreground-muted uppercase tracking-wide text-xs font-medium">
            {mealSlot}
          </h3>
        </div>
        {/* Selection Checkmark Badge */}
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center animate-in zoom-in-50 duration-200">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Meal Content or Empty State */}
      {meal ? (
        <div className="flex-1 flex flex-col justify-between">
          {/* Recipe Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-base flex-1 line-clamp-2">
              {meal.title}
            </h4>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getGradeStyles(meal.grade)}`}
            >
              {meal.grade}
            </div>
          </div>

          {/* Bottom Row: Calories and Macros */}
          <div className="flex items-center justify-between">
            {/* Calories */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-gray-900">
                {meal.calories} <span className="text-[10px] font-normal text-gray-600">cal</span>
              </span>
            </div>

            {/* Macros */}
            <div className="flex items-center gap-1">
              <Badge className="bg-green-500 text-white text-[10px] font-medium px-1.5 py-0">
                P {meal.macros.protein}
              </Badge>
              <Badge className="bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0">
                C {meal.macros.carbs}
              </Badge>
              <Badge className="bg-amber-500 text-white text-[10px] font-medium px-1.5 py-0">
                F {meal.macros.fat}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
            {getMealIcon()}
          </div>
          <p className="text-sm font-medium text-gray-700">
            Tap to generate {mealSlot}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-orange-600 border-orange-300 hover:bg-orange-50"
            onClick={(e) => {
              e.stopPropagation();
              onSaved();
            }}
          >
            <BookmarkIcon className="w-3 h-3 mr-1" />
            Or pick saved
          </Button>
        </div>
      )}

      {/* Long Press Action Menu Hint */}
      {meal && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick?.();
            }}
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </Button>
        </div>
      )}

      {/* Loading Overlay */}
      {isCurrentlyGenerating && (
        <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            {t('chat.generating')}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent font-bold animate-pulse">
                {loadingData.adjective}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 blur-sm animate-bounce rounded-md"></span>
            </span>{" "}
            recipe...
          </p>
        </div>
      )}
    </div>
  );
};
