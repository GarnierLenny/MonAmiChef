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
  onGroceryListClick?: () => void;
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
  onGroceryListClick,
  onSelectAllMeals,
}: NewMobileMealLayoutProps) => {
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{
    day: string;
    slot: MealSlot;
  } | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [hideBadge, setHideBadge] = useState(false);
  const prevSelectedMealsSize = useRef(selectedMeals.size);
  const lastSeenMealsCount = useRef(selectedMeals.size);
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const currentDay = DAYS_OF_WEEK[currentDayIndex];

  // Detect when going from 1 selected meal to 0 to trigger closing animation
  useEffect(() => {
    if (prevSelectedMealsSize.current > 0 && selectedMeals.size === 0) {
      setIsClosing(true);
      setHideBadge(false); // Reset badge visibility when all meals deselected
      // Reset closing state after animation completes
      const timer = setTimeout(() => {
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
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

  // Check if any selected meals actually have meal data
  const hasSelectedMealsWithData = () => {
    return Array.from(selectedMeals).some((mealKey) => {
      const [day, slot] = mealKey.split("-");
      return mealPlan[day]?.[slot as MealSlot];
    });
  };

  const handleGroceryListClick = () => {
    if (!hasSelectedMealsWithData()) {
      toast({
        title: "No meals selected",
        description: "Select meal(s) to see the grocery list",
        variant: "default",
        className: "bg-info-100 border-info-500 text-info-900",
      });
    } else {
      setHideBadge(true); // Hide badge when opening grocery list
      lastSeenMealsCount.current = selectedMeals.size; // Track current count
      onGroceryListClick?.();
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

  return (
    <div className="flex flex-col h-full w-screen pb-18 bg-background-dark-layer overflow-hidden">
      {/* Day Navigation */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center shadow-sm/10 bg-background rounded-full justify-between flex-1 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousDay}
              disabled={currentDayIndex === 0}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-3 h-3 text-gray-600" />
            </Button>

            <div className="text-center">
              <div className="font-medium text-gray-900 text-sm">
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
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCalendarOpen(true)}
            className="p-2.5 bg-background hover:bg-gray-100 shadow-sm/20 rounded-full transition-colors ml-2"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGroceryListClick}
            className={`p-2.5 shadow-sm/20 rounded-full transition-all duration-500 ml-2 bg-background hover:bg-gray-100 relative ${shouldShake ? "animate-shake" : ""}`}
          >
            <ShoppingCart
              className={`w-5 h-5 transition-colors duration-500 ${
                hasSelectedMealsWithData() ? "text-black" : "text-neutral-400"
              }`}
            />
            {hasSelectedMealsWithData() && !hideBadge && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-danger-500 rounded-full border-2 border-background animate-pop-in" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="px-4 pt-[18px] pb-2 mb-2">
        <ProgressCard
          mealPlan={mealPlan}
          currentDay={currentDay}
          onDetailsClick={onProgressDetailsClick}
          isMobile
          userGoals={userGoals}
          selectedMeals={selectedMeals}
        />
      </div>

      <div className="flex mx-4.5 mt-1 justify-between">
        <p className="text-sm text-neutral-700">YOUR MEALS</p>
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
        >
          {areAllCurrentDayMealsSelected() ? (
            <>
              <X className="h-4 w-4 text-danger-500" />
              <p className="text-sm text-danger-500">Deselect All</p>
            </>
          ) : (
            <>
              <CheckCheck className="h-4 w-4 text-neutral-700" />
              <p className="text-sm text-neutral-700">Select All</p>
            </>
          )}
        </button>
      </div>

      {/* Meal Cards */}
      <div className="flex flex-row px-4 pt-4 mb-4 pb-10 items-center gap-[16px] overflow-y-auto no-scrollbar">
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

      {/* Spacer to push input to bottom */}
      <div className="flex-1" />

      {/* Fixed container to prevent layout shift */}
      <div className="relative h-0">
        {/* Selected Meal Tags and Input Bar - Show when meals are selected */}
        {(selectedMeals.size > 0 || isClosing) && (
          <div
            className={`absolute bottom-0 left-0 right-0 ${isClosing ? "animate-slide-down" : "animate-slide-up"}`}
          >
            {/* Selected Meal Tags */}
            <div className="px-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {mealTags.map((tag, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center space-x-2 px-3 rounded-full text-sm font-medium border border-current/20 ${tag.color}`}
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
              placeholder="Veggie and high protein"
              canSend={inputValue.trim() !== "" || selectedMeals.size > 0}
              className="px-4 py-0 mt-[4px] pb-safe meal-plan-input"
            />
          </div>
        )}
      </div>

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
