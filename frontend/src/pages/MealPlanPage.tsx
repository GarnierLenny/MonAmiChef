// src/pages/MealPlanPage.tsx
import { useState, useCallback, useEffect } from "react";
import { startOfWeek, addWeeks, subWeeks } from "date-fns";

// Import components
import { MealGrid } from "@/components/meal-plan/MealGrid";
import { NewMobileMealLayout } from "@/components/meal-plan/NewMobileMealLayout";
import { ProgressCard } from "@/components/meal-plan/ProgressCard";
import { ProgressModal } from "@/components/meal-plan/ProgressModal";
import { RecipeModal } from "@/components/meal-plan/RecipeModal";
import { SavedRecipesModal } from "@/components/meal-plan/SavedRecipesModal";
import { GuestMealPlanningCTA } from "@/components/meal-plan/GuestMealPlanningCTA";
import { ChatInput } from "@/components/ui/chat-input";

// Import constants and utils
import {
  DAYS_OF_WEEK,
  MEAL_SLOTS,
  type MealPlan,
  type MealSlot,
  type Meal,
} from "@/components/meal-plan/constants";
import { X } from "lucide-react";
import { parseMealSlots } from "@/lib/mealSlotParser";

// Import API and utilities
import { mealPlanApi, type BackendMealPlan } from "@/lib/api/mealPlanApi";
import { recipeApi } from "@/lib/api/recipeApi";
import { healthApi, type UserGoals } from "@/lib/api/healthApi";
import type { SavedRecipe } from "@/types/recipe";
import {
  createMealPlanRequest,
  createMealPlanItemRequest,
  convertBackendToFrontendMealPlan,
  findMealPlanForWeek,
  findMealPlanItem,
  requiresAuthentication,
  convertRecipeToMeal,
} from "@/lib/mealPlanUtils";

interface MealPlanPageProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export default function MealPlanPage({
  onSignUp,
  onSignIn,
}: MealPlanPageProps = {}) {
  // Input state
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState<Set<string>>(
    new Set(),
  );
  // Selected meals for targeted input
  const [selectedMeals, setSelectedMeals] = useState<Set<string>>(new Set());

  // Reset scroll position when component mounts
  useEffect(() => {
    const resetScroll = () => {
      // Reset window scroll
      window.scrollTo(0, 0);

      // Reset document scroll
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Find and reset all scrollable elements
      const allElements = document.querySelectorAll("*");
      allElements.forEach((element) => {
        if (element instanceof HTMLElement && element.scrollTop > 0) {
          element.scrollTop = 0;
        }
      });

      // Force reset specific containers
      const containers = document.querySelectorAll(
        '.mobile-viewport, [class*="overflow"]',
      );
      containers.forEach((container) => {
        if (container instanceof HTMLElement) {
          container.scrollTop = 0;
        }
      });
    };

    // Run immediately
    resetScroll();

    // Run after a short delay to catch any delayed renders
    const timeoutId = setTimeout(resetScroll, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Meal plan state
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [mealPlan, setMealPlan] = useState<MealPlan>({});

  // Calculate today's day index (0 = Monday, 6 = Sunday)
  const getTodayDayIndex = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert Sunday (0) to 6, and shift Monday-Saturday to 0-5
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(getTodayDayIndex());

  // Backend state
  const [backendMealPlans, setBackendMealPlans] = useState<BackendMealPlan[]>(
    [],
  );
  const [currentBackendPlan, setCurrentBackendPlan] =
    useState<BackendMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  // User goals state
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // Progress modal state
  const [showProgressDetails, setShowProgressDetails] = useState(false);
  const [modalDay, setModalDay] = useState<string | null>(null);

  // Recipe modal state
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  // Saved recipes modal state
  const [showSavedRecipesModal, setShowSavedRecipesModal] = useState(false);
  const [savedRecipeTargetSlot, setSavedRecipeTargetSlot] = useState<{
    day: string;
    meal: MealSlot;
  } | null>(null);

  // Load meal plans and user goals on component mount
  useEffect(() => {
    loadMealPlans();
    loadUserGoals();
  }, []);

  // Update current backend plan when week changes
  useEffect(() => {
    // Don't update if still loading initial data
    if (isLoading) return;

    const weekPlan = findMealPlanForWeek(backendMealPlans, currentWeek);
    setCurrentBackendPlan(weekPlan || null);

    if (!weekPlan) {
      // No plan for this week, clear the meal plan only if user is authenticated
      // For unauthenticated users, keep their local data
      if (!isUnauthenticated) {
        console.log(
          "[MealPlan] No backend plan found for current week, clearing meal plan",
        );
        setMealPlan({});
      }
    } else {
      // We have a backend plan for this week, populate the frontend meal plan
      console.log(
        "[MealPlan] Found backend plan for week:",
        weekPlan.id,
        "with items:",
        weekPlan.items?.length || 0,
      );
      const frontendMealPlan = convertBackendToFrontendMealPlan(weekPlan);
      console.log(
        "[MealPlan] Converted to frontend plan with days:",
        Object.keys(frontendMealPlan),
      );
      setMealPlan(frontendMealPlan);
    }
  }, [backendMealPlans, currentWeek, isUnauthenticated, isLoading]);

  // Load meal plans from backend
  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const plans = await mealPlanApi.getUserMealPlans();
      setBackendMealPlans(plans || []);
      setIsUnauthenticated(false);

      // Populate the frontend meal plan with data from the backend
      if (plans && plans.length > 0) {
        const weekPlan = findMealPlanForWeek(plans, currentWeek);
        if (weekPlan) {
          const frontendMealPlan = convertBackendToFrontendMealPlan(weekPlan);
          // Set the meal plan directly from backend data
          setMealPlan(frontendMealPlan);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load meal plans:", err);
      if (requiresAuthentication(err)) {
        setIsUnauthenticated(true);
        setBackendMealPlans([]);
        // For unauthenticated users, keep their local meal plan data
        // Don't clear it here or set error message
        console.log("Guest mode: Using local meal planning only");
      } else {
        setError((err as Error).message || "Failed to load meal plans");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load user goals from health API
  const loadUserGoals = async () => {
    try {
      setIsLoadingGoals(true);
      const goals = await healthApi.getGoals();
      setUserGoals(goals);
    } catch (err: unknown) {
      console.warn("Failed to load user goals:", err);
      // Don't show error for goals as they're optional
      setUserGoals(null);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  // Create a meal plan for the current week if it doesn't exist
  const ensureCurrentWeekMealPlan =
    async (): Promise<BackendMealPlan | null> => {
      if (isUnauthenticated) return null;

      let weekPlan = findMealPlanForWeek(backendMealPlans, currentWeek);

      if (!weekPlan) {
        try {
          const request = createMealPlanRequest(currentWeek);
          weekPlan = await mealPlanApi.createMealPlan(request);
          setBackendMealPlans((prev) => [...prev, weekPlan!]);
        } catch (err: unknown) {
          console.error("Failed to create meal plan:", err);
          setError((err as Error).message || "Failed to create meal plan");
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
              day: day,
            });

            const mealData = convertRecipeToMeal(recipe);
            newPlan[day][meal] = mealData;

            // Update meal plan in backend if user is authenticated
            if (!isUnauthenticated && currentBackendPlan) {
              const itemRequest = createMealPlanItemRequest(
                day,
                meal,
                recipe.id,
              );
              await mealPlanApi.addMealPlanItem(
                currentBackendPlan.id,
                itemRequest,
              );
            }
          } catch (err) {
            console.error(`Failed to generate ${meal} for ${day}:`, err);
            // Continue with other meals even if one fails
          }
        }
      }

      setMealPlan(newPlan);
    } catch (err: unknown) {
      console.error("Failed to generate meal plan:", err);
      setError((err as Error).message || "Failed to generate meal plan");
    } finally {
      setIsGenerating(false);
    }
  }, [mealPlan, isUnauthenticated, currentBackendPlan]);

  // Handle meal generation from user input
  const handleMealGeneration = async (text: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Parse user input to determine which meal slots to target
      const targetSlots = parseMealSlots(text);

      // Generate meals based on user input for current day
      await generateMealsForCurrentDay(text, targetSlots);
    } catch (err: unknown) {
      console.error("Failed to generate meals:", err);
      setError((err as Error).message || "Failed to generate meals");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate meals for current day based on user input
  const generateMealsForCurrentDay = async (
    userInput: string,
    targetSlots?: MealSlot[],
  ) => {
    const currentDay = DAYS_OF_WEEK[currentDayIndex];
    const newPlan = { ...mealPlan };

    // Initialize day if it doesn't exist
    if (!newPlan[currentDay]) {
      newPlan[currentDay] = {};
    }

    // Use provided target slots or default to all slots
    const slotsToGenerate = targetSlots || MEAL_SLOTS;

    // Track which slots are being generated
    const generatingSlotKeys = slotsToGenerate.map(
      (meal) => `${currentDay}-${meal}`,
    );
    setGeneratingSlots((prev) => {
      const newSet = new Set(prev);
      generatingSlotKeys.forEach((key) => newSet.add(key));
      return newSet;
    });

    // Generate AI recipes for specified meal slots with user preferences
    const generationPromises = slotsToGenerate.map(async (meal) => {
      try {
        const recipe = await recipeApi.generateMealRecipe({
          mealType: meal,
          preferences: userInput,
          day: currentDay,
        });

        const mealData = convertRecipeToMeal(recipe);
        newPlan[currentDay][meal] = mealData;

        // Save to backend if user is authenticated
        if (!isUnauthenticated) {
          try {
            const weekPlan = await ensureCurrentWeekMealPlan();
            if (weekPlan) {
              const itemRequest = createMealPlanItemRequest(
                currentDay,
                meal,
                recipe.id,
              );
              await mealPlanApi.addMealPlanItem(weekPlan.id, itemRequest);

              // Update the backend meal plan state to include the new recipe item
              setBackendMealPlans((prev) =>
                prev.map((plan) => {
                  if (plan.id === weekPlan.id) {
                    const updatedItems = plan.items || [];
                    const existingItemIndex = updatedItems.findIndex(
                      (item) =>
                        item.day === itemRequest.day &&
                        item.mealSlot === itemRequest.mealSlot,
                    );

                    const newItem = {
                      id: `temp-${Date.now()}-${meal}`, // Temporary ID
                      mealPlanId: weekPlan.id,
                      day: itemRequest.day,
                      mealSlot: itemRequest.mealSlot,
                      recipeId: recipe.id,
                      createdAt: new Date(),
                      recipe: {
                        id: recipe.id,
                        title: recipe.title,
                        content_json: recipe.content_json,
                        nutrition: recipe.nutrition,
                        tags: recipe.tags,
                        created_at: recipe.created_at,
                      },
                    };

                    if (existingItemIndex >= 0) {
                      updatedItems[existingItemIndex] = newItem;
                    } else {
                      updatedItems.push(newItem);
                    }

                    return { ...plan, items: updatedItems };
                  }
                  return plan;
                }),
              );
            }
          } catch (backendErr) {
            console.warn(`Failed to save ${meal} to backend:`, backendErr);
          }
        }

        return { meal, success: true };
      } catch (err) {
        console.error(`Failed to generate ${meal} for ${currentDay}:`, err);
        return { meal, success: false, error: err };
      } finally {
        // Remove this slot from generating state
        const slotKey = `${currentDay}-${meal}`;
        setGeneratingSlots((prev) => {
          const newSet = new Set(prev);
          newSet.delete(slotKey);
          return newSet;
        });
      }
    });

    // Wait for all generations to complete
    await Promise.allSettled(generationPromises);

    setMealPlan(newPlan);
  };

  // Handle meal selection for targeted input
  const handleMealSelection = (day: string, mealSlot: MealSlot) => {
    const mealKey = `${day}-${mealSlot}`;
    const newSelectedMeals = new Set(selectedMeals);

    if (selectedMeals.has(mealKey)) {
      newSelectedMeals.delete(mealKey);
    } else {
      newSelectedMeals.add(mealKey);
    }

    setSelectedMeals(newSelectedMeals);
  };

  // Clear selected meals
  const clearSelectedMeals = () => {
    setSelectedMeals(new Set());
  };

  // Handle mobile input submission
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || (!inputValue.trim() && selectedMeals.size === 0))
      return;

    // Append selected meals to the input behind the scenes
    let finalInput = inputValue.trim();
    if (selectedMeals.size > 0) {
      const mealTypes = Array.from(selectedMeals).map((mealKey) => {
        const [day, slot] = mealKey.split("-");
        return slot; // Just the meal type (breakfast, lunch, dinner)
      });
      const uniqueMealTypes = [...new Set(mealTypes)];
      const mealSuffix = ` for ${uniqueMealTypes.join(" and ")}`;
      finalInput = finalInput
        ? `${finalInput}${mealSuffix}`
        : `something${mealSuffix}`;
    }

    await handleMealGeneration(finalInput);
    setInputValue("");
    setSelectedMeals(new Set()); // Clear selected meals after submission
  };

  // Handle meal slot click
  const handleSlotClick = async (day: string, meal: MealSlot) => {
    const slotKey = `${day}-${meal}`;
    setGeneratingSlots((prev) => new Set(prev).add(slotKey));
    setError(null);

    try {
      // Generate AI recipe for this meal slot
      const recipe = await recipeApi.generateMealRecipe({
        mealType: meal,
        preferences: "Healthy and nutritious",
        day: day,
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

            // Update the backend meal plan state to include the new recipe item
            // This prevents the useEffect from overwriting our local state
            setBackendMealPlans((prev) =>
              prev.map((plan) => {
                if (plan.id === weekPlan.id) {
                  const updatedItems = plan.items || [];
                  const existingItemIndex = updatedItems.findIndex(
                    (item) =>
                      item.day === itemRequest.day &&
                      item.mealSlot === itemRequest.mealSlot,
                  );

                  const newItem = {
                    id: `temp-${Date.now()}`, // Temporary ID
                    mealPlanId: weekPlan.id,
                    day: itemRequest.day,
                    mealSlot: itemRequest.mealSlot,
                    recipeId: recipe.id,
                    createdAt: new Date(),
                    recipe: {
                      id: recipe.id,
                      title: recipe.title,
                      content_json: recipe.content_json,
                      nutrition: recipe.nutrition,
                      tags: recipe.tags,
                      created_at: recipe.created_at,
                    },
                  };

                  if (existingItemIndex >= 0) {
                    updatedItems[existingItemIndex] = newItem;
                  } else {
                    updatedItems.push(newItem);
                  }

                  return { ...plan, items: updatedItems };
                }
                return plan;
              }),
            );
          }
        } catch (backendErr) {
          console.warn(
            "Failed to save to backend, but keeping local state:",
            backendErr,
          );
          // Don't show error to user since the meal is still displayed locally
        }
      }
    } catch (err: unknown) {
      console.error("Failed to generate meal:", err);
      setError((err as Error).message || "Failed to generate meal");
    } finally {
      setGeneratingSlots((prev) => {
        const newSet = new Set(prev);
        newSet.delete(slotKey);
        return newSet;
      });
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
      console.error("Failed to remove meal from plan:", err);
      setError((err as Error).message || "Failed to remove meal from plan");
    }
  };

  // Context menu actions for filled meal cards
  const handleShowRecipe = (day: string, meal: MealSlot) => {
    const mealData = mealPlan[day]?.[meal];
    if (mealData) {
      setSelectedMeal(mealData);
      setShowRecipeModal(true);
    }
  };

  const handleRegenerate = async (day: string, meal: MealSlot) => {
    // Use the same logic as handleSlotClick to regenerate the meal
    await handleSlotClick(day, meal);
  };

  const handleDeleteMeal = async (day: string, meal: MealSlot) => {
    await removeMeal(day, meal);
    // Unselect the meal if it was selected
    const slotKey = `${day}-${meal}`;
    if (selectedMeals.has(slotKey)) {
      handleMealSelection(day, meal);
    }
  };

  const handleSavedMeals = (day: string, meal: MealSlot) => {
    setSavedRecipeTargetSlot({ day, meal });
    setShowSavedRecipesModal(true);
  };

  const handleSelectSavedRecipe = async (savedRecipe: SavedRecipe) => {
    if (!savedRecipeTargetSlot) return;

    const { day, meal } = savedRecipeTargetSlot;

    // Convert saved recipe to meal format
    const mealFromRecipe = convertRecipeToMeal(savedRecipe.recipe);

    // Update local state
    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: mealFromRecipe,
      },
    }));

    // Save to backend if user is authenticated
    if (!isUnauthenticated) {
      try {
        const weekPlan = await ensureCurrentWeekMealPlan();
        if (weekPlan) {
          const itemRequest = createMealPlanItemRequest(
            day,
            meal,
            savedRecipe.recipe,
          );
          await mealPlanApi.addMealPlanItem(weekPlan.id, itemRequest);
        }
      } catch (err) {
        console.warn("Failed to save to backend:", err);
      }
    }

    // Reset modal state
    setSavedRecipeTargetSlot(null);
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
      <div className="flex mobile-viewport w-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  // Show guest CTA if user is unauthenticated
  if (isUnauthenticated) {
    return <GuestMealPlanningCTA onSignUp={onSignUp} onSignIn={onSignIn} />;
  }

  return (
    <div className="flex mobile-viewport bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 overflow-hidden">
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
          <p className="text-sm">
            Sign in to save your meal plans to the cloud
          </p>
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
            userGoals={userGoals}
            selectedMeals={selectedMeals}
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
          selectedMeals={selectedMeals}
          onMealSelection={handleMealSelection}
        />

        {/* Desktop Selected Meal Tags and Input Bar - Only show when meals are selected */}
        {selectedMeals.size > 0 && (
          <>
            {/* Desktop Selected Meal Tags */}
            <div className="px-6 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedMeals).map((mealKey, index) => {
                    const [day, slot] = mealKey.split("-");
                    const slotName =
                      slot.charAt(0).toUpperCase() + slot.slice(1);

                    // Vary colors for different tags
                    const colors = [
                      "bg-orange-100 text-orange-700",
                      "bg-green-100 text-green-700",
                      "bg-blue-100 text-blue-700",
                    ];

                    return (
                      <div
                        key={mealKey}
                        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border border-current/20 ${colors[index % colors.length]}`}
                      >
                        <span>{slotName}</span>
                        <button
                          onClick={() => {
                            const [day, slot] = mealKey.split("-");
                            handleMealSelection(day, slot as MealSlot);
                          }}
                          className="h-auto p-0.5 hover:bg-current/20 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={clearSelectedMeals}
                  className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Desktop Input Bar */}
            <div className="border-t border-gray-200 bg-white">
              <ChatInput
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    isGenerating ||
                    (!inputValue.trim() && selectedMeals.size === 0)
                  )
                    return;

                  // Append selected meals to the input behind the scenes
                  let finalInput = inputValue.trim();
                  if (selectedMeals.size > 0) {
                    const mealTypes = Array.from(selectedMeals).map(
                      (mealKey) => {
                        const [day, slot] = mealKey.split("-");
                        return slot; // Just the meal type (breakfast, lunch, dinner)
                      },
                    );
                    const uniqueMealTypes = [...new Set(mealTypes)];
                    const mealSuffix = ` for ${uniqueMealTypes.join(" and ")}`;
                    finalInput = finalInput
                      ? `${finalInput}${mealSuffix}`
                      : `something${mealSuffix}`;
                  }

                  await handleMealGeneration(finalInput);
                  setInputValue("");
                  setSelectedMeals(new Set()); // Clear selected meals after submission
                }}
                isGenerating={isGenerating}
                placeholder="Veggie high protein"
                canSend={inputValue.trim() !== "" || selectedMeals.size > 0}
                className="p-6 bg-white"
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mobile-viewport w-full flex flex-col bg-gray-50 overflow-hidden">
        <NewMobileMealLayout
          currentWeek={currentWeek}
          currentDayIndex={currentDayIndex}
          setCurrentDayIndex={setCurrentDayIndex}
          setCurrentWeek={setCurrentWeek}
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
          onShowRecipe={handleShowRecipe}
          onRegenerate={handleRegenerate}
          onDeleteMeal={handleDeleteMeal}
          onSavedMeals={handleSavedMeals}
          generatingSlots={generatingSlots}
          userGoals={userGoals}
          selectedMeals={selectedMeals}
          onMealSelection={handleMealSelection}
          onClearSelectedMeals={clearSelectedMeals}
        />
      </div>

      {/* Progress Details Modal */}
      <ProgressModal
        isOpen={showProgressDetails}
        onClose={setShowProgressDetails}
        mealPlan={mealPlan}
        currentDay={modalDay || getCurrentDay()}
      />

      {/* Recipe Details Modal */}
      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        meal={selectedMeal}
      />

      {/* Saved Recipes Modal */}
      <SavedRecipesModal
        isOpen={showSavedRecipesModal}
        onClose={() => setShowSavedRecipesModal(false)}
        onSelectRecipe={handleSelectSavedRecipe}
        isAuthenticated={!isUnauthenticated}
      />
    </div>
  );
}
