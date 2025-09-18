// src/pages/MealPlanPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Loader2,
  Calendar,
  Utensils,
  Plus,
  X,
  ChefHat,
  Clock,
  User,
  Zap,
} from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import type { ChatMessage } from "../types/types";

// interface MealPlanPageProps {
//   user?: User | null;
//   onAuthClick?: () => void;
// }

// Fake meal data for development
const FAKE_MEALS = {
  breakfast: [
    {
      id: "b1",
      title: "Overnight Oats with Berries & Nuts",
      image: "🥣",
      description: "Steel-cut oats with fresh berries and almonds",
      servings: 1,
      cookingTime: 20,
      calories: 320,
      grade: "A",
      macros: { protein: 20, carbs: 45, fat: 10 },
    },
    {
      id: "b2",
      title: "Greek Yogurt Bowl",
      image: "🥣",
      description: "Greek yogurt with berries and granola",
      servings: 1,
      cookingTime: 5,
      calories: 280,
      grade: "A",
      macros: { protein: 18, carbs: 35, fat: 8 },
    },
    {
      id: "b3",
      title: "Avocado Toast with Eggs",
      image: "🥑",
      description: "Whole grain toast with fresh avocado and poached eggs",
      servings: 1,
      cookingTime: 15,
      calories: 420,
      grade: "B",
      macros: { protein: 22, carbs: 28, fat: 18 },
    },
    {
      id: "b4",
      title: "Scrambled Eggs with Herbs",
      image: "🍳",
      description: "Fluffy scrambled eggs with fresh herbs",
      servings: 1,
      cookingTime: 10,
      calories: 250,
      grade: "A",
      macros: { protein: 20, carbs: 5, fat: 15 },
    },
    {
      id: "b5",
      title: "Smoothie Bowl",
      image: "🥤",
      description: "Tropical smoothie bowl with coconut toppings",
      servings: 1,
      cookingTime: 8,
      calories: 350,
      grade: "B",
      macros: { protein: 12, carbs: 55, fat: 12 },
    },
  ],
  lunch: [
    {
      id: "l1",
      title: "Mediterranean Quinoa Bowl",
      image: "🥗",
      description: "Quinoa with fresh vegetables and feta",
      servings: 1,
      cookingTime: 25,
      calories: 450,
      grade: "A",
      macros: { protein: 18, carbs: 52, fat: 16 },
    },
    {
      id: "l2",
      title: "Grilled Chicken Wrap",
      image: "🌯",
      description: "Lean chicken with fresh vegetables in whole wheat wrap",
      servings: 1,
      cookingTime: 15,
      calories: 380,
      grade: "A",
      macros: { protein: 32, carbs: 35, fat: 12 },
    },
    {
      id: "l3",
      title: "Asian Buddha Bowl",
      image: "🍲",
      description: "Brown rice with tofu and mixed vegetables",
      servings: 1,
      cookingTime: 30,
      calories: 420,
      grade: "A",
      macros: { protein: 22, carbs: 48, fat: 14 },
    },
    {
      id: "l4",
      title: "Turkey & Avocado Sandwich",
      image: "🥪",
      description: "Lean turkey with avocado on whole grain bread",
      servings: 1,
      cookingTime: 10,
      calories: 390,
      grade: "B",
      macros: { protein: 28, carbs: 32, fat: 16 },
    },
    {
      id: "l5",
      title: "Mediterranean Pasta Salad",
      image: "🍝",
      description: "Whole wheat pasta with olives and vegetables",
      servings: 1,
      cookingTime: 20,
      calories: 410,
      grade: "B",
      macros: { protein: 15, carbs: 58, fat: 14 },
    },
  ],
  dinner: [
    {
      id: "d1",
      title: "Grilled Salmon with Vegetables",
      image: "🐟",
      description: "Atlantic salmon with roasted seasonal vegetables",
      servings: 1,
      cookingTime: 35,
      calories: 520,
      grade: "A",
      macros: { protein: 42, carbs: 18, fat: 28 },
    },
    {
      id: "d2",
      title: "Chicken Stir Fry",
      image: "🍜",
      description: "Lean chicken with mixed vegetables and brown rice",
      servings: 1,
      cookingTime: 25,
      calories: 480,
      grade: "A",
      macros: { protein: 38, carbs: 45, fat: 15 },
    },
    {
      id: "d3",
      title: "Lean Beef Tacos",
      image: "🌮",
      description: "Grass-fed beef with fresh toppings in corn tortillas",
      servings: 2,
      cookingTime: 20,
      calories: 650,
      grade: "B",
      macros: { protein: 35, carbs: 48, fat: 22 },
    },
    {
      id: "d4",
      title: "Vegetable Curry with Rice",
      image: "🍛",
      description: "Coconut curry with mixed vegetables and brown rice",
      servings: 1,
      cookingTime: 40,
      calories: 420,
      grade: "A",
      macros: { protein: 16, carbs: 62, fat: 12 },
    },
    {
      id: "d5",
      title: "Margherita Pizza",
      image: "🍕",
      description: "Homemade thin crust with fresh mozzarella and basil",
      servings: 2,
      cookingTime: 45,
      calories: 780,
      grade: "C",
      macros: { protein: 28, carbs: 85, fat: 32 },
    },
  ],
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;

type MealSlot = (typeof MEAL_SLOTS)[number];

interface MealPlan {
  [day: string]: {
    [K in MealSlot]?: {
      id: string;
      title: string;
      image: string;
      description: string;
      servings: number;
      cookingTime: number;
      calories: number;
      grade: "A" | "B" | "C";
      macros: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
  };
}

const initialChatMessage: ChatMessage = {
  id: "initial",
  role: "model",
  text: "Hi! I'm your AI meal planning assistant. Tell me about your dietary preferences, cooking goals, or what you'd like to eat this week, and I'll help you plan amazing meals!",
  timestamp: new Date(),
};

// Helper function for grade badge styling
const getGradeStyles = (grade: "A" | "B" | "C") => {
  switch (grade) {
    case "A":
      return "bg-green-500 text-white";
    case "B":
      return "bg-yellow-500 text-white";
    case "C":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Helper function for macro badge styling
const getMacroStyles = (type: "protein" | "carbs" | "fat") => {
  switch (type) {
    case "protein":
      return "bg-green-100 text-green-800 border-green-200";
    case "carbs":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "fat":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function MealPlanPage() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([initialChatMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Meal plan state
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Calculate week start for consistency
  const weekStart = startOfWeek(currentWeek);

  // Convert meal plan to assignments format for mobile
  const mealAssignments: Record<string, any> = {};
  Object.entries(mealPlan).forEach(([day, meals]) => {
    Object.entries(meals).forEach(([meal, mealData]) => {
      mealAssignments[`${day}-${meal}`] = mealData;
    });
  });

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    const text = inputValue.trim();
    if (!text) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      {/* Left Chat Panel - 1/3 - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/3 bg-white border-r border-gray-200 flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-pink-500">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Meal Planning Chat
              </h2>
              <p className="text-orange-100 text-sm">
                Your AI cooking assistant
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-4 mb-2 p-2 pl-5 bg-white flex-1 shadow-lg shadow-orange-500/30 border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 rounded-full transition-colors"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about meal planning, dietary preferences..."
              disabled={isGenerating}
              className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              className={`shrink-0 rounded-full px-4 py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
                !inputValue.trim() || isGenerating
                  ? "bg-gray-400"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Meal Plan Grid - 2/3 - Hidden on mobile */}
      <div className="hidden md:flex md:flex-1 flex-col overflow-hidden">
        {/* Grid Header */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Weekly Meal Plan
                </h1>
                <p className="text-gray-600">
                  Week of {format(currentWeek, "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={goToPreviousWeek} size="sm">
                Previous
              </Button>
              <Button variant="outline" onClick={goToNextWeek} size="sm">
                Next
              </Button>
              <Button
                onClick={generateFakeMealPlan}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <Utensils className="w-4 h-4 mr-2" />
                Generate Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Meal Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-8 gap-4">
            {/* Header row */}
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">Meals</span>
            </div>
            {DAYS_OF_WEEK.map((day, index) => {
              const dayDate = addDays(currentWeek, index);
              return (
                <div key={day} className="text-center">
                  <div className="text-sm text-gray-500">
                    {format(dayDate, "EEE")}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {format(dayDate, "d")}
                  </div>
                </div>
              );
            })}

            {/* Grid rows */}
            {MEAL_SLOTS.map((meal) => (
              <>
                {/* Meal label */}
                <div
                  key={`${meal}-label`}
                  className="flex items-center justify-center"
                >
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {meal}
                  </span>
                </div>

                {/* Meal slots for each day */}
                {DAYS_OF_WEEK.map((day) => (
                  <Card
                    key={`${day}-${meal}`}
                    className="h-48 cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleSlotClick(day, meal)}
                  >
                    <CardContent className="p-3 h-full flex flex-col">
                      {mealPlan[day]?.[meal] ? (
                        <div className="flex flex-col h-full">
                          {/* Remove button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-end p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeMeal(day, meal);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>

                          {/* Header with title and grade */}
                          <div className="flex items-start justify-between mb-2 -mt-6">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                                {mealPlan[day][meal]?.title}
                              </h4>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 ${getGradeStyles(mealPlan[day][meal]?.grade || "A")}`}
                            >
                              {mealPlan[day][meal]?.grade}
                            </div>
                          </div>

                          {/* Info Row */}
                          <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{mealPlan[day][meal]?.servings}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{mealPlan[day][meal]?.cookingTime}m</span>
                            </div>
                          </div>

                          {/* Calories */}
                          <div className="flex items-center gap-1 mb-2 text-xs">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="font-medium">
                              {mealPlan[day][meal]?.calories} cal
                            </span>
                          </div>

                          {/* Macros */}
                          <div className="flex items-center gap-1 flex-wrap mt-auto">
                            <div
                              className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getMacroStyles("protein")}`}
                            >
                              P {mealPlan[day][meal]?.macros.protein}g
                            </div>
                            <div
                              className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getMacroStyles("carbs")}`}
                            >
                              C {mealPlan[day][meal]?.macros.carbs}g
                            </div>
                            <div
                              className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getMacroStyles("fat")}`}
                            >
                              F {mealPlan[day][meal]?.macros.fat}g
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <Plus className="h-6 w-6 mx-auto mb-1" />
                            <span className="text-xs">Add Meal</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Layout - Day-by-day meal cards */}
      <div className="md:hidden h-screen w-full flex flex-col bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 overflow-hidden fixed inset-0 pt-20">
        {/* Mobile Meal Cards - Full screen width, no scrolling */}
        <div className="flex-1 px-4 pt-4 pb-4 flex flex-col gap-3 overflow-hidden min-h-0">
          {MEAL_SLOTS.map((meal) => {
            // Use current day from navigation
            const currentDay = DAYS_OF_WEEK[currentDayIndex];
            const mealKey = `${currentDay}-${meal}`;
            const assignedMeal = mealAssignments[mealKey];

            return (
              <Card
                key={meal}
                className="flex-1 w-full border-2 border-gray-200 rounded-xl min-h-0 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSlotClick(currentDay, meal)}
              >
                <CardContent className="p-4 h-full flex flex-col">
                  {assignedMeal ? (
                    <div className="flex flex-col h-full">
                      {/* Header with meal type, title and grade */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            {meal}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                            {assignedMeal.title}
                          </h3>
                        </div>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ml-3 flex-shrink-0 ${getGradeStyles(assignedMeal.grade)}`}
                        >
                          {assignedMeal.grade}
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>Servings: {assignedMeal.servings}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{assignedMeal.cookingTime} min</span>
                        </div>
                      </div>

                      {/* Calories */}
                      <div className="flex items-center gap-1 mb-3 text-xs">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="font-medium">
                          {assignedMeal.calories} cal
                        </span>
                      </div>

                      {/* Macros */}
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getMacroStyles("protein")}`}
                        >
                          P {assignedMeal.macros.protein}g
                        </div>
                        <div
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getMacroStyles("carbs")}`}
                        >
                          C {assignedMeal.macros.carbs}g
                        </div>
                        <div
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getMacroStyles("fat")}`}
                        >
                          F {assignedMeal.macros.fat}g
                        </div>
                      </div>

                      {/* Remove Button */}
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeal(mealKey)}
                        className="mt-auto text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2 text-xs self-start"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Raemove
                      </Button> */}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="mb-3">
                        <span className="text-base font-semibold text-gray-700 capitalize">
                          {meal}
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center flex-1">
                        <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                          <Plus className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Add {meal}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Day Navigation Bar - Above input */}
        <div className="flex-shrink-0 px-6 py-2">
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-2">
            <button
              onClick={() =>
                setCurrentDayIndex(Math.max(0, currentDayIndex - 1))
              }
              disabled={currentDayIndex === 0}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-gray-600 text-base">‹</span>
            </button>

            <div className="text-center">
              <div className="text-gray-800 font-semibold text-base">
                {format(addDays(weekStart, currentDayIndex), "EEEE, MMM d")}
              </div>
            </div>

            <button
              onClick={() =>
                setCurrentDayIndex(Math.min(6, currentDayIndex + 1))
              }
              disabled={currentDayIndex === 6}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-gray-600 text-base">›</span>
            </button>
          </div>
        </div>

        {/* Mobile Chat Input - Always visible at bottom */}
        <div className="flex-shrink-0 px-4 pb-3">
          <form
            onSubmit={handleSubmit}
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
            <button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              className={`shrink-0 rounded-full px-4 py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
                !inputValue.trim() || isGenerating
                  ? "bg-gray-400"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
