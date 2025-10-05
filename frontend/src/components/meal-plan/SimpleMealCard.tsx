import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  Loader2,
  Coffee,
  Sun,
  Moon,
  CheckSquare,
  User,
  Clock,
  Zap,
  X,
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
      className={`bg-background rounded-xl min-w-[280px] w-[280px] h-[300px] border-0 shadow-xl/5 p-6 flex flex-col space-y-2 relative transition-all duration-300 ${
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-md scale-[1.02] animate-in fade-in-0 zoom-in-95"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Meal Type Header */}
      <div className="flex items-center gap-2">
        {getMealIcon()}
        <h3 className="text-muted-foreground uppercase tracking-wide text-xs">
          {mealSlot}
        </h3>
      </div>

      {/* Meal Content or Empty State */}
      {meal ? (
        <div
          className="space-y-2 mt-3 cursor-pointer flex-1 flex flex-col"
          onClick={onCardClick}
        >
          {/* Recipe Title */}
          <div className="flex items-start mb-3 justify-between">
            <h4 className="font-semibold text-base leading-tight flex-1">
              {meal.title}
            </h4>
          </div>

          {/* Servings and Time */}
          <div className="flex items-center gap-2 text-gray-600">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span className="text-sm">{meal.servings}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-sm">{meal.cookingTime} min</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-sm text-orange-500">
                {meal.calories} cal
              </span>
            </div>
          </div>

          {/* Macros */}
          <div className="flex justify-between mt-4 mb-4 items-end -ml-2">
            <div className="flex flex-wrap gap-2 items-center max-w-[180px]">
              {[
                { label: "Proteins", value: meal.macros.protein },
                { label: "Carbs", value: meal.macros.carbs },
                { label: "Fibers", value: meal.macros.fat },
              ].map((macro) => (
                <Badge
                  key={macro.label}
                  className="text-[10px] shadow-[inset_0_2px_2px_rgba(0,0,0,0.2)] bg-background-light text-black font-medium px-2.5 py-1.5 h-auto whitespace-nowrap"
                >
                  <span className="flex items-center">
                    {macro.label} {macro.value}g
                  </span>
                </Badge>
              ))}
            </div>
            <div className="flex flex-col h-full items-center justify-center gap-1">
              <span className="text-[8px] text-muted-foreground uppercase tracking-wide">
                Score
              </span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getGradeStyles(meal.grade)}`}
              >
                {meal.grade}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grow flex flex-col gap-[4px] items-center justify-center">
          <p className="text-muted-foreground text-sm">No meal selected</p>
          <p className="text-muted-foreground text-xs">
            Choose from saved or generate new
          </p>
        </div>
      )}

      {/* Action Buttons - Always show */}
      <div className="flex gap-[6px] mt-auto w-full">
        <Button
          variant="outline"
          className="flex-1 w-1/2 flex shadow-sm/10 items-center justify-center bg-white border border-gray-300 gap-2 py-2 text-gray-700 hover:bg-gray-50"
          onClick={onSaved}
          disabled={isGenerating}
        >
          <BookmarkIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Saved</span>
        </Button>

        <Button
          className={`flex-1 w-1/2 flex items-center justify-center gap-2 py-2 active:scale-95 transition-transform ${
            isSelected
              ? "bg-gray-500 text-white hover:bg-gray-800"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
          onClick={onMealSelection}
          disabled={isGenerating}
        >
          {isSelected ? (
            <>
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Unselect</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Select</span>
            </>
          )}
        </Button>
      </div>

      {/* Loading Overlay */}
      {isCurrentlyGenerating && (
        <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center z-10">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            Generating{" "}
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
