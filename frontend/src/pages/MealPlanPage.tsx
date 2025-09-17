// src/pages/MealPlanPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Calendar, Utensils, Plus, X, ChefHat } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import type { ChatMessage } from "../types/types";

// interface MealPlanPageProps {
//   user?: User | null;
//   onAuthClick?: () => void;
// }

// Fake meal data for development
const FAKE_MEALS = {
  breakfast: [
    { id: "b1", title: "Avocado Toast", image: "🥑", description: "Whole grain toast with fresh avocado" },
    { id: "b2", title: "Greek Yogurt Bowl", image: "🥣", description: "Greek yogurt with berries and granola" },
    { id: "b3", title: "Oatmeal with Berries", image: "🥣", description: "Steel-cut oats with fresh berries" },
    { id: "b4", title: "Scrambled Eggs", image: "🍳", description: "Fluffy scrambled eggs with herbs" },
    { id: "b5", title: "Smoothie Bowl", image: "🥤", description: "Tropical smoothie bowl with toppings" },
  ],
  lunch: [
    { id: "l1", title: "Caesar Salad", image: "🥗", description: "Classic caesar with homemade dressing" },
    { id: "l2", title: "Grilled Chicken Wrap", image: "🌯", description: "Grilled chicken with fresh vegetables" },
    { id: "l3", title: "Quinoa Bowl", image: "🍲", description: "Quinoa with roasted vegetables" },
    { id: "l4", title: "Soup & Sandwich", image: "🥪", description: "Tomato soup with grilled cheese" },
    { id: "l5", title: "Pasta Salad", image: "🍝", description: "Mediterranean pasta salad" },
  ],
  dinner: [
    { id: "d1", title: "Grilled Salmon", image: "🐟", description: "Atlantic salmon with lemon herbs" },
    { id: "d2", title: "Chicken Stir Fry", image: "🍜", description: "Asian-style chicken and vegetables" },
    { id: "d3", title: "Beef Tacos", image: "🌮", description: "Ground beef tacos with fresh toppings" },
    { id: "d4", title: "Vegetable Curry", image: "🍛", description: "Coconut curry with mixed vegetables" },
    { id: "d5", title: "Pizza Night", image: "🍕", description: "Homemade pizza with favorite toppings" },
  ],
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;

type MealSlot = typeof MEAL_SLOTS[number];

interface MealPlan {
  [day: string]: {
    [K in MealSlot]?: {
      id: string;
      title: string;
      image: string;
      description: string;
    }
  };
}

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
        const randomMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];
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
    setMessages(prev => [...prev, userMessage]);
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

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsGenerating(false);

      // Update meal plan after AI response
      generateFakeMealPlan();
    }, 2000);
  };

  // Handle meal slot click
  const handleSlotClick = (day: string, meal: MealSlot) => {
    const mealOptions = FAKE_MEALS[meal];
    const randomMeal = mealOptions[Math.floor(Math.random() * mealOptions.length)];

    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: randomMeal,
      },
    }));
  };

  // Remove meal from slot
  const removeMeal = (dayOrKey: string, meal?: MealSlot) => {
    setMealPlan(prev => {
      const newPlan = { ...prev };

      if (meal) {
        // Desktop format: removeMeal(day, meal)
        const day = dayOrKey;
        if (newPlan[day]) {
          delete newPlan[day][meal];
        }
      } else {
        // Mobile format: removeMeal(mealKey)
        const [day, mealType] = dayOrKey.split('-');
        if (newPlan[day]) {
          delete newPlan[day][mealType as MealSlot];
        }
      }

      return newPlan;
    });
  };

  // Week navigation
  const goToPreviousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));

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
              <h2 className="text-xl font-bold text-white">Meal Planning Chat</h2>
              <p className="text-orange-100 text-sm">Your AI cooking assistant</p>
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
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about meal planning, dietary preferences..."
              disabled={isGenerating}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Send className="w-4 h-4" />
            </Button>
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
                <h1 className="text-3xl font-bold text-gray-900">Weekly Meal Plan</h1>
                <p className="text-gray-600">
                  Week of {format(currentWeek, "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={goToPreviousWeek}
                size="sm"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={goToNextWeek}
                size="sm"
              >
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
                  <div className="text-sm text-gray-500">{format(dayDate, "EEE")}</div>
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
                <div key={`${meal}-label`} className="flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {meal}
                  </span>
                </div>

                {/* Meal slots for each day */}
                {DAYS_OF_WEEK.map((day) => (
                  <Card
                    key={`${day}-${meal}`}
                    className="h-32 cursor-pointer hover:shadow-md transition-shadow group"
                    onClick={() => handleSlotClick(day, meal)}
                  >
                    <CardContent className="p-3 h-full flex flex-col">
                      {mealPlan[day]?.[meal] ? (
                        <>
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
                          <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="text-2xl mb-1">
                              {mealPlan[day][meal]?.image}
                            </div>
                            <span className="text-xs font-medium line-clamp-2">
                              {mealPlan[day][meal]?.title}
                            </span>
                          </div>
                        </>
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
      <div className="md:hidden h-screen w-full flex flex-col bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 overflow-hidden fixed inset-0 pt-16">
        {/* Mobile Meal Cards - Full screen width, no scrolling */}
        <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden min-h-0">
          {MEAL_SLOTS.map((meal) => {
            // Use Monday as default day since we removed day navigation
            const currentDay = "Monday";
            const mealKey = `${currentDay}-${meal}`;
            const assignedMeal = mealAssignments[mealKey];

            return (
              <Card key={meal} className="flex-1 w-full border-2 border-gray-200 rounded-xl min-h-0">
                <CardContent className="p-3 h-full flex flex-col">
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <div className="mb-2">
                      <span className="text-base font-semibold text-gray-700 capitalize">
                        {meal}
                      </span>
                    </div>

                    {assignedMeal ? (
                      <div className="flex flex-col items-center justify-center flex-1">
                        <div className="text-2xl mb-1">{assignedMeal.image}</div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {assignedMeal.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {assignedMeal.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMeal(mealKey)}
                          className="mt-1 text-red-500 hover:text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1">
                        <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                          <Plus className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Add {meal}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile Chat Input - Always visible at bottom */}
        <div className="flex-shrink-0 bg-white border-t px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about meal planning..."
              disabled={isGenerating}
              className="flex-1 rounded-full border-gray-300"
            />
            <Button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              size="sm"
              className="px-4 rounded-full bg-orange-500 hover:bg-orange-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}