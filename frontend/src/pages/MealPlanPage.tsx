// src/pages/MealPlanPage.tsx
import { useState, useCallback } from "react";
import { startOfWeek, addWeeks, subWeeks } from "date-fns";
import type { ChatMessage } from "../types/types";

// Import components
import { ChatPanel } from "@/components/meal-plan/ChatPanel";
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

const initialChatMessage: ChatMessage = {
  id: "initial",
  role: "model",
  text: "Hi! I'm your AI meal planning assistant. Tell me about your dietary preferences, cooking goals, or what you'd like to eat this week, and I'll help you plan amazing meals!",
  timestamp: new Date(),
};

export default function MealPlanPage() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([initialChatMessage]);
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

  // Handle chat message submission
  const handleMessageSubmit = (text: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    // Simulate AI response for meal planning
    setTimeout(() => {
      const responses = [
        "Great! Based on your preferences, I'll update your meal plan with some delicious options. Let me add some variety to your week!",
        "Perfect! I've analyzed your request and I'm updating your meal grid with personalized recommendations.",
        "Excellent choice! I'm refreshing your meal plan with options that match what you're looking for.",
        "I love that idea! Let me update your weekly meal grid with some fantastic recipes that fit your requirements.",
        "That sounds delicious! I'm adding some great meal options to your calendar based on your preferences.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);

      // Update meal plan after AI response
      generateFakeMealPlan();
    }, 2000);
  };

  // Handle mobile chat submission
  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || !inputValue.trim()) return;
    handleMessageSubmit(inputValue.trim());
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
      {/* Left Chat Panel */}
      <ChatPanel
        messages={messages}
        onMessageSubmit={handleMessageSubmit}
        isGenerating={isGenerating}
      />

      {/* Right Meal Plan Grid */}
      <div className="hidden md:flex md:flex-1 flex-col overflow-hidden">
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