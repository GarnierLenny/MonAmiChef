import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  BookmarkIcon,
  Sparkles,
  User,
  Clock,
  Zap,
  Eye,
  RotateCcw,
  Trash2,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { getGradeStyles } from "./utils";
import type { Meal, MealSlot } from "./constants";
import { getRandomLoadingText } from "@/lib/utils/randomWords";

interface SimpleMealCardProps {
  mealSlot: MealSlot;
  meal?: Meal;
  onGenerate: () => void;
  onSaved: () => void;
  onShowRecipe?: () => void;
  onRegenerate?: () => void;
  onDelete?: () => void;
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
  onShowRecipe,
  onRegenerate,
  onDelete,
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

  return (
    <div
      className={`bg-white rounded-xl border p-3 space-y-2 relative transition-all duration-200 ${
        isSelected
          ? "border-orange-500 bg-orange-50 shadow-md"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Meal Type Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-400 uppercase tracking-wide text-xs">
          {mealSlot}
        </h3>
        {/* Select Icon */}
        {onMealSelection && (
          <button
            onClick={onMealSelection}
            className={`p-1 rounded-full transition-all duration-200 ${
              isSelected
                ? "bg-orange-500 text-white hover:bg-orange-600"
                : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Meal Content or Empty State */}
      {meal ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className="space-y-2 cursor-pointer touch-manipulation"
              onTouchStart={(e) => {
                // Store touch start position, time, and target for gesture detection
                const touch = e.touches[0];
                const startX = touch.clientX;
                const startY = touch.clientY;
                const startTime = Date.now();
                const targetElement = e.currentTarget; // Store the target reference

                const handleTouchEnd = (endEvent: TouchEvent) => {
                  const endTime = Date.now();
                  const duration = endTime - startTime;

                  // Only trigger context menu for quick taps (not scrolls)
                  // - Duration should be less than 300ms (quick tap)
                  // - Movement should be minimal (less than 10px)
                  if (duration < 300 && endEvent.changedTouches.length > 0) {
                    const endTouch = endEvent.changedTouches[0];
                    const deltaX = Math.abs(endTouch.clientX - startX);
                    const deltaY = Math.abs(endTouch.clientY - startY);

                    if (deltaX < 10 && deltaY < 10) {
                      // This was a tap, not a scroll - trigger context menu
                      endEvent.preventDefault();
                      endEvent.stopPropagation();

                      const contextMenuEvent = new MouseEvent("contextmenu", {
                        bubbles: true,
                        cancelable: true,
                        clientX: startX,
                        clientY: startY,
                      });
                      targetElement.dispatchEvent(contextMenuEvent);
                    }
                  }

                  // Clean up event listener
                  document.removeEventListener("touchend", handleTouchEnd);
                };

                // Add touch end listener
                document.addEventListener("touchend", handleTouchEnd, {
                  once: true,
                });
              }}
            >
              {/* Recipe Title and Grade */}
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
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

              {/* Calories and Macros */}
              <div className="flex items-center justify-between">
                {/* Calories */}
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-md text-gray-900">
                    {meal.calories} cal
                  </span>
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
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            <ContextMenuItem
              onClick={onShowRecipe}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Show recipe</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={onRegenerate}
              className="flex items-center gap-2 cursor-pointer"
              disabled={isCurrentlyGenerating}
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {isCurrentlyGenerating ? "Generating..." : "Regenerate"}
              </span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
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
              <span className="text-sm font-medium">Choose saved</span>
            </Button>

            <Button
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-gray-800"
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
