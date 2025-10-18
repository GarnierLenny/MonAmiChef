import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Eye,
  RotateCcw,
  Trash2,
  ShoppingCart,
  CheckCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
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
  onAddToGroceryList?: () => void;
  groceryListMealIds?: Set<string>;
  onSelectAllMeals?: (mealKeys: string[]) => void;
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
  onAddToGroceryList,
  groceryListMealIds = new Set(),
  onSelectAllMeals,
}: NewMobileMealLayoutProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{
    day: string;
    slot: MealSlot;
  } | null>(null);
  const [shouldShake, setShouldShake] = useState(false);
  const [hideBadge, setHideBadge] = useState(false);
  const prevSelectedMealsSize = useRef(selectedMeals.size);
  const lastSeenMealsCount = useRef(selectedMeals.size);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const currentDay = DAYS_OF_WEEK[currentDayIndex];

  // Swipe gesture support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  // Reset badge visibility when all meals deselected
  useEffect(() => {
    if (prevSelectedMealsSize.current > 0 && selectedMeals.size === 0) {
      setHideBadge(false);
    }
    prevSelectedMealsSize.current = selectedMeals.size;
  }, [selectedMeals.size]);

  // Trigger shake animation when shopping cart becomes clickable
  useEffect(() => {
    const prevSize = prevSelectedMealsSize.current;
    const currentSize = selectedMeals.size;
    const hasMealsWithData = hasSelectedMealsWithData();

    // Going from no meals with data to having meals with data (first real meal selected)
    if (prevSize === 0 && currentSize > 0 && hasMealsWithData) {
      setShouldShake(true);
      setHideBadge(false); // Show badge when first meal selected

      // Reset shake state after animation completes
      const timer = setTimeout(() => {
        setShouldShake(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedMeals.size, mealPlan]);

  // Show badge when new meals are added after last seen count
  useEffect(() => {
    if (
      selectedMeals.size > lastSeenMealsCount.current &&
      selectedMeals.size > 0
    ) {
      setHideBadge(false);
    }
  }, [selectedMeals.size]);

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

  // Generate dynamic placeholder based on selected meals
  const getDynamicPlaceholder = () => {
    // Extract meal types from selected meals (only current day)
    const selectedSlots = Array.from(selectedMeals)
      .filter((key) => key.startsWith(currentDay))
      .map((key) => key.split("-")[1] as MealSlot)
      .sort((a, b) => MEAL_SLOTS.indexOf(a) - MEAL_SLOTS.indexOf(b));

    if (selectedSlots.length === 0) {
      return "Veggie and high protein";
    }

    // Capitalize first letter of each meal type
    const formattedSlots = selectedSlots.map(
      (slot) => slot.charAt(0).toUpperCase() + slot.slice(1),
    );

    if (formattedSlots.length === 1) {
      return `Generate ${formattedSlots[0]}`;
    } else if (formattedSlots.length === 2) {
      return `Generate ${formattedSlots.join(" and ")}`;
    } else {
      const last = formattedSlots.pop();
      return `Generate ${formattedSlots.join(", ")} and ${last}`;
    }
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

  // Check if any selected meals actually have meal data
  const hasSelectedMealsWithData = () => {
    return Array.from(selectedMeals).some((mealKey) => {
      const [day, slot] = mealKey.split("-");
      return mealPlan[day]?.[slot as MealSlot];
    });
  };

  // Check if any selected meals with data are NOT already in grocery list
  const hasNewMealsToAdd = () => {
    return Array.from(selectedMeals).some((mealKey) => {
      const [day, slot] = mealKey.split("-");
      const hasMealData = mealPlan[day]?.[slot as MealSlot];
      if (!hasMealData) return false;

      // Check if this meal's mealPlanItemId is NOT in the grocery list
      // We need to find the meal plan item ID from the backend data
      // Since we don't have direct access to that here, we'll rely on
      // the parent component to track this via groceryListMealIds
      // For now, just check if it has data (we'll enhance this later)
      return hasMealData;
    });
  };

  const handleGroceryListClick = () => {
    if (!hasSelectedMealsWithData()) {
      toast({
        title: t("mealPlan.noMealsSelected"),
        description: t("mealPlan.selectMealsForGroceryList"),
        variant: "default",
        className: "bg-info-100 border-info-500 text-info-900",
      });
    } else {
      setHideBadge(true); // Hide badge when adding to grocery list
      lastSeenMealsCount.current = selectedMeals.size; // Track current count
      onAddToGroceryList?.();
    }
  };

  // Get all meal slots for the current day (including empty ones)
  const getCurrentDayMealSlots = () => {
    return MEAL_SLOTS.map((slot) => `${currentDay}-${slot}`);
  };

  const areAllCurrentDayMealsSelected = () => {
    const allSlots = getCurrentDayMealSlots();
    return allSlots.every((mealKey) => selectedMeals.has(mealKey));
  };

  // Handle Select All button click
  const handleSelectAll = () => {
    const allSlots = getCurrentDayMealSlots();
    const allSelected = areAllCurrentDayMealsSelected();

    if (onSelectAllMeals) {
      // Use bulk selection callback if available
      if (allSelected) {
        // Pass empty array to deselect all (or all current day slots to toggle them off)
        onSelectAllMeals(allSlots);
      } else {
        // Pass all slots to select them
        onSelectAllMeals(allSlots);
      }
    } else {
      // Fallback to individual selection
      if (allSelected) {
        allSlots.forEach((mealKey) => {
          const [day, slot] = mealKey.split("-");
          onMealSelection?.(day, slot as MealSlot);
        });
      } else {
        allSlots.forEach((mealKey) => {
          const [day, slot] = mealKey.split("-");
          onMealSelection?.(day, slot as MealSlot);
        });
      }
    }
  };

  // Handle touch events for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentDayIndex < 6) {
      // Swipe left = next day
      handleNextDay();
    }
    if (isRightSwipe && currentDayIndex > 0) {
      // Swipe right = previous day
      handlePreviousDay();
    }
  };

  return (
    <div className="flex flex-col h-full w-screen pb-18 bg-orange-50 overflow-hidden">
      {/* Day Navigation - Compact */}
      <div className="px-4 mt-2">
        {/* Date Navigation Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Navigation arrows + Date display */}
          <div className="flex items-center flex-1 bg-white rounded-xl shadow-sm border border-orange-100/50 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousDay}
              disabled={currentDayIndex === 0}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </Button>

            <div className="flex-1 text-center px-1.5">
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {format(addDays(weekStart, currentDayIndex), "EEE, MMM d")}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              disabled={currentDayIndex === 6}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Button>
          </div>

          {/* Calendar button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCalendarOpen(true)}
            className="p-2 bg-white hover:bg-orange-50 shadow-sm rounded-xl transition-colors border border-orange-100/50 shrink-0"
          >
            <Calendar className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Week Progress Dots - Compact */}
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayMeals = mealPlan[day];
            const filledSlotsCount = dayMeals
              ? Object.keys(dayMeals).length
              : 0;
            const isCurrentDay = index === currentDayIndex;
            const hasMeals = filledSlotsCount > 0;

            return (
              <button
                key={day}
                onClick={() => setCurrentDayIndex(index)}
                className="group relative"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isCurrentDay
                      ? "w-5 bg-orange-500"
                      : hasMeals
                        ? "bg-orange-300 hover:bg-orange-400"
                        : "bg-gray-200 hover:bg-gray-300"
                  }`}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {format(addDays(weekStart, index), "EEE")}
                  {hasMeals && ` (${filledSlotsCount})`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Shopping Cart Bar - Only visible when meals are selected */}
        {hasSelectedMealsWithData() && (
          <div className="mt-2 animate-slide-in">
            <button
              onClick={handleGroceryListClick}
              className={`w-full bg-white hover:bg-orange-50 rounded-xl shadow-sm border border-orange-100/50 px-3 py-2 flex items-center justify-between transition-all duration-300 group ${shouldShake ? "animate-shake" : ""}`}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                  {hasNewMealsToAdd() && !hideBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full border border-white shadow-md animate-pop-in" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-gray-900">
                    Add to Grocery List ({selectedMeals.size})
                  </div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Your Meals Header */}
      <div className="flex mx-4 mt-2 pb-2 justify-between items-center">
        <p className="text-xs font-medium text-neutral-600">
          {t("mealPlan.yourMeals")}
        </p>
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {areAllCurrentDayMealsSelected() ? (
            <>
              <X className="h-3.5 w-3.5 text-danger-500" />
              <p className="text-xs text-danger-500">
                {t("mealPlan.deselectAll")}
              </p>
            </>
          ) : (
            <>
              <CheckCheck className="h-3.5 w-3.5 text-neutral-700" />
              <p className="text-xs text-neutral-700">
                {t("mealPlan.selectAll")}
              </p>
            </>
          )}
        </button>
      </div>

      {/* Scrollable Content Area - Contains Progress Card and Meal Cards */}
      <div
        className="flex flex-col flex-1 min-h-0 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Progress Card - Now scrollable */}
        <div className="px-4 pb-1">
          <ProgressCard
            mealPlan={mealPlan}
            currentDay={currentDay}
            onDetailsClick={onProgressDetailsClick}
            isMobile
            userGoals={userGoals}
            selectedMeals={selectedMeals}
          />
        </div>

        {/* Meal Cards - Vertical Stack */}
        <div className="flex flex-col px-4 pt-2 pb-4 gap-3.5">
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
                  meal &&
                  setSelectedMealSlot({ day: currentDay, slot: mealSlot })
                }
                isGenerating={!meal && isSlotGenerating}
                isRegenerating={meal && isSlotGenerating}
                isSelected={selectedMeals.has(slotKey)}
                onMealSelection={() => onMealSelection?.(currentDay, mealSlot)}
              />
            );
          })}
        </div>
      </div>

      {/* Input Bar - Only visible when meals are selected */}
      {selectedMeals.size > 0 && (
        <div className="animate-slide-up">
          <ChatInput
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSubmit={onSubmit}
            isGenerating={isGenerating}
            placeholder={getDynamicPlaceholder()}
            canSend={inputValue.trim() !== "" || selectedMeals.size > 0}
            className="px-4 py-0 mt-[4px] pb-safe meal-plan-input"
          />
        </div>
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
