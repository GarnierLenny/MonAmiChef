import { Button } from "@/components/ui/button";
import { BookmarkIcon, Sparkles } from "lucide-react";
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
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* Meal Type Header */}
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {mealSlot}
        </h3>
      </div>

      {/* Meal Content or Empty State */}
      {meal ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meal.image}</span>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">{meal.title}</h4>
              <p className="text-xs text-gray-600">{meal.calories} cal • {meal.cookingTime}m</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2">
          <p className="text-gray-500 text-sm">No meal selected</p>
        </div>
      )}

      {/* Action Buttons */}
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
    </div>
  );
};