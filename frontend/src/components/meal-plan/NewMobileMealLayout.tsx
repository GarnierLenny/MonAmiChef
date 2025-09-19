import { Button } from "@/components/ui/button";
import { Send, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { SimpleMealCard } from "./SimpleMealCard";
import { ProgressCard } from "./ProgressCard";
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
} from "./constants";

interface NewMobileMealLayoutProps {
  currentWeek: Date;
  currentDayIndex: number;
  setCurrentDayIndex: (index: number) => void;
  mealPlan: MealPlan;
  onSlotClick: (day: string, meal: MealSlot) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  isGenerating: boolean;
  onProgressDetailsClick: () => void;
  onShowRecipe?: (day: string, meal: MealSlot) => void;
  onRegenerate?: (day: string, meal: MealSlot) => void;
  onDeleteMeal?: (day: string, meal: MealSlot) => void;
  generatingSlots?: Set<string>;
}

export const NewMobileMealLayout = ({
  currentWeek,
  currentDayIndex,
  setCurrentDayIndex,
  mealPlan,
  onSlotClick,
  onSubmit,
  inputValue,
  setInputValue,
  isGenerating,
  onProgressDetailsClick,
  onShowRecipe,
  onRegenerate,
  onDeleteMeal,
  generatingSlots = new Set(),
}: NewMobileMealLayoutProps) => {
  const weekStart = startOfWeek(currentWeek);
  const currentDay = DAYS_OF_WEEK[currentDayIndex];

  const handlePreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < 6) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const handleSavedMeals = (mealSlot: MealSlot) => {
    // TODO: Implement saved meals functionality
    console.log(`Show saved meals for ${mealSlot}`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Progress Card */}
      <div className="p-4">
        <ProgressCard
          mealPlan={mealPlan}
          currentDay={currentDay}
          onDetailsClick={onProgressDetailsClick}
          isMobile
        />
      </div>

      {/* Meal Cards */}
      <div className="flex-1 px-4 space-y-4 overflow-y-auto">
        {MEAL_SLOTS.map((mealSlot) => {
          const meal = mealPlan[currentDay]?.[mealSlot];
          const slotKey = `${currentDay}-${mealSlot}`;
          const isSlotGenerating = generatingSlots.has(slotKey);

          return (
            <SimpleMealCard
              key={mealSlot}
              mealSlot={mealSlot}
              meal={meal}
              onGenerate={() => onSlotClick(currentDay, mealSlot)}
              onSaved={() => handleSavedMeals(mealSlot)}
              onShowRecipe={() => onShowRecipe?.(currentDay, mealSlot)}
              onRegenerate={() => onRegenerate?.(currentDay, mealSlot)}
              onDelete={() => onDeleteMeal?.(currentDay, mealSlot)}
              isGenerating={!meal && isSlotGenerating}
              isRegenerating={meal && isSlotGenerating}
            />
          );
        })}
      </div>

      {/* Day Navigation */}
      <div className="p-4">
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousDay}
            disabled={currentDayIndex === 0}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {format(addDays(weekStart, currentDayIndex), "EEEE, MMM d")}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextDay}
            disabled={currentDayIndex === 6}
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 pt-0">
        <form onSubmit={onSubmit} className="w-full">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell me what you'd like to eat today..."
              disabled={isGenerating}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
            <Button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};