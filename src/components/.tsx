import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, ChefHat, Sparkles } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  recipe?: any;
}

interface ChatInterfaceProps {
  preferences: {
    mealType: string[];
    mealOccasion: string[];
    cookingEquipment: string[];
    cookingTime: string[];
    skillLevel: string[];
    nutrition: string[];
    cuisine: string[];
    spiceLevel: string[];
    meat: string[];
    vegetables: string[];
    servings: number | null;
    cooks: number | null;
  };
  onRecipeGenerated: (recipe: any) => void;
}

export default function ChatInterface({
  preferences,
  onRecipeGenerated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your AI cooking assistant. Tell me what ingredients you have (max 20 characters) and I'll create a personalized recipe for you based on your preferences!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maxCharacters = 20;
  const remainingCharacters = maxCharacters - inputValue.length;
  const isOverLimit = inputValue.length > maxCharacters;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateRecipe = async (userInput: string) => {
    setIsGenerating(true);

    try {
      // Use deployed backend in production, local backend in development
      const isDevelopment = import.meta.env.DEV;
      const backendUrl = isDevelopment
        ? "http://localhost:8888/.netlify/functions/generate-recipe"
        : "https://coruscating-liger-f3de25.netlify.app/.netlify/functions/generate-recipe";
      console.log("test", backendUrl);
      // Prepare the request payload with user input and preferences
      const requestPayload = {
        ingredients: userInput,
        preferences: {
          mealType: preferences.mealType,
          mealOccasion: preferences.mealOccasion,
          cookingEquipment: preferences.cookingEquipment,
          cookingTime: preferences.cookingTime,
          skillLevel: preferences.skillLevel,
          nutrition: preferences.nutrition,
          cuisine: preferences.cuisine,
          spiceLevel: preferences.spiceLevel,
          meat: preferences.meat,
          vegetables: preferences.vegetables,
          servings: preferences.servings || 4,
          cooks: preferences.cooks || 1,
        },
      };

      // Call your deployed backend API
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const recipeData = await response.json();

      // Transform the API response to match our expected format
      const recipe = {
        id: Date.now().toString(),
        title: recipeData.title || "Generated Recipe",
        ingredients: recipeData.ingredients || [],
        instructions: recipeData.instructions || [],
        prepTime: recipeData.prepTime || 15,
        cookTime: recipeData.cookTime || 25,
        servings: recipeData.servings || preferences.servings || 4,
        nutrition: {
          calories: recipeData.nutrition?.calories || 0,
          protein: recipeData.nutrition?.protein || 0,
          carbs: recipeData.nutrition?.carbs || 0,
          fat: recipeData.nutrition?.fat || 0,
          fiber: recipeData.nutrition?.fiber || 0,
        },
        createdAt: new Date(),
      };

      const recipeMessage = `Here's a delicious recipe I created for you!\n\n**${recipe.title}**\n\n*Serves ${recipe.servings} • ${recipe.prepTime + recipe.cookTime} minutes*\n\n**Ingredients:**\n${recipe.ingredients.map((ing) => `• ${ing}`).join("\n")}\n\n**Instructions:**\n${recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n")}\n\n**Nutrition per serving:**\n• Calories: ${recipe.nutrition.calories}\n• Protein: ${recipe.nutrition.protein}g\n• Carbs: ${recipe.nutrition.carbs}g\n• Fat: ${recipe.nutrition.fat}g`;

      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: recipeMessage,
        timestamp: new Date(),
        recipe: recipe,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onRecipeGenerated(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);

      // Show error message to user
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `I'm sorry, I encountered an error while generating your recipe. Please try again in a moment.\n\nError: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating || isOverLimit) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    await generateRecipe(inputValue);
  };

  const formatMessage = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <div key={index} className="font-bold text-gray-900 mt-3 mb-2">
            {line.slice(2, -2)}
          </div>
        );
      }
      if (line.startsWith("*") && line.endsWith("*")) {
        return (
          <div key={index} className="italic text-gray-600 mb-3">
            {line.slice(1, -1)}
          </div>
        );
      }
      if (line.startsWith("• ")) {
        return (
          <div key={index} className="ml-4 text-gray-700">
            {line}
          </div>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <div key={index} className="ml-4 text-gray-700 mb-1">
            {line}
          </div>
        );
      }
      return (
        <div key={index} className="text-gray-700 mb-1">
          {line}
        </div>
      );
    });
  };

  const getPreferenceSummary = () => {
    const parts = [];
    if (preferences.mealType.length > 0) {
      parts.push(`${preferences.mealType.join(", ")}`);
    }
    if (preferences.mealOccasion.length > 0) {
      parts.push(`${preferences.mealOccasion.join(", ")}`);
    }
    if (preferences.cookingEquipment.length > 0) {
      parts.push(`${preferences.cookingEquipment.join(", ")}`);
    }
    if (preferences.cookingTime.length > 0) {
      parts.push(`${preferences.cookingTime.join(", ")}`);
    }
    if (preferences.skillLevel.length > 0) {
      parts.push(`${preferences.skillLevel.join(", ")} level`);
    }
    if (preferences.nutrition.length > 0) {
      parts.push(`${preferences.nutrition.join(", ")} focus`);
    }
    if (preferences.cuisine.length > 0) {
      parts.push(`${preferences.cuisine.join(", ")} cuisine`);
    }
    if (preferences.spiceLevel.length > 0) {
      parts.push(`${preferences.spiceLevel.join(", ")} spice`);
    }
    if (preferences.meat.length > 0) {
      parts.push(`${preferences.meat.join(", ")}`);
    }
    if (preferences.vegetables.length > 0) {
      parts.push(`${preferences.vegetables.join(", ")}`);
    }
    if (preferences.servings) {
      parts.push(`serves ${preferences.servings}`);
    }
    if (preferences.cooks) {
      parts.push(
        `${preferences.cooks} cook${preferences.cooks > 1 ? "s" : ""}`,
      );
    }
    return parts.length > 0 ? `(${parts.join(", ")})` : "";
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-100 to-pink-100 border-b border-orange-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              AI Recipe Generator
            </h1>
            <p className="text-sm text-orange-700">
              Your personal cooking assistant {getPreferenceSummary()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3xl rounded-2xl px-6 py-4 ${
                message.type === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.type === "assistant" && (
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    AI Chef
                  </span>
                </div>
              )}
              <div className="whitespace-pre-wrap">
                {message.type === "assistant"
                  ? formatMessage(message.content)
                  : message.content}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-3xl rounded-2xl px-6 py-4 bg-gray-100">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600">
                  AI Chef
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span className="text-gray-600">
                  Creating your perfect recipe...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Tell me what ingredients you have or what you're craving...
          </span>
          <span
            className={`text-sm font-medium ${
              isOverLimit
                ? "text-red-600"
                : remainingCharacters <= 5
                  ? "text-orange-600"
                  : "text-gray-500"
            }`}
          >
            {remainingCharacters} characters left
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., chicken, rice..."
            maxLength={maxCharacters + 10} // Allow typing beyond limit to show error
            className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-colors ${
              isOverLimit
                ? "border-red-300 focus:ring-red-500 bg-red-50"
                : "border-gray-300 focus:ring-orange-500"
            }`}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating || isOverLimit}
            className={`px-6 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
              isOverLimit ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        {isOverLimit && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">
              Please keep your message under {maxCharacters} characters
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
