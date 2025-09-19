// src/pages/MealPlanPage.tsx
import { useState, useCallback, useEffect } from "react";
import { startOfWeek, addWeeks, subWeeks } from "date-fns";

// Import components
import { MealGrid } from "@/components/meal-plan/MealGrid";
import { MobileMealCards } from "@/components/meal-plan/MobileMealCards";
import { NewMobileMealLayout } from "@/components/meal-plan/NewMobileMealLayout";
import { ProgressCard } from "@/components/meal-plan/ProgressCard";
import { ProgressModal } from "@/components/meal-plan/ProgressModal";

// Import constants and utils
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
} from "@/components/meal-plan/constants";

// Import API and utilities
import { mealPlanApi, type BackendMealPlan } from "@/lib/api/mealPlanApi";
import { recipeApi } from "@/lib/api/recipeApi";
import {
  createMealPlanRequest,
  createMealPlanItemRequest,
  convertBackendToFrontendMealPlan,
  findMealPlanForWeek,
  findMealPlanItem,
  requiresAuthentication,
  convertRecipeToMeal,
} from "@/lib/mealPlanUtils";

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

  // Backend state
  const [backendMealPlans, setBackendMealPlans] = useState<BackendMealPlan[]>([]);
  const [currentBackendPlan, setCurrentBackendPlan] = useState<BackendMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  // Progress modal state
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [modalDay, setModalDay] = useState<string | null>(null);

  // Load meal plans on component mount
  useEffect(() => {
    loadMealPlans();
  }, []);

  // Update current backend plan when week changes
  useEffect(() => {
    const weekPlan = findMealPlanForWeek(backendMealPlans, currentWeek);
    setCurrentBackendPlan(weekPlan || null);

    // Only clear meal plan if we're switching to a week with no backend plan
    // Don't overwrite existing local meal data when a backend plan exists
    if (!weekPlan) {
      // No plan for this week, clear the meal plan only if user is authenticated
      // For unauthenticated users, keep their local data
      if (!isUnauthenticated) {
        setMealPlan({});
      }
    }
    // Note: We don't automatically populate from backend here because
    // the backend only stores meal plan structure, not the actual meal content
  }, [backendMealPlans, currentWeek, isUnauthenticated]);

  // Load meal plans from backend
  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const plans = await mealPlanApi.getUserMealPlans();
      setBackendMealPlans(plans);
      setIsUnauthenticated(false);
    } catch (err: unknown) {
      console.error('Failed to load meal plans:', err);
      if (requiresAuthentication(err)) {
        setIsUnauthenticated(true);
        // For unauthenticated users, keep their local meal plan data
        // Don't clear it here
      } else {
        setError(err.message || 'Failed to load meal plans');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create a meal plan for the current week if it doesn't exist
  const ensureCurrentWeekMealPlan = async (): Promise<BackendMealPlan | null> => {
    if (isUnauthenticated) return null;

    let weekPlan = findMealPlanForWeek(backendMealPlans, currentWeek);

    if (!weekPlan) {
      try {
        const request = createMealPlanRequest(currentWeek);
        weekPlan = await mealPlanApi.createMealPlan(request);
        setBackendMealPlans(prev => [...prev, weekPlan!]);
      } catch (err: unknown) {
        console.error('Failed to create meal plan:', err);
        setError((err as Error).message || 'Failed to create meal plan');
        return null;
      }
    }

    return weekPlan;
  };

  // Generate AI meal plan for current week
  const generateAIMealPlan = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const newPlan: MealPlan = { ...mealPlan };

      // Generate AI recipes for each meal slot
      for (const day of DAYS_OF_WEEK) {
        if (!newPlan[day]) newPlan[day] = {};

        for (const meal of MEAL_SLOTS) {
          try {
            const recipe = await recipeApi.generateMealRecipe({
              mealType: meal,
              preferences: "Healthy and nutritious",
            });

            const mealData = convertRecipeToMeal(recipe);
            newPlan[day][meal] = mealData;

            // Update meal plan in backend if user is authenticated
            if (!isUnauthenticated && currentBackendPlan) {
              const itemRequest = createMealPlanItemRequest(day, meal, recipe.id);
              await mealPlanApi.addMealPlanItem(currentBackendPlan.id, itemRequest);
            }
          } catch (err) {
            console.error(`Failed to generate ${meal} for ${day}:`, err);
            // Continue with other meals even if one fails
          }
        }
      }

      setMealPlan(newPlan);
    } catch (err: unknown) {
      console.error('Failed to generate meal plan:', err);
      setError((err as Error).message || 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  }, [mealPlan, isUnauthenticated, currentBackendPlan]);

  // Handle meal generation from user input
  const handleMealGeneration = async (text: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate meals based on user input for current day
      await generateMealsForCurrentDay(text);
    } catch (err: unknown) {
      console.error('Failed to generate meals:', err);
      setError((err as Error).message || 'Failed to generate meals');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate meals for current day based on user input
  const generateMealsForCurrentDay = async (userInput: string) => {
    const currentDay = DAYS_OF_WEEK[currentDayIndex];
    const newPlan = { ...mealPlan };

    // Initialize day if it doesn't exist
    if (!newPlan[currentDay]) {
      newPlan[currentDay] = {};
    }

    // Generate AI recipes for each meal slot with user preferences
    for (const meal of MEAL_SLOTS) {
      try {
        const recipe = await recipeApi.generateMealRecipe({
          mealType: meal,
          preferences: userInput,
        });

        const mealData = convertRecipeToMeal(recipe);
        newPlan[currentDay][meal] = mealData;

        // Save to backend if user is authenticated
        if (!isUnauthenticated) {
          try {
            const weekPlan = await ensureCurrentWeekMealPlan();
            if (weekPlan) {
              const itemRequest = createMealPlanItemRequest(currentDay, meal, recipe.id);
              await mealPlanApi.addMealPlanItem(weekPlan.id, itemRequest);
            }
          } catch (backendErr) {
            console.warn(`Failed to save ${meal} to backend:`, backendErr);
          }
        }
      } catch (err) {
        console.error(`Failed to generate ${meal} for ${currentDay}:`, err);
        // Continue with other meals even if one fails
      }
    }

    setMealPlan(newPlan);
  };

  // Handle mobile input submission
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || !inputValue.trim()) return;
    await handleMealGeneration(inputValue.trim());
    setInputValue("");
  };

  // Handle meal slot click
  const handleSlotClick = async (day: string, meal: MealSlot) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate AI recipe for this meal slot
      const recipe = await recipeApi.generateMealRecipe({
        mealType: meal,
        preferences: "Healthy and nutritious",
      });

      const mealData = convertRecipeToMeal(recipe);

      // Update local state immediately
      setMealPlan((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [meal]: mealData,
        },
      }));

      // Save to backend if user is authenticated
      if (!isUnauthenticated) {
        try {
          // Ensure we have a meal plan for this week
          const weekPlan = await ensureCurrentWeekMealPlan();
          if (weekPlan) {
            // Create a meal plan item with the recipe ID
            const itemRequest = createMealPlanItemRequest(day, meal, recipe.id);
            await mealPlanApi.addMealPlanItem(weekPlan.id, itemRequest);
          }
        } catch (backendErr) {
          console.warn('Failed to save to backend, but keeping local state:', backendErr);
          // Don't show error to user since the meal is still displayed locally
        }
      }
    } catch (err: unknown) {
      console.error('Failed to generate meal:', err);
      setError((err as Error).message || 'Failed to generate meal');
    } finally {
      setIsGenerating(false);
    }
  };

  // Remove meal from slot
  const removeMeal = async (dayOrKey: string, meal?: MealSlot) => {
    if (isUnauthenticated) {
      // Fallback to local state for unauthenticated users
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
      return;
    }

    try {
      if (!currentBackendPlan) return;

      let day: string;
      let mealSlot: MealSlot;

      if (meal) {
        // Desktop format: removeMeal(day, meal)
        day = dayOrKey;
        mealSlot = meal;
      } else {
        // Mobile format: removeMeal(mealKey)
        const [dayPart, mealType] = dayOrKey.split("-");
        day = dayPart;
        mealSlot = mealType as MealSlot;
      }

      // Find the meal plan item to remove
      const item = findMealPlanItem(currentBackendPlan, day, mealSlot);
      if (item) {
        await mealPlanApi.removeMealPlanItem(currentBackendPlan.id, item.id);
      }

      // Update local state
      setMealPlan((prev) => {
        const newPlan = { ...prev };
        if (newPlan[day]) {
          delete newPlan[day][mealSlot];
        }
        return newPlan;
      });

      // Note: We're not calling loadMealPlans() here to avoid overwriting local changes
      // The backend meal plan item has been removed, so local state is authoritative for display
    } catch (err: unknown) {
      console.error('Failed to remove meal from plan:', err);
      setError((err as Error).message || 'Failed to remove meal from plan');
    }
  };

  // Week navigation
  const goToPreviousWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  // Get current day for progress tracking
  const getCurrentDay = () => {
    const today = new Date();
    return DAYS_OF_WEEK[today.getDay() === 0 ? 6 : today.getDay() - 1];
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      {/* Error Message */}
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Unauthenticated Message */}
      {isUnauthenticated && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm">Sign in to save your meal plans to the cloud</p>
        </div>
      )}
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
          onGeneratePlan={generateAIMealPlan}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />

        {/* Desktop Input Bar */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (isGenerating || !inputValue.trim()) return;
              await handleMealGeneration(inputValue.trim());
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
      <div className="md:hidden h-screen w-full flex flex-col bg-gray-50 overflow-hidden fixed inset-0 pt-20">
        <NewMobileMealLayout
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