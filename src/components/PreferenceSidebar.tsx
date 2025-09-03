import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Beef,
  Wheat,
  Apple,
  Salad,
  Fish,
  Egg,
  Milk,
  Carrot,
  MapPin,
  Users,
  ChefHat,
  Globe,
  Mountain,
  Waves,
  Sun,
  Snowflake,
  Coffee,
  Pizza,
  UtensilsCrossed,
  Soup,
  Sunrise,
  Clock,
  Moon,
  Cookie,
  Sandwich,
  Wine,
  Droplets,
  Timer,
  Zap,
  Hourglass,
  Star,
  Award,
  Crown,
  Heart,
  Home,
  Calendar,
  Microwave,
  Flame,
  Wind,
  Dumbbell,
  Activity,
  Thermometer,
  Bird,
  Shell,
  Cherry,
  Leaf,
} from "lucide-react";

interface PreferenceSidebarProps {
  preferences: {
    nutrition: string[];
    cuisine: string[];
    mealType: string[];
    cookingTime: string[];
    skillLevel: string[];
    mealOccasion: string[];
    cookingEquipment: string[];
    spiceLevel: string[];
    meat: string[];
    vegetables: string[];
    servings: number | null;
    cooks: number | null;
  };
  onPreferenceChange: (
    category: string,
    value: string | number,
    action: "add" | "remove" | "set",
  ) => void;
  clearAllPreferences: () => void;
}

export default function PreferenceSidebar({
  preferences,
  onPreferenceChange,
  clearAllPreferences,
}: PreferenceSidebarProps) {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("c");

  // Define limits for each section
  const sectionLimits = {
    mealType: 1,
    mealOccasion: 1,
    cookingEquipment: Infinity, // no limit
    cookingTime: 1,
    skillLevel: 1,
    spiceLevel: 1,
    meat: 3,
    vegetables: Infinity, // no limit
    nutrition: 3,
    cuisine: 1,
    servings: 1,
    cooks: 1,
  };

  // Check if a section is at its limit
  const isSectionAtLimit = (category: string) => {
    const limit = sectionLimits[category as keyof typeof sectionLimits];
    if (limit === Infinity) return false;

    if (category === "servings" || category === "cooks") {
      return preferences[category as keyof typeof preferences] !== null;
    }

    const currentArray = preferences[
      category as keyof typeof preferences
    ] as string[];
    return currentArray.length >= limit;
  };

  // Check if adding a tag to a section would exceed the limit
  const wouldExceedLimit = (category: string, value: string | number) => {
    if (category === "servings" || category === "cooks") {
      return false; // These are single values, handled by isSectionAtLimit
    }

    const currentArray = preferences[
      category as keyof typeof preferences
    ] as string[];
    const isSelected = currentArray.includes(value as string);

    if (isSelected) return false; // Can always remove

    return isSectionAtLimit(category);
  };

  const nutritionOptions = [
    {
      id: "high-protein",
      label: "High Protein",
      icon: Beef,
      color: "text-red-500",
    },
    {
      id: "high-fiber",
      label: "High Fiber",
      icon: Apple,
      color: "text-green-500",
    },
    {
      id: "low-carb",
      label: "Low Carb",
      icon: Salad,
      color: "text-emerald-500",
    },
    {
      id: "balanced",
      label: "Balanced",
      icon: UtensilsCrossed,
      color: "text-blue-500",
    },
    {
      id: "high-carb",
      label: "High Carb",
      icon: Wheat,
      color: "text-amber-500",
    },
    { id: "low-fat", label: "Low Fat", icon: Fish, color: "text-cyan-500" },
    {
      id: "vegetarian",
      label: "Vegetarian",
      icon: Carrot,
      color: "text-orange-500",
    },
    { id: "vegan", label: "Vegan", icon: Salad, color: "text-lime-500" },
  ];

  const cuisineOptions = [
    { id: "italian", label: "Italian", flag: "🇮🇹" },
    { id: "mexican", label: "Mexican", flag: "🇲🇽" },
    { id: "mediterranean", label: "Mediterranean", flag: "🇬🇷" },
    { id: "american", label: "American", flag: "🇺🇸" },
    { id: "french", label: "French", flag: "🇫🇷" },
    { id: "indian", label: "Indian", flag: "🇮🇳" },
    { id: "thai", label: "Thai", flag: "🇹🇭" },
    { id: "chinese", label: "Chinese", flag: "🇨🇳" },
    { id: "japanese", label: "Japanese", flag: "🇯🇵" },
    { id: "middle-eastern", label: "Middle Eastern", flag: "🇱🇧" },
    { id: "korean", label: "Korean", flag: "🇰🇷" },
    { id: "african", label: "African", flag: "🌍" },
  ];

  const mealTypeOptions = [
    {
      id: "breakfast",
      label: "Breakfast",
      icon: Sunrise,
      color: "text-yellow-500",
    },
    { id: "lunch", label: "Lunch", icon: Clock, color: "text-orange-500" },
    { id: "dinner", label: "Dinner", icon: Moon, color: "text-purple-500" },
    { id: "appetizer", label: "Appetizer", icon: Wine, color: "text-pink-500" },
    { id: "dessert", label: "Dessert", icon: Cookie, color: "text-rose-500" },
    { id: "snack", label: "Snack", icon: Sandwich, color: "text-amber-500" },
    {
      id: "smoothie-drink",
      label: "Smoothie/Drink",
      icon: Droplets,
      color: "text-blue-500",
    },
  ];

  const cookingTimeOptions = [
    {
      id: "under-15",
      label: "Under 15 min",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      id: "under-30",
      label: "Under 30 min",
      icon: Timer,
      color: "text-orange-500",
    },
    {
      id: "1-hour-max",
      label: "1 hour max",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      id: "slow-cook",
      label: "Slow cook (over 1h)",
      icon: Hourglass,
      color: "text-purple-500",
    },
  ];

  const skillLevelOptions = [
    { id: "beginner", label: "Beginner", icon: Star, color: "text-green-500" },
    {
      id: "intermediate",
      label: "Intermediate",
      icon: Award,
      color: "text-yellow-500",
    },
    {
      id: "advanced",
      label: "Advanced",
      icon: Crown,
      color: "text-purple-500",
    },
    {
      id: "kid-friendly",
      label: "Kid-friendly",
      icon: Heart,
      color: "text-pink-500",
    },
  ];

  const mealOccasionOptions = [
    {
      id: "family-meal",
      label: "Family meal",
      icon: Home,
      color: "text-blue-500",
    },
    {
      id: "romantic-dinner",
      label: "Romantic dinner",
      icon: Heart,
      color: "text-red-500",
    },
    {
      id: "kids-lunchbox",
      label: "Kids' lunchbox",
      icon: Sandwich,
      color: "text-yellow-500",
    },
    {
      id: "solo-meal",
      label: "Solo meal",
      icon: Users,
      color: "text-gray-500",
    },
    {
      id: "meal-prep",
      label: "Meal prep (for several days)",
      icon: Calendar,
      color: "text-green-500",
    },
    {
      id: "pre-workout",
      label: "Pre-workout",
      icon: Dumbbell,
      color: "text-red-500",
    },
    {
      id: "post-workout",
      label: "Post-workout",
      icon: Activity,
      color: "text-green-500",
    },
  ];

  const cookingEquipmentOptions = [
    {
      id: "oven",
      label: "Oven",
      icon: UtensilsCrossed,
      color: "text-orange-500",
    },
    {
      id: "stove-only",
      label: "Stove only",
      icon: Flame,
      color: "text-red-500",
    },
    {
      id: "microwave",
      label: "Microwave",
      icon: Microwave,
      color: "text-blue-500",
    },
    { id: "blender", label: "Blender", icon: Droplets, color: "text-cyan-500" },
    { id: "air-fryer", label: "Air fryer", icon: Wind, color: "text-gray-500" },
  ];

  const spiceLevelOptions = [
    {
      id: "no-spice",
      label: "No spice",
      icon: Snowflake,
      color: "text-blue-500",
    },
    { id: "light", label: "Light", icon: Sun, color: "text-yellow-500" },
    {
      id: "medium",
      label: "Medium",
      icon: Thermometer,
      color: "text-orange-500",
    },
    { id: "strong", label: "Strong", icon: Flame, color: "text-red-500" },
    { id: "very-hot", label: "Very hot", icon: Flame, color: "text-red-600" },
  ];

  const meatOptions = [
    { id: "chicken", label: "Chicken", icon: Bird, color: "text-yellow-600" },
    { id: "beef", label: "Beef", icon: Beef, color: "text-red-600" },
    { id: "pork", label: "Pork", icon: Beef, color: "text-pink-600" },
    { id: "fish", label: "Fish", icon: Fish, color: "text-blue-500" },
    { id: "seafood", label: "Seafood", icon: Shell, color: "text-cyan-500" },
    { id: "lamb", label: "Lamb", icon: Beef, color: "text-purple-600" },
    { id: "turkey", label: "Turkey", icon: Bird, color: "text-orange-600" },
    { id: "duck", label: "Duck", icon: Bird, color: "text-amber-600" },
  ];

  const vegetableOptions = [
    { id: "tomatoes", label: "Tomatoes", icon: Cherry, color: "text-red-500" },
    { id: "onions", label: "Onions", icon: Apple, color: "text-purple-500" },
    { id: "carrots", label: "Carrots", icon: Carrot, color: "text-orange-500" },
    {
      id: "bell-peppers",
      label: "Bell Peppers",
      icon: Cherry,
      color: "text-green-500",
    },
    { id: "broccoli", label: "Broccoli", icon: Leaf, color: "text-green-600" },
    { id: "spinach", label: "Spinach", icon: Leaf, color: "text-emerald-500" },
    {
      id: "mushrooms",
      label: "Mushrooms",
      icon: Apple,
      color: "text-amber-600",
    },
    {
      id: "zucchini",
      label: "Zucchini",
      icon: Carrot,
      color: "text-green-400",
    },
    {
      id: "potatoes",
      label: "Potatoes",
      icon: Apple,
      color: "text-yellow-600",
    },
    { id: "garlic", label: "Garlic", icon: Apple, color: "text-gray-500" },
    { id: "lettuce", label: "Lettuce", icon: Leaf, color: "text-green-300" },
    {
      id: "cucumber",
      label: "Cucumber",
      icon: Carrot,
      color: "text-green-400",
    },
  ];

  useEffect(() => {
    if (!chatId) return;

    const raw = localStorage.getItem(`chat-${chatId}`);
    if (!raw) return;

    try {
      const chat = JSON.parse(raw);
      if (!chat.preferences) return;

      const prefs = chat.preferences;

      Object.entries(prefs).forEach(([category, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            onPreferenceChange(category, v, "add");
          });
        } else if (value !== null) {
          // for servings/cooks (numbers)
          onPreferenceChange(category, value as string | number, "set");
        }
      });
    } catch (err) {
      console.error("Failed to load preferences from localStorage", err);
    }
  }, [chatId]);

  const servingOptions = [2, 3, 4, 5, 6, 8, 10, 12];
  const cookOptions = [2, 3, 4, 5];

  const handleChipClick = (category: string, value: string | number) => {
    if (category === "servings" || category === "cooks") {
      const currentValue = preferences[category as keyof typeof preferences];
      onPreferenceChange(
        category,
        value,
        currentValue === value ? "remove" : "set",
      );
    } else {
      const currentArray = preferences[
        category as keyof typeof preferences
      ] as string[];
      const isSelected = currentArray.includes(value as string);

      // Allow removal or adding if not at section limit
      if (isSelected || !wouldExceedLimit(category, value)) {
        onPreferenceChange(category, value, isSelected ? "remove" : "add");
      }
    }
  };

  const isSelected = (category: string, value: string | number) => {
    if (category === "servings" || category === "cooks") {
      return preferences[category as keyof typeof preferences] === value;
    }
    return (
      preferences[category as keyof typeof preferences] as string[]
    ).includes(value as string);
  };

  const isTagDisabled = (category: string, value: string | number) => {
    if (category === "servings" || category === "cooks") {
      return false;
    }
    const selected = isSelected(category, value);
    return !selected && wouldExceedLimit(category, value);
  };

  return (
    <div
      className="w-80 bg-gradient-to-b from-orange-50 to-pink-50 border-r border-orange-200 h-full overflow-y-auto p-6"
      style={{ scrollBehavior: "auto" }}
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Cooking Preferences
        </h2>
        <p className="text-sm text-orange-700 mb-2">
          Customize your recipe generation
        </p>
      </div>

      {/* Meal Type */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Meal Type
          </div>
          <span className="text-xs text-gray-500">
            {preferences.mealType.length}/{sectionLimits.mealType} selected
          </span>
        </h3>
        {isSectionAtLimit("mealType") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {mealTypeOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("mealType", option.id);
            const disabled = isTagDisabled("mealType", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("mealType", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Occasion */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Meal Occasion
          </div>
          <span className="text-xs text-gray-500">
            {preferences.mealOccasion.length}/{sectionLimits.mealOccasion}{" "}
            selected
          </span>
        </h3>
        {isSectionAtLimit("mealOccasion") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {mealOccasionOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("mealOccasion", option.id);
            const disabled = isTagDisabled("mealOccasion", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("mealOccasion", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cooking Equipment */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <ChefHat className="w-4 h-4 mr-2" />
            Cooking Equipment
          </div>
          <span className="text-xs text-gray-500">
            {preferences.cookingEquipment.length} selected
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {cookingEquipmentOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("cookingEquipment", option.id);
            const disabled = isTagDisabled("cookingEquipment", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("cookingEquipment", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cooking Time */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Cooking Time
          </div>
          <span className="text-xs text-gray-500">
            {preferences.cookingTime.length}/{sectionLimits.cookingTime}{" "}
            selected
          </span>
        </h3>
        {isSectionAtLimit("cookingTime") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {cookingTimeOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("cookingTime", option.id);
            const disabled = isTagDisabled("cookingTime", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("cookingTime", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Level */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Skill Level
          </div>
          <span className="text-xs text-gray-500">
            {preferences.skillLevel.length}/{sectionLimits.skillLevel} selected
          </span>
        </h3>
        {isSectionAtLimit("skillLevel") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {skillLevelOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("skillLevel", option.id);
            const disabled = isTagDisabled("skillLevel", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("skillLevel", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spice Level */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Flame className="w-4 h-4 mr-2" />
            Spice Level
          </div>
          <span className="text-xs text-gray-500">
            {preferences.spiceLevel.length}/{sectionLimits.spiceLevel} selected
          </span>
        </h3>
        {isSectionAtLimit("spiceLevel") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {spiceLevelOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("spiceLevel", option.id);
            const disabled = isTagDisabled("spiceLevel", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("spiceLevel", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-red-100 text-red-700 border-2 border-red-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meat Preferences */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Beef className="w-4 h-4 mr-2" />
            Meat & Protein
          </div>
          <span className="text-xs text-gray-500">
            {preferences.meat.length}/{sectionLimits.meat} selected
          </span>
        </h3>
        {isSectionAtLimit("meat") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {meatOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("meat", option.id);
            const disabled = isTagDisabled("meat", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("meat", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-red-100 text-red-700 border-2 border-red-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vegetables */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Carrot className="w-4 h-4 mr-2" />
            Vegetables
          </div>
          <span className="text-xs text-gray-500">
            {preferences.vegetables.length} selected
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {vegetableOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("vegetables", option.id);
            const disabled = isTagDisabled("vegetables", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("vegetables", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nutritional Focus */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Apple className="w-4 h-4 mr-2" />
            Nutritional Focus
          </div>
          <span className="text-xs text-gray-500">
            {preferences.nutrition.length}/{sectionLimits.nutrition} selected
          </span>
        </h3>
        {isSectionAtLimit("nutrition") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {nutritionOptions.map((option) => {
            const Icon = option.icon;
            const selected = isSelected("nutrition", option.id);
            const disabled = isTagDisabled("nutrition", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("nutrition", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${option.color}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuisine Preference */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Cuisine Style
          </div>
          <span className="text-xs text-gray-500">
            {preferences.cuisine.length}/{sectionLimits.cuisine} selected
          </span>
        </h3>
        {isSectionAtLimit("cuisine") && (
          <p className="text-xs text-orange-600 mb-2">
            Maximum selections reached. Remove one to add another.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((option) => {
            const selected = isSelected("cuisine", option.id);
            const disabled = isTagDisabled("cuisine", option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChipClick("cuisine", option.id)}
                disabled={disabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                    : disabled
                      ? "bg-gray-50 text-gray-400 border-2 border-transparent cursor-not-allowed opacity-50"
                      : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                <span className="text-lg">{option.flag}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Number of People to Feed */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            People to Feed
          </div>
          <span className="text-xs text-gray-500">
            {preferences.servings !== null ? "1/1" : "0/1"} selected
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {servingOptions.map((number) => {
            const selected = isSelected("servings", number);
            return (
              <button
                key={number}
                onClick={() => handleChipClick("servings", number)}
                className={`flex items-center justify-center w-12 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-green-100 text-green-700 border-2 border-green-300 shadow-sm"
                    : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Number of Cooks */}
      {/*}<div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <ChefHat className="w-4 h-4 mr-2" />
            People Cooking
          </div>
          <span className="text-xs text-gray-500">
            {preferences.cooks !== null ? "1/1" : "0/1"} selected
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {cookOptions.map((number) => {
            const selected = isSelected("cooks", number);
            return (
              <button
                key={number}
                onClick={() => handleChipClick("cooks", number)}
                className={`flex items-center justify-center w-12 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                  selected
                    ? "bg-pink-100 text-pink-700 border-2 border-pink-300 shadow-sm"
                    : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>*/}

      {/* Clear All Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={clearAllPreferences}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Clear All Preferences
        </button>
      </div>
    </div>
  );
}
