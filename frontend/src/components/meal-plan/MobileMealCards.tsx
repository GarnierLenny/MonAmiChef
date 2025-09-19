import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { MealCard } from "./MealCard";
import { ProgressCard } from "./ProgressCard";
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
} from "./constants";

interface MobileMealCardsProps {
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
}

export const MobileMealCards = ({
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
}: MobileMealCardsProps) => {
  const weekStart = startOfWeek(currentWeek);
  const currentDay = DAYS_OF_WEEK[currentDayIndex];

  // Convert meal plan to assignments format for mobile
  const mealAssignments: Record<
    string,
    (typeof mealPlan)[string][keyof (typeof mealPlan)[string]]
  > = {};
  Object.entries(mealPlan).forEach(([day, meals]) => {
    Object.entries(meals).forEach(([meal, mealData]) => {
      mealAssignments[`${day}-${meal}`] = mealData;
    });
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Today's Progress Card */}
      <div className="px-4 pt-4 pb-2">
        <ProgressCard
          mealPlan={mealPlan}
          currentDay={currentDay}
          onDetailsClick={onProgressDetailsClick}
          isMobile
        />
      </div>

      {/* Mobile Meal Cards - Full screen width, no scrolling */}
      <div className="flex-1 px-4 pb-4 flex flex-col gap-3 overflow-hidden min-h-0">
        {MEAL_SLOTS.map((meal, index) => {
          const mealKey = `${currentDay}-${meal}`;
          const assignedMeal = mealAssignments[mealKey];

          return (
            <MealCard
              key={index}
              meal={assignedMeal}
              mealSlot={meal}
              onClick={() => onSlotClick(currentDay, meal)}
            />
          );
        })}
      </div>

      {/* Day Navigation Bar - Above input */}
      <div className="flex-shrink-0 px-6 py-2">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDayIndex(Math.max(0, currentDayIndex - 1))}
            disabled={currentDayIndex === 0}
            className="w-8 h-8 rounded-full p-0"
          >
            <span className="text-gray-600 text-base">‹</span>
          </Button>

          <div className="text-center">
            <div className="text-gray-800 font-semibold text-base">
              {format(addDays(weekStart, currentDayIndex), "EEEE, MMM d")}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDayIndex(Math.min(6, currentDayIndex + 1))}
            disabled={currentDayIndex === 6}
            className="w-8 h-8 rounded-full p-0"
          >
            <span className="text-gray-600 text-base">›</span>
          </Button>
        </div>
      </div>

      {/* Mobile Chat Input - Always visible at bottom */}
      <div className="flex-shrink-0 px-4 pb-3">
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-4 mb-2 p-2 pl-5 bg-white flex-1 shadow-lg shadow-orange-500/30 border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 rounded-full transition-colors"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What do you crave this week?"
            disabled={isGenerating}
            className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0"
          />
          <Button
            type="submit"
            disabled={isGenerating || !inputValue.trim()}
            className="shrink-0 rounded-full px-4 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

