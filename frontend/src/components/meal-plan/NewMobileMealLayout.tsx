import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addDays, startOfWeek, differenceInDays } from "date-fns";
import { SimpleMealCard } from "./SimpleMealCard";
import { ProgressCard } from "./ProgressCard";
import { CalendarModal } from "./CalendarModal";
import { ChatInput } from "@/components/ui/chat-input";
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
} from "./constants";
import type { UserGoals } from "../../lib/api/healthApi";

interface NewMobileMealLayoutProps {
  currentWeek: Date;
  currentDayIndex: number;
  setCurrentDayIndex: (index: number) => void;
  setCurrentWeek: (week: Date) => void;
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
  onSavedMeals?: (day: string, meal: MealSlot) => void;
  generatingSlots?: Set<string>;
  userGoals?: UserGoals | null;
}

export const NewMobileMealLayout = ({
  currentWeek,
  currentDayIndex,
  setCurrentDayIndex,
  setCurrentWeek,
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
  onSavedMeals,
  generatingSlots = new Set(),
  userGoals,
}: NewMobileMealLayoutProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
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
    onSavedMeals?.(currentDay, mealSlot);
  };

  const handleDateSelect = (date: Date) => {
    // Calculate the week that contains the selected date (start from Monday)
    const selectedWeekStart = startOfWeek(date, { weekStartsOn: 1 });

    // Calculate the day index within that week (0=Monday, 6=Sunday)
    const selectedDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;

    // Update both the week and the day index
    setCurrentWeek(selectedWeekStart);
    setCurrentDayIndex(selectedDayIndex);
  };

  return (
    <div className="flex flex-col h-full w-screen pb-18 bg-orange-50 overflow-hidden">
      {/* Day Navigation */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center border-2 border-orange-300 bg-white rounded-full justify-between flex-1 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousDay}
              disabled={currentDayIndex === 0}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Button>

            <div className="text-center">
              <div className="font-medium text-gray-900 text-md">
                {format(addDays(weekStart, currentDayIndex), "EEEE, MMM d")}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              disabled={currentDayIndex === 6}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCalendarOpen(true)}
            className="p-1 bg-white px-2 hover:bg-gray-100 border-2 border-orange-300 rounded-full transition-colors ml-2"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-4">
        <ProgressCard
          mealPlan={mealPlan}
          currentDay={currentDay}
          onDetailsClick={onProgressDetailsClick}
          isMobile
          userGoals={userGoals}
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

      {/* Input Bar */}
      <ChatInput
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={onSubmit}
        isGenerating={isGenerating}
        placeholder="Try: 'Something healthy for breakfast' or 'Indian food for dinner'"
        canSend={inputValue.trim() !== ""}
        className="p-4 pt-0 bg-orange-50 pb-safe meal-plan-input"
      />

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateSelect={handleDateSelect}
        currentDate={addDays(weekStart, currentDayIndex)}
        mealPlan={mealPlan}
      />
    </div>
  );
};
