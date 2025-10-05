import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Eye,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { format, addDays, startOfWeek, differenceInDays } from "date-fns";
import { SimpleMealCard } from "./SimpleMealCard";
import { ProgressCard } from "./ProgressCard";
import { CalendarModal } from "./CalendarModal";
import { ChatInput } from "@/components/ui/chat-input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  selectedMeals?: Set<string>;
  onMealSelection?: (day: string, mealSlot: MealSlot) => void;
  onClearSelectedMeals?: () => void;
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
  selectedMeals = new Set(),
  onMealSelection,
  onClearSelectedMeals,
}: NewMobileMealLayoutProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{
    day: string;
    slot: MealSlot;
  } | null>(null);
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

  // Convert selected meals to tags format
  const mealTags = Array.from(selectedMeals).map((mealKey, index) => {
    const [day, slot] = mealKey.split("-");
    const slotName = slot.charAt(0).toUpperCase() + slot.slice(1);

    // Vary colors for different tags
    const colors = [
      "bg-orange-100 text-orange-700",
      "bg-green-100 text-green-700",
      "bg-blue-100 text-blue-700",
    ];

    return {
      category: "meal",
      value: mealKey,
      label: slotName,
      color: colors[index % colors.length],
    };
  });

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
    <div className="flex flex-col h-full w-screen pb-18 bg-background-dark-layer overflow-hidden">
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
          selectedMeals={selectedMeals}
        />
      </div>

      {/* Meal Cards */}
      <div className="flex flex-row p-4 items-center gap-[16px] overflow-y-auto no-scrollbar">
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
              onCardClick={() =>
                meal && setSelectedMealSlot({ day: currentDay, slot: mealSlot })
              }
              isGenerating={!meal && isSlotGenerating}
              isRegenerating={meal && isSlotGenerating}
              isSelected={selectedMeals.has(slotKey)}
              onMealSelection={() => onMealSelection?.(currentDay, mealSlot)}
            />
          );
        })}
      </div>

      {/* Selected Meal Tags and Input Bar - Only show when meals are selected */}
      {selectedMeals.size > 0 && (
        <>
          {/* Selected Meal Tags */}
          <div className="px-4 pt-2 border-t border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {mealTags.map((tag, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border border-current/20 ${tag.color}`}
                  >
                    <span>{tag.label}</span>
                    <button
                      onClick={() => {
                        const [day, slot] = tag.value.split("-");
                        onMealSelection?.(day, slot as MealSlot);
                      }}
                      className="h-auto p-0.5 hover:bg-current/20 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              {onClearSelectedMeals && (
                <button
                  onClick={onClearSelectedMeals}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Input Bar */}
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={onSubmit}
            isGenerating={isGenerating}
            placeholder="Try: 'Something healthy for breakfast' or 'Indian food for dinner'"
            canSend={inputValue.trim() !== "" || selectedMeals.size > 0}
            className="p-4 pt-0 bg-orange-50 pb-safe meal-plan-input"
          />
        </>
      )}

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateSelect={handleDateSelect}
        currentDate={addDays(weekStart, currentDayIndex)}
        mealPlan={mealPlan}
      />

      {/* Meal Actions Bottom Sheet */}
      <Sheet
        open={!!selectedMealSlot}
        onOpenChange={(open) => !open && setSelectedMealSlot(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>
              {selectedMealSlot &&
                mealPlan[selectedMealSlot.day]?.[selectedMealSlot.slot]?.title}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-3 h-12"
              onClick={() => {
                if (selectedMealSlot) {
                  onShowRecipe?.(selectedMealSlot.day, selectedMealSlot.slot);
                  setSelectedMealSlot(null);
                }
              }}
            >
              <Eye className="w-5 h-5" />
              <span>Show recipe</span>
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-3 h-12"
              onClick={() => {
                if (selectedMealSlot) {
                  onRegenerate?.(selectedMealSlot.day, selectedMealSlot.slot);
                  setSelectedMealSlot(null);
                }
              }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>Regenerate</span>
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (selectedMealSlot) {
                  onDeleteMeal?.(selectedMealSlot.day, selectedMealSlot.slot);
                  setSelectedMealSlot(null);
                }
              }}
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
