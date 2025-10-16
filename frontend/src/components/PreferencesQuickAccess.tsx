import { ChefHat, Clock, UtensilsCrossed, Flame, Users, SlidersHorizontal, X } from "lucide-react";

interface Tag {
  category: string;
  value: string | number;
  label: string;
  color: string;
}

interface PreferencesQuickAccessProps {
  onPreferenceSelect: (category: string, value: string | number) => void;
  onOpenPreferences?: () => void;
  selectedTags?: Tag[];
  onRemoveTag?: (category: string, value: string | number) => void;
  onClearAllTags?: () => void;
  preferences?: {
    mealType: string[];
    cookingTime: string[];
    skillLevel: string[];
    spiceLevel: string[];
    servings: number | null;
  };
}

export default function PreferencesQuickAccess({
  onPreferenceSelect,
  onOpenPreferences,
  selectedTags = [],
  onRemoveTag,
  onClearAllTags,
  preferences,
}: PreferencesQuickAccessProps) {
  // Define limits for each section (matching PreferenceSidebar)
  const sectionLimits: Record<string, number> = {
    mealType: 1,
    cookingTime: 1,
    skillLevel: 1,
    spiceLevel: 1,
    servings: 1,
  };

  const quickPreferences = [
    { category: "mealType", value: "breakfast", label: "Breakfast", icon: UtensilsCrossed, color: "bg-yellow-50 text-yellow-700 border-yellow-200/50 hover:bg-yellow-100 hover:border-yellow-300" },
    { category: "mealType", value: "lunch", label: "Lunch", icon: UtensilsCrossed, color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-100 hover:border-emerald-300" },
    { category: "mealType", value: "dinner", label: "Dinner", icon: UtensilsCrossed, color: "bg-orange-100 text-orange-700 border-orange-200/50 hover:bg-orange-200 hover:border-orange-300" },
    { category: "cookingTime", value: "under-15", label: "Quick (15min)", icon: Clock, color: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100 hover:border-blue-300" },
    { category: "skillLevel", value: "beginner", label: "Easy", icon: ChefHat, color: "bg-purple-50 text-purple-700 border-purple-200/50 hover:bg-purple-100 hover:border-purple-300" },
    { category: "spiceLevel", value: "no-spice", label: "Mild", icon: Flame, color: "bg-red-50 text-red-700 border-red-200/50 hover:bg-red-100 hover:border-red-300" },
    { category: "servings", value: 2, label: "2 servings", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100 hover:border-blue-300" },
    { category: "servings", value: 4, label: "4 servings", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100 hover:border-blue-300" },
  ];

  // Helper to check if a quick preference is selected
  const isQuickPrefSelected = (category: string, value: string | number) => {
    return selectedTags.some(
      (tag) => tag.category === category && String(tag.value) === String(value)
    );
  };

  // Check if a section is at its limit
  const isSectionAtLimit = (category: string) => {
    const limit = sectionLimits[category];
    if (!limit) return false;

    if (category === "servings") {
      return preferences?.servings !== null;
    }

    const currentArray = preferences?.[category as keyof typeof preferences] as string[] | undefined;
    return currentArray ? currentArray.length >= limit : false;
  };

  // Check if a tag would exceed the limit
  const isTagDisabled = (category: string, value: string | number) => {
    const selected = isQuickPrefSelected(category, value);
    // Can always remove a selected tag
    if (selected) return false;
    // Check if adding would exceed limit
    return isSectionAtLimit(category);
  };

  // Filter selected tags that are not in quick preferences
  const otherSelectedTags = selectedTags.filter(
    (tag) =>
      !quickPreferences.some(
        (pref) => pref.category === tag.category && String(pref.value) === String(tag.value)
      )
  );

  return (
    <div className="border-t border-gray-200/50 bg-orange-50">
      <div className="px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max">
          {/* Quick Preferences */}
          {quickPreferences.map((pref, index) => {
            const Icon = pref.icon;
            const isSelected = isQuickPrefSelected(pref.category, pref.value);
            const isDisabled = isTagDisabled(pref.category, pref.value);
            return (
              <button
                key={`${pref.category}-${pref.value}`}
                onClick={() => {
                  if (isDisabled) return;
                  if (isSelected && onRemoveTag) {
                    onRemoveTag(pref.category, pref.value);
                  } else {
                    onPreferenceSelect(pref.category, pref.value);
                  }
                }}
                disabled={isDisabled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-700 ease-out whitespace-nowrap border ${
                  isSelected
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-[1.02] hover:scale-105 ring-2 ring-orange-400/50 border-transparent"
                    : isDisabled
                    ? "bg-gray-100/50 text-gray-400 cursor-not-allowed opacity-40 border-gray-200/30"
                    : "bg-white text-gray-700 hover:bg-orange-50 hover:scale-[1.02] hover:shadow-md shadow-sm border-gray-200/50 hover:border-orange-300/50"
                }`}
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors duration-700 ease-out ${isSelected ? "text-white" : ""}`} />
                <span className="transition-all duration-700 ease-out">{pref.label}</span>
                <div
                  className={`overflow-hidden transition-all duration-700 ease-out ${
                    isSelected && onRemoveTag ? "w-4 ml-0.5 opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  <X className={`w-3 h-3 transition-all duration-700 ease-out ${
                    isSelected && onRemoveTag ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`} />
                </div>
              </button>
            );
          })}

          {/* Other Selected Tags */}
          {otherSelectedTags.map((tag, index) => (
            <button
              key={`selected-${tag.category}-${tag.value}-${index}`}
              onClick={() => onRemoveTag && onRemoveTag(tag.category, tag.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-700 ease-out whitespace-nowrap bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-[1.02] hover:scale-105 ring-2 ring-orange-400/50 border border-transparent animate-tag-appear"
              style={{
                animationDelay: `${index * 30}ms`,
              }}
            >
              <span className="transition-all duration-700 ease-out">{tag.label}</span>
              <div className="w-4 ml-0.5 opacity-100 overflow-hidden transition-all duration-700 ease-out">
                {onRemoveTag && (
                  <X className="w-3 h-3 scale-100 opacity-100 transition-all duration-700 ease-out hover:scale-125" />
                )}
              </div>
            </button>
          ))}

          {/* Clear All Button - only show if there are selected tags */}
          {selectedTags.length > 0 && onClearAllTags && (
            <button
              onClick={onClearAllTags}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200/50 hover:bg-red-100 hover:border-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}

          {/* See More Button */}
          {onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-300/50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 hover:scale-105 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>See more</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
