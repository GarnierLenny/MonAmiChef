import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Beef,
  Wheat,
  Apple,
  Salad,
  Fish,
  Carrot,
  Users,
  ChefHat,
  Globe,
  UtensilsCrossed,
  Snowflake,
  Sun,
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
  PanelLeft,
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
  onClose?: () => void;
}

export default function PreferenceSidebar({
  preferences,
  onPreferenceChange,
  clearAllPreferences,
  onClose,
}: PreferenceSidebarProps) {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("c");
  const { t } = useTranslation();

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
      label: t('preferences.nutrition.highProtein'),
      icon: Beef,
      color: "text-red-500",
    },
    {
      id: "high-fiber",
      label: t('preferences.nutrition.highFiber'),
      icon: Apple,
      color: "text-green-500",
    },
    {
      id: "low-carb",
      label: t('preferences.nutrition.lowCarb'),
      icon: Salad,
      color: "text-emerald-500",
    },
    {
      id: "balanced",
      label: t('preferences.nutrition.balanced'),
      icon: UtensilsCrossed,
      color: "text-blue-500",
    },
    {
      id: "high-carb",
      label: t('preferences.nutrition.highCarb'),
      icon: Wheat,
      color: "text-amber-500",
    },
    { id: "low-fat", label: t('preferences.nutrition.lowFat'), icon: Fish, color: "text-cyan-500" },
    {
      id: "vegetarian",
      label: t('preferences.nutrition.vegetarian'),
      icon: Carrot,
      color: "text-orange-500",
    },
    { id: "vegan", label: t('preferences.nutrition.vegan'), icon: Salad, color: "text-lime-500" },
  ];

  const cuisineOptions = [
    { id: "italian", label: t('preferences.cuisine.italian'), flag: "🇮🇹" },
    { id: "mexican", label: t('preferences.cuisine.mexican'), flag: "🇲🇽" },
    { id: "mediterranean", label: t('preferences.cuisine.mediterranean'), flag: "🇬🇷" },
    { id: "american", label: t('preferences.cuisine.american'), flag: "🇺🇸" },
    { id: "french", label: t('preferences.cuisine.french'), flag: "🇫🇷" },
    { id: "indian", label: t('preferences.cuisine.indian'), flag: "🇮🇳" },
    { id: "thai", label: t('preferences.cuisine.thai'), flag: "🇹🇭" },
    { id: "chinese", label: t('preferences.cuisine.chinese'), flag: "🇨🇳" },
    { id: "japanese", label: t('preferences.cuisine.japanese'), flag: "🇯🇵" },
    { id: "middle-eastern", label: t('preferences.cuisine.middleEastern'), flag: "🇱🇧" },
    { id: "korean", label: t('preferences.cuisine.korean'), flag: "🇰🇷" },
    { id: "african", label: t('preferences.cuisine.african'), flag: "🌍" },
  ];

  const mealTypeOptions = [
    {
      id: "breakfast",
      label: t('preferences.mealType.breakfast'),
      icon: Sunrise,
      color: "text-yellow-500",
    },
    { id: "lunch", label: t('preferences.mealType.lunch'), icon: Clock, color: "text-orange-500" },
    { id: "dinner", label: t('preferences.mealType.dinner'), icon: Moon, color: "text-purple-500" },
    { id: "appetizer", label: t('preferences.mealType.appetizer'), icon: Wine, color: "text-pink-500" },
    { id: "dessert", label: t('preferences.mealType.dessert'), icon: Cookie, color: "text-rose-500" },
    { id: "snack", label: t('preferences.mealType.snack'), icon: Sandwich, color: "text-amber-500" },
    {
      id: "smoothie-drink",
      label: t('preferences.mealType.smoothieDrink'),
      icon: Droplets,
      color: "text-blue-500",
    },
  ];

  const cookingTimeOptions = [
    {
      id: "under-15",
      label: t('preferences.cookingTime.under15'),
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      id: "under-30",
      label: t('preferences.cookingTime.under30'),
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
      label: t('preferences.cookingTime.slowCook'),
      icon: Hourglass,
      color: "text-purple-500",
    },
  ];

  const skillLevelOptions = [
    { id: "beginner", label: t('preferences.skillLevel.beginner'), icon: Star, color: "text-green-500" },
    {
      id: "intermediate",
      label: t('preferences.skillLevel.intermediate'),
      icon: Award,
      color: "text-yellow-500",
    },
    {
      id: "advanced",
      label: t('preferences.skillLevel.advanced'),
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
      label: t('preferences.equipment.oven'),
      icon: UtensilsCrossed,
      color: "text-orange-500",
    },
    {
      id: "stove-only",
      label: t('preferences.equipment.stove'),
      icon: Flame,
      color: "text-red-500",
    },
    {
      id: "microwave",
      label: t('preferences.equipment.microwave'),
      icon: Microwave,
      color: "text-blue-500",
    },
    { id: "blender", label: "Blender", icon: Droplets, color: "text-cyan-500" },
    { id: "air-fryer", label: t('preferences.equipment.airFryer'), icon: Wind, color: "text-gray-500" },
  ];

  const spiceLevelOptions = [
    {
      id: "no-spice",
      label: "No spice",
      icon: Snowflake,
      color: "text-blue-500",
    },
    { id: "light", label: t('preferences.spiceLevel.mild'), icon: Sun, color: "text-yellow-500" },
    {
      id: "medium",
      label: t('preferences.spiceLevel.medium'),
      icon: Thermometer,
      color: "text-orange-500",
    },
    { id: "strong", label: t('preferences.spiceLevel.spicy'), icon: Flame, color: "text-red-500" },
    { id: "very-hot", label: t('preferences.spiceLevel.extraSpicy'), icon: Flame, color: "text-red-600" },
  ];

  const meatOptions = [
    { id: "chicken", label: t('preferences.meats.chicken'), icon: Bird, color: "text-yellow-600" },
    { id: "beef", label: t('preferences.meats.beef'), icon: Beef, color: "text-red-600" },
    { id: "pork", label: t('preferences.meats.pork'), icon: Beef, color: "text-pink-600" },
    { id: "fish", label: t('preferences.meats.fish'), icon: Fish, color: "text-blue-500" },
    { id: "seafood", label: t('preferences.meats.seafood'), icon: Shell, color: "text-cyan-500" },
    { id: "lamb", label: t('preferences.meats.lamb'), icon: Beef, color: "text-purple-600" },
    { id: "turkey", label: t('preferences.meats.turkey'), icon: Bird, color: "text-orange-600" },
    { id: "duck", label: "Duck", icon: Bird, color: "text-amber-600" },
  ];

  const vegetableOptions = [
    { id: "tomatoes", label: t('preferences.vegetables.tomatoes'), icon: Cherry, color: "text-red-500" },
    { id: "onions", label: t('preferences.vegetables.onions'), icon: Apple, color: "text-purple-500" },
    { id: "carrots", label: t('preferences.vegetables.carrots'), icon: Carrot, color: "text-orange-500" },
    {
      id: "bell-peppers",
      label: t('preferences.vegetables.peppers'),
      icon: Cherry,
      color: "text-green-500",
    },
    { id: "broccoli", label: t('preferences.vegetables.broccoli'), icon: Leaf, color: "text-green-600" },
    { id: "spinach", label: t('preferences.vegetables.spinach'), icon: Leaf, color: "text-emerald-500" },
    {
      id: "mushrooms",
      label: t('preferences.vegetables.mushrooms'),
      icon: Apple,
      color: "text-amber-600",
    },
    {
      id: "zucchini",
      label: t('preferences.vegetables.zucchini'),
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

  // Helper to render a preference section with card wrapper
  const renderSection = (
    title: string,
    icon: React.ElementType,
    category: string,
    options: Array<
      | { id: string; label: string; icon?: React.ElementType; color?: string; flag?: string }
      | number
    >,
    hasLimit: boolean = true,
  ) => {
    const Icon = icon;
    const currentCount =
      category === "servings" || category === "cooks"
        ? preferences[category as keyof typeof preferences] !== null
          ? 1
          : 0
        : (preferences[category as keyof typeof preferences] as string[]).length;
    const limit =
      sectionLimits[category as keyof typeof sectionLimits] === Infinity
        ? null
        : sectionLimits[category as keyof typeof sectionLimits];
    const isAtLimit = isSectionAtLimit(category);
    const hasSelections = currentCount > 0;

    return (
      <div className="mb-4 group animate-in fade-in-50 duration-500">
        <div
          className={`relative rounded-2xl p-4 transition-all duration-300 ${
            hasSelections
              ? "bg-gradient-to-br from-white to-orange-50/50 shadow-lg shadow-orange-100/50 border-2 border-orange-200/50"
              : "bg-white/60 backdrop-blur-sm shadow-md hover:shadow-lg border-2 border-white/80"
          }`}
        >
          {/* Decorative gradient overlay for selected sections */}
          {hasSelections && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
          )}

          {/* Section Header */}
          <div className="relative mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${
                  hasSelections
                    ? "bg-orange-500/10 ring-2 ring-orange-500/20"
                    : "bg-gray-100/80"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors duration-300 ${
                    hasSelections ? "text-orange-600" : "text-gray-600"
                  }`}
                />
              </div>
              <h3 className="text-sm font-bold text-gray-800 tracking-wide">
                {title}
              </h3>
            </div>

            {/* Limit Counter */}
            {hasLimit && limit !== null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isAtLimit
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : hasSelections
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className="tabular-nums">{currentCount}</span>
                <span className="opacity-60">/</span>
                <span className="tabular-nums">{limit}</span>
                {isAtLimit && (
                  <span className="ml-0.5 animate-pulse">✓</span>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="relative flex flex-wrap gap-2">
            {options.map((option, index) => {
              const isNumberOption = typeof option === "number";
              const optionId = isNumberOption ? option : option.id;
              const optionLabel = isNumberOption ? option : option.label;
              const OptionIcon = isNumberOption ? null : option.icon;
              const optionColor = isNumberOption ? null : option.color;
              const optionFlag = isNumberOption ? null : option.flag;

              const selected = isSelected(category, optionId);
              const disabled = isTagDisabled(category, optionId);

              return (
                <button
                  key={optionId}
                  onClick={() => handleChipClick(category, optionId)}
                  disabled={disabled}
                  style={{
                    animationDelay: `${index * 30}ms`,
                  }}
                  className={`group/chip relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2 ${
                    selected
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-105 hover:scale-110 ring-2 ring-orange-400/50"
                      : disabled
                        ? "bg-gray-100/50 text-gray-400 cursor-not-allowed opacity-40"
                        : "bg-white text-gray-700 hover:bg-orange-50 hover:scale-105 hover:shadow-md shadow-sm border border-gray-200/50 hover:border-orange-300/50"
                  }`}
                >
                  {/* Icon or Flag */}
                  {OptionIcon ? (
                    <OptionIcon
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        selected
                          ? "text-white scale-110"
                          : `${optionColor || "text-gray-500"} group-hover/chip:scale-110`
                      }`}
                    />
                  ) : optionFlag ? (
                    <span className="text-base leading-none">{optionFlag}</span>
                  ) : null}

                  {/* Label */}
                  <span className="whitespace-nowrap">{optionLabel}</span>

                  {/* Hover glow effect */}
                  {!disabled && !selected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/0 to-orange-600/0 group-hover/chip:from-orange-400/10 group-hover/chip:to-orange-600/10 transition-all duration-300 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Empty state hint */}
          {!hasSelections && (
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-[10px] text-gray-400 font-medium px-2 py-1 rounded-full bg-gray-100/80">
                No selections
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="bg-gradient-to-br from-orange-50 via-orange-50/80 to-amber-50/50 h-full overflow-y-auto overflow-x-hidden p-6 w-full flex-shrink-0"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Decorative background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          color: '#f97316'
        }} />
      </div>

      <div className="relative">
        {/* Header matching NavigationSidebar */}
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 shadow-md relative overflow-hidden -mx-6 -mt-6 mb-6">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <UtensilsCrossed className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <span className="font-bold text-white text-lg drop-shadow-md">Preferences</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 relative z-10"
            >
              <PanelLeft className="h-5 w-5 drop-shadow" />
            </button>
          )}
        </div>
        {/* Meal Type */}
        {renderSection(
          "Meal Type",
          UtensilsCrossed,
          "mealType",
          mealTypeOptions,
        )}

        {/* Meal Occasion */}
        {renderSection(
          "Meal Occasion",
          Calendar,
          "mealOccasion",
          mealOccasionOptions,
        )}

        {/* Cooking Equipment */}
        {renderSection(
          "Cooking Equipment",
          ChefHat,
          "cookingEquipment",
          cookingEquipmentOptions,
          false,
        )}

        {/* Cooking Time */}
        {renderSection(
          "Cooking Time",
          Clock,
          "cookingTime",
          cookingTimeOptions,
        )}

        {/* Skill Level */}
        {renderSection("Skill Level", Star, "skillLevel", skillLevelOptions)}

        {/* Spice Level */}
        {renderSection("Spice Level", Flame, "spiceLevel", spiceLevelOptions)}

        {/* Meat Preferences */}
        {renderSection("Meat & Protein", Beef, "meat", meatOptions)}

        {/* Vegetables */}
        {renderSection(
          "Vegetables",
          Carrot,
          "vegetables",
          vegetableOptions,
          false,
        )}

        {/* Nutritional Focus */}
        {renderSection(
          "Nutritional Focus",
          Apple,
          "nutrition",
          nutritionOptions,
        )}

        {/* Cuisine Preference */}
        {renderSection("Cuisine Style", Globe, "cuisine", cuisineOptions)}

        {/* Number of People to Feed */}
        {renderSection(
          "People to Feed",
          Users,
          "servings",
          servingOptions,
        )}

        {/* Number of Cooks */}
        {/*}{renderSection(
          "People Cooking",
          ChefHat,
          "cooks",
          cookOptions,
        )}*/}

        {/* Clear All Button */}
        <div className="mt-6 mb-24">
          <div className="relative rounded-2xl p-1 bg-gradient-to-br from-gray-200/50 to-gray-100/50 shadow-md">
            <button
              onClick={clearAllPreferences}
              className="group relative w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md overflow-hidden"
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-orange-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:via-orange-500/10 group-hover:to-red-500/5 transition-all duration-500" />

              {/* Icon and text */}
              <div className="relative flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-500 group-hover:text-orange-600 transition-colors duration-300 group-hover:rotate-180 group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="group-hover:text-orange-700 transition-colors duration-300">
                  Clear All Preferences
                </span>
              </div>

              {/* Hover shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
