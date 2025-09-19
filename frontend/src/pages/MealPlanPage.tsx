// src/pages/MealPlanPage.tsx
import { useState, useCallback } from "react";
import { startOfWeek, addWeeks, subWeeks } from "date-fns";

// Import components
import { MealGrid } from "@/components/meal-plan/MealGrid";
import { MobileMealCards } from "@/components/meal-plan/MobileMealCards";
import { ProgressCard } from "@/components/meal-plan/ProgressCard";
import { ProgressModal } from "@/components/meal-plan/ProgressModal";

// Import constants and utils
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  FAKE_MEALS,
  type MealPlan,
  type MealSlot,
} from "@/components/meal-plan/constants";

// interface MealPlanPageProps {
//   user?: User | null;
//   onAuthClick?: () => void;
// }

export default function MealPlanPage() {
  // Input state
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Meal plan state
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Progress modal state
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [modalDay, setModalDay] = useState<string | null>(null);

  // Generate fake meal plan
  const generateFakeMealPlan = useCallback(() => {
    const newPlan: MealPlan = {};
    DAYS_OF_WEEK.forEach((day) => {
      newPlan[day] = {};
      MEAL_SLOTS.forEach((meal) => {
        const mealOptions = FAKE_MEALS[meal];
        const randomMeal =
          mealOptions[Math.floor(Math.random() * mealOptions.length)];
        newPlan[day][meal] = randomMeal;
      });
    });
    setMealPlan(newPlan);
  }, []);

  // Handle meal generation from user input
  const handleMealGeneration = (text: string) => {
    setIsGenerating(true);

    // Simulate AI processing and meal generation
    setTimeout(() => {
      // Generate meals based on user input for current day
      generateMealsForCurrentDay(text);
      setIsGenerating(false);
    }, 2000);
  };

  // Generate meals for current day based on user input
  const generateMealsForCurrentDay = (userInput: string) => {
    const currentDay = DAYS_OF_WEEK[currentDayIndex];
    const newPlan = { ...mealPlan };

    // Initialize day if it doesn't exist
    if (!newPlan[currentDay]) {
      newPlan[currentDay] = {};
    }

    // Generate meals based on input for each meal slot
    MEAL_SLOTS.forEach((meal) => {
      const mealOptions = FAKE_MEALS[meal];
      const randomMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
      newPlan[currentDay][meal] = randomMeal;
    });

    setMealPlan(newPlan);
  };

  // Handle mobile input submission
  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || !inputValue.trim()) return;
    handleMealGeneration(inputValue.trim());
    setInputValue("");
  };

  // Handle meal slot click
  const handleSlotClick = (day: string, meal: MealSlot) => {
    const mealOptions = FAKE_MEALS[meal];
    const randomMeal =
      mealOptions[Math.floor(Math.random() * mealOptions.length)];

    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: randomMeal,
      },
    }));
  };

  // Remove meal from slot
  const removeMeal = (dayOrKey: string, meal?: MealSlot) => {
    setMealPlan((prev) => {
      const newPlan = { ...prev };

      if (meal) {
        // Desktop format: removeMeal(day, meal)
        const day = dayOrKey;
        if (newPlan[day]) {
          delete newPlan[day][meal];
        }
      } else {
        // Mobile format: removeMeal(mealKey)
        const [day, mealType] = dayOrKey.split("-");
        if (newPlan[day]) {
          delete newPlan[day][mealType as MealSlot];
        }
      }

      return newPlan;
    });
  };

  // Week navigation
  const goToPreviousWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  // Get current day for progress tracking
  const getCurrentDay = () => {
    const today = new Date();
    return DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      {/* Desktop Meal Plan Grid */}
      <div className="hidden md:flex w-full flex-col overflow-hidden">
        {/* Today's Progress Card - Desktop */}
        <div className="px-6 pb-4 pt-6">
          <ProgressCard
            mealPlan={mealPlan}
            currentDay={getCurrentDay()}
            onDetailsClick={() => {
              setModalDay(getCurrentDay());
              setShowProgressDetails(true);
            }}
          />
        </div>

        {/* Meal Grid */}
        <MealGrid
          currentWeek={currentWeek}
          mealPlan={mealPlan}
          onSlotClick={handleSlotClick}
          onRemoveMeal={removeMeal}
          onGeneratePlan={generateFakeMealPlan}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />

        {/* Desktop Input Bar */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isGenerating || !inputValue.trim()) return;
              handleMealGeneration(inputValue.trim());
              setInputValue("");
            }}
            className="flex items-center gap-4 p-2 pl-5 bg-white flex-1 shadow-lg shadow-orange-500/30 border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 rounded-full transition-colors"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell me what you'd like to eat today..."
              disabled={isGenerating}
              className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              className="shrink-0 rounded-full px-4 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white flex items-center justify-center"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4Z"/>
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden h-screen w-full flex flex-col bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 overflow-hidden fixed inset-0 pt-20">
        <MobileMealCards
          currentWeek={currentWeek}
          currentDayIndex={currentDayIndex}
          setCurrentDayIndex={setCurrentDayIndex}
          mealPlan={mealPlan}
          onSlotClick={handleSlotClick}
          onSubmit={handleMobileSubmit}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isGenerating={isGenerating}
          onProgressDetailsClick={() => {
            setModalDay(DAYS_OF_WEEK[currentDayIndex]);
            setShowProgressDetails(true);
          }}
        />
      </div>

      {/* Progress Details Modal */}
      <ProgressModal
        isOpen={showProgressDetails}
        onClose={setShowProgressDetails}
        mealPlan={mealPlan}
        currentDay={modalDay || getCurrentDay()}
      />
    </div>
  );
}