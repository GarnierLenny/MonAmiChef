import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Session } from "@supabase/supabase-js";
import {
  ShoppingCart,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Plus,
  Package,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { groceryListApi, type GroceryList } from "@/lib/api/groceryListApi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GuestGroceryListCTA } from "@/components/grocery-list/GuestGroceryListCTA";

interface GroceryListPageProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
  session?: Session | null;
}

export default function GroceryListPage({
  onSignUp,
  onSignIn,
  session,
}: GroceryListPageProps = {}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);

  // Checked ingredients (persisted to localStorage)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem("groceryList-checkedIngredients");
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    },
  );

  // Expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Delete confirmation dialog
  const [mealToDelete, setMealToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Show all categories toggle
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Meals section expanded state (collapsed by default)
  const [mealsExpanded, setMealsExpanded] = useState(false);

  // Category-specific add item inputs
  const [categoryItemInputs, setCategoryItemInputs] = useState<
    Record<string, { name: string; quantity: string }>
  >({});

  // Loading state for each category
  const [categoryLoading, setCategoryLoading] = useState<
    Record<string, boolean>
  >({});

  // Active input category (to show expanded input form)
  const [activeInputCategory, setActiveInputCategory] = useState<string | null>(
    null,
  );

  // Save checked ingredients to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "groceryList-checkedIngredients",
        JSON.stringify(Array.from(checkedIngredients)),
      );
    } catch (error) {
      console.error("Failed to save checked ingredients:", error);
    }
  }, [checkedIngredients]);

  // Load grocery list on mount and set initial expanded categories
  useEffect(() => {
    // Check if user is authenticated before loading data
    if (!session) {
      setIsUnauthenticated(true);
      setIsLoading(false);
      return;
    }

    loadGroceryList();
  }, [session]);

  // Set initial expanded categories only on first load
  useEffect(() => {
    if (!groceryList || expandedCategories.size > 0) return;

    const categories = new Set(
      groceryList.aggregatedIngredients.map((cat) => cat.category),
    );
    categories.add("other");
    setExpandedCategories(categories);
  }, [groceryList]);

  // Update expanded categories only when showAllCategories toggle changes
  useEffect(() => {
    if (!groceryList) return;

    if (showAllCategories) {
      // Expand all 6 categories
      const allCategoryNames = [
        "produce",
        "protein",
        "dairy",
        "grains",
        "spices",
        "other",
      ];
      setExpandedCategories(new Set(allCategoryNames));
    } else {
      // Expand only categories with items (plus "other")
      const categories = new Set(
        groceryList.aggregatedIngredients.map((cat) => cat.category),
      );
      categories.add("other");
      setExpandedCategories(categories);
    }
  }, [showAllCategories]);

  const loadGroceryList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsUnauthenticated(false);
      const list = await groceryListApi.getGroceryList();
      setGroceryList(list);
    } catch (err: any) {
      console.error("Failed to load grocery list:", err);

      // Check if this is an authentication error
      if (
        err.status === 401 ||
        err.message?.includes("authentication") ||
        err.message?.includes("Unauthorized")
      ) {
        setIsUnauthenticated(true);
        setError(null); // Clear error since we're showing auth gate instead
      } else {
        setError(err.message || "Failed to load grocery list");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRemoveMeal = async () => {
    if (!mealToDelete) return;

    try {
      await groceryListApi.removeMeal(mealToDelete.id);
      await loadGroceryList();
      setMealToDelete(null);
      toast({
        title: t("groceryList.mealRemoved"),
        description: t("groceryList.mealRemovedDescription", {
          mealName: mealToDelete.title,
        }),
      });
    } catch (err: any) {
      console.error("Failed to remove meal:", err);
      setError(err.message || "Failed to remove meal");
    }
  };

  const handleAddCategoryItem = async (category: string) => {
    const input = categoryItemInputs[category];
    if (!input?.name.trim()) return;

    try {
      // Set loading state for this category
      setCategoryLoading((prev) => ({ ...prev, [category]: true }));

      // Clear the input immediately for better UX
      setCategoryItemInputs((prev) => ({
        ...prev,
        [category]: { name: "", quantity: "" },
      }));

      // Add item to backend
      const newItem = await groceryListApi.addCustomItem(
        input.name,
        input.quantity || undefined,
        category,
      );

      // Optimistically update UI
      setGroceryList((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          customItems: [...prev.customItems, newItem],
        };
      });

      // Show success toast
      toast({
        title: t("groceryList.ingredientAdded"),
        description: `${input.name} has been added to your grocery list.`,
      });

      // Close the input form after successful add
      setActiveInputCategory(null);
    } catch (err: any) {
      console.error("Failed to add category item:", err);
      setError(err.message || "Failed to add item");
      // Reload on error to restore correct state
      await loadGroceryList();
    } finally {
      // Clear loading state
      setCategoryLoading((prev) => ({ ...prev, [category]: false }));
    }
  };

  const updateCategoryItemInput = (
    category: string,
    field: "name" | "quantity",
    value: string,
  ) => {
    setCategoryItemInputs((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || { name: "", quantity: "" }),
        [field]: value,
      },
    }));
  };

  const handleToggleCustomItem = async (itemId: string, checked: boolean) => {
    try {
      // Optimistically update UI
      setGroceryList((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          customItems: prev.customItems.map((item) =>
            item.id === itemId ? { ...item, checked } : item,
          ),
        };
      });

      // Update backend
      await groceryListApi.updateCustomItem(itemId, { checked });
    } catch (err: any) {
      console.error("Failed to update custom item:", err);
      // Reload on error to restore correct state
      await loadGroceryList();
    }
  };

  const handleDeleteCustomItem = async (itemId: string) => {
    try {
      // Optimistically update UI
      setGroceryList((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          customItems: prev.customItems.filter((item) => item.id !== itemId),
        };
      });

      // Delete from backend
      await groceryListApi.deleteCustomItem(itemId);

      toast({
        title: t("groceryList.itemDeleted"),
        description: t("groceryList.itemDeletedDescription"),
      });
    } catch (err: any) {
      console.error("Failed to delete custom item:", err);
      setError(err.message || "Failed to delete custom item");
      // Reload on error to restore correct state
      await loadGroceryList();
    }
  };

  const handleClearAll = async () => {
    if (!confirm(t("groceryList.confirmClearAll"))) return;

    try {
      await groceryListApi.clearGroceryList();
      await loadGroceryList();
      setCheckedIngredients(new Set());
      // Also clear from localStorage
      localStorage.removeItem("groceryList-checkedIngredients");
      toast({
        title: t("groceryList.listCleared"),
        description: t("groceryList.listClearedDescription"),
      });
    } catch (err: any) {
      console.error("Failed to clear grocery list:", err);
      setError(err.message || "Failed to clear grocery list");
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const toggleIngredientCheck = (ingredientKey: string) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientKey)) {
        newSet.delete(ingredientKey);
      } else {
        newSet.add(ingredientKey);
      }
      return newSet;
    });
  };

  // Get all categories (including empty ones if showAllCategories is true, always include "other")
  const getAllCategories = () => {
    const allCategoryNames = [
      "produce",
      "protein",
      "dairy",
      "grains",
      "spices",
      "other",
    ];

    const categoryEmojis: Record<string, string> = {
      produce: "🥬",
      protein: "🥩",
      dairy: "🥛",
      grains: "🌾",
      spices: "🧂",
      other: "📦",
    };

    const categoryColors: Record<string, string> = {
      produce: "from-green-500 to-emerald-600",
      protein: "from-red-500 to-rose-600",
      dairy: "from-blue-400 to-blue-600",
      grains: "from-amber-500 to-orange-600",
      spices: "from-purple-500 to-purple-600",
      other: "from-gray-500 to-gray-600",
    };

    const categoryBgColors: Record<string, string> = {
      produce: "bg-green-50",
      protein: "bg-red-50",
      dairy: "bg-blue-50",
      grains: "bg-amber-50",
      spices: "bg-purple-50",
      other: "bg-gray-50",
    };

    // Create a map of existing categories
    const existingCategories = new Map(
      (groceryList?.aggregatedIngredients || []).map((cat) => [
        cat.category,
        cat,
      ]),
    );

    if (!showAllCategories) {
      // Return only categories with items, but always include "other"
      const categoriesWithItems = groceryList?.aggregatedIngredients || [];
      const hasOther = categoriesWithItems.some(
        (cat) => cat.category === "other",
      );

      const result = categoriesWithItems.map((cat) => ({
        ...cat,
        gradientColor: categoryColors[cat.category] || categoryColors.other,
        bgColor: categoryBgColors[cat.category] || categoryBgColors.other,
      }));

      if (!hasOther) {
        // Add empty "other" category if it doesn't exist
        result.push({
          category: "other",
          emoji: "📦",
          items: [],
          gradientColor: categoryColors.other,
          bgColor: categoryBgColors.other,
        });
      }

      return result;
    }

    // Return all categories, with empty ones if they don't exist
    return allCategoryNames.map((categoryName) => {
      const existing = existingCategories.get(categoryName);
      return {
        category: categoryName,
        emoji: categoryEmojis[categoryName] || "📦",
        items: existing?.items || [],
        gradientColor: categoryColors[categoryName] || categoryColors.other,
        bgColor: categoryBgColors[categoryName] || categoryBgColors.other,
      };
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-orange-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-neutral-600">{t("groceryList.loading")}</p>
        </div>
      </div>
    );
  }

  // Guest auth gate - show before error state
  if (isUnauthenticated) {
    return <GuestGroceryListCTA onSignUp={onSignUp} onSignIn={onSignIn} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-orange-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-danger-600 mb-4 font-medium">{error}</p>
          <Button
            onClick={loadGroceryList}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const isEmpty =
    !groceryList ||
    (groceryList.meals.length === 0 && groceryList.customItems.length === 0);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 flex-1 to-amber-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-7xl mx-auto px-3 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12">
          {isEmpty ? (
            // Empty state - Enhanced with better visuals
            <div className="flex flex-col h-screen items-center justify-center pb-26 text-center px-4">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-10 h-10 text-amber-400 fill-current" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-3">
                {t("groceryList.emptyState")}
              </h2>
              <p className="text-neutral-600 mb-8 max-w-md text-sm sm:text-base leading-relaxed">
                {t("groceryList.emptyStateCta")}
              </p>
              <Button
                onClick={() => navigate("/meal-plan")}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {t("groceryList.goToMealPlan")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-8 lg:space-y-10">
              {/* Meals Section */}
              {groceryList && groceryList.meals.length > 0 && (
                <section>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-orange-100">
                    <button
                      onClick={() => setMealsExpanded(!mealsExpanded)}
                      className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between hover:bg-orange-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                          {mealsExpanded ? (
                            <ChevronDown className="w-5 h-5 text-orange-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">
                            {t("groceryList.mealsSection")}
                          </h2>
                          <p className="text-sm sm:text-base text-neutral-500">
                            {groceryList.meals.length} meal
                            {groceryList.meals.length !== 1 ? "s" : ""} added
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                        {groceryList.meals.length}
                      </div>
                    </button>

                    {mealsExpanded && (
                      <div className="p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-orange-50/30 to-amber-50/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                          {groceryList.meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-200 group"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-base sm:text-lg text-neutral-900 mb-3 group-hover:text-orange-600 transition-colors">
                                    {meal.recipe.title}
                                  </h3>
                                  <div className="flex items-center gap-2.5 text-sm text-neutral-500">
                                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                      {
                                        [
                                          "Sunday",
                                          "Monday",
                                          "Tuesday",
                                          "Wednesday",
                                          "Thursday",
                                          "Friday",
                                          "Saturday",
                                        ][meal.day]
                                      }
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="capitalize">
                                      {meal.mealSlot}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setMealToDelete({
                                      id: meal.mealPlanItemId,
                                      title: meal.recipe.title,
                                    })
                                  }
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Ingredients Section */}
              {groceryList && (
                <section>
                  <div className="flex items-center justify-between mb-6 lg:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-3">
                      <Package className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />
                      {t("groceryList.ingredientsSection")}
                    </h2>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <Checkbox
                        checked={showAllCategories}
                        onCheckedChange={(checked) =>
                          setShowAllCategories(checked === true)
                        }
                      />
                      <span className="text-sm sm:text-base text-neutral-600 group-hover:text-neutral-900 transition-colors">
                        {t("groceryList.showAllCategories")}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
                    {getAllCategories().map((category) => {
                      const isExpanded = expandedCategories.has(
                        category.category,
                      );
                      const itemCount =
                        category.items.length +
                        (groceryList?.customItems.filter((item) =>
                          category.category === "other"
                            ? !item.category ||
                              item.category === "" ||
                              item.category === "other"
                            : item.category === category.category,
                        ).length || 0);

                      return (
                        <div
                          key={category.category}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-200/60 transition-all duration-300"
                        >
                          <button
                            onClick={() => toggleCategory(category.category)}
                            className={`w-full px-6 py-4.5 flex items-center justify-between group transition-all duration-300 ${
                              isExpanded
                                ? "bg-gradient-to-r from-orange-50/40 via-amber-50/30 to-orange-50/40"
                                : "bg-white hover:bg-gradient-to-r hover:from-orange-50/25 hover:via-amber-50/20 hover:to-orange-50/25"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  isExpanded
                                    ? "bg-orange-100/80 shadow-sm"
                                    : "bg-gray-100/50 group-hover:bg-orange-100/60"
                                }`}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-orange-600 transition-transform duration-300" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors duration-300" />
                                )}
                              </div>
                              <span
                                className={`text-2xl sm:text-[26px] transition-all duration-300 ${
                                  isExpanded
                                    ? "scale-110 opacity-95"
                                    : "opacity-75 group-hover:opacity-90 group-hover:scale-105"
                                }`}
                              >
                                {category.emoji}
                              </span>
                              <div className="text-left">
                                <span
                                  className={`font-semibold capitalize text-sm sm:text-base tracking-tight transition-colors duration-300 ${
                                    isExpanded
                                      ? "text-neutral-900"
                                      : "text-gray-700 group-hover:text-neutral-900"
                                  }`}
                                >
                                  {t(
                                    `groceryList.categories.${category.category}`,
                                  )}
                                </span>
                                <div className="text-xs text-gray-500 mt-0.5 font-medium">
                                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`min-w-[2.5rem] h-7 px-3 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                isExpanded
                                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25"
                                  : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-700"
                              }`}
                            >
                              {itemCount}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-5 sm:p-6 space-y-3 bg-white border-t border-gray-100">
                              {/* Recipe ingredients from meals */}
                              {category.items.map((ingredient, idx) => {
                                const ingredientKey = `${category.category}-${idx}`;
                                const isChecked =
                                  checkedIngredients.has(ingredientKey);
                                return (
                                  <label
                                    key={ingredientKey}
                                    className={`flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                      isChecked
                                        ? "bg-green-50 border-2 border-green-200"
                                        : "bg-white border-2 border-gray-200 hover:border-orange-200 hover:bg-orange-50/30"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        toggleIngredientCheck(ingredientKey)
                                      }
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <span
                                        className={`text-sm sm:text-base font-medium transition-all break-words ${
                                          isChecked
                                            ? "text-green-700 line-through"
                                            : "text-neutral-800"
                                        }`}
                                      >
                                        {ingredient.quantity} {ingredient.name}
                                      </span>
                                      {ingredient.recipes.length > 1 && (
                                        <span className="block text-xs sm:text-sm text-neutral-400 mt-1.5">
                                          Used in {ingredient.recipes.length}{" "}
                                          recipes
                                        </span>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}

                              {/* Custom items added to this category */}
                              {groceryList?.customItems
                                .filter((item) =>
                                  category.category === "other"
                                    ? !item.category ||
                                      item.category === "" ||
                                      item.category === "other"
                                    : item.category === category.category,
                                )
                                .map((item) => (
                                  <div
                                    key={item.id}
                                    className={`flex items-start gap-3.5 p-4 rounded-xl transition-all duration-200 ${
                                      item.checked
                                        ? "bg-green-50 border-2 border-green-200"
                                        : "bg-white border-2 border-gray-200 hover:border-orange-200"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={item.checked}
                                      onCheckedChange={(checked) =>
                                        handleToggleCustomItem(
                                          item.id,
                                          checked === true,
                                        )
                                      }
                                      className="mt-0.5"
                                    />
                                    <span
                                      className={`flex-1 text-sm sm:text-base font-medium transition-all ${
                                        item.checked
                                          ? "text-green-700 line-through"
                                          : "text-neutral-800"
                                      }`}
                                    >
                                      {item.quantity && `${item.quantity} `}
                                      {item.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteCustomItem(item.id)
                                      }
                                      className="text-red-500 hover:bg-red-50 hover:text-red-700 h-auto p-2 rounded-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}

                              {/* Add item to category - Collapsed by default */}
                              <div className="pt-5 mt-5 border-t border-gray-200">
                                {activeInputCategory === category.category ? (
                                  <div className="space-y-4 bg-white p-5 rounded-xl border-2 border-orange-200 shadow-sm">
                                    <Input
                                      type="text"
                                      placeholder={t(
                                        "groceryList.addToCategoryPlaceholder",
                                      )}
                                      value={
                                        categoryItemInputs[category.category]
                                          ?.name || ""
                                      }
                                      onChange={(e) =>
                                        updateCategoryItemInput(
                                          category.category,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          handleAddCategoryItem(
                                            category.category,
                                          );
                                        } else if (e.key === "Escape") {
                                          setActiveInputCategory(null);
                                        }
                                      }}
                                      className="w-full h-11 text-sm sm:text-base border-gray-300 focus:border-orange-500"
                                      autoFocus
                                    />
                                    <div className="flex gap-3 items-center">
                                      <Input
                                        type="text"
                                        placeholder={t(
                                          "groceryList.quantityPlaceholder",
                                        )}
                                        value={
                                          categoryItemInputs[category.category]
                                            ?.quantity || ""
                                        }
                                        onChange={(e) =>
                                          updateCategoryItemInput(
                                            category.category,
                                            "quantity",
                                            e.target.value,
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddCategoryItem(
                                              category.category,
                                            );
                                          } else if (e.key === "Escape") {
                                            setActiveInputCategory(null);
                                          }
                                        }}
                                        className="flex-1 h-11 text-sm sm:text-base border-gray-300 focus:border-orange-500"
                                      />
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          handleAddCategoryItem(
                                            category.category,
                                          )
                                        }
                                        disabled={
                                          !categoryItemInputs[
                                            category.category
                                          ]?.name?.trim() ||
                                          categoryLoading[category.category]
                                        }
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 h-11 disabled:opacity-50"
                                      >
                                        {categoryLoading[category.category] ? (
                                          <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                          <Check className="w-5 h-5" />
                                        )}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() =>
                                          setActiveInputCategory(null)
                                        }
                                        className="px-4 h-11"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setActiveInputCategory(category.category)
                                    }
                                    className="w-full h-12 border-dashed border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200"
                                  >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add item to{" "}
                                    {t(
                                      `groceryList.categories.${category.category}`,
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!mealToDelete}
        onOpenChange={(open) => !open && setMealToDelete(null)}
      >
        <AlertDialogContent className="bg-white rounded-2xl p-6 sm:p-8">
          <AlertDialogHeader>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <AlertDialogTitle className="text-left text-lg sm:text-xl">
                {t("groceryList.confirmRemoveMeal")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left text-sm sm:text-base leading-relaxed pl-[4.5rem]">
              {t("groceryList.confirmRemoveMealDescription", {
                mealName: mealToDelete?.title || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="hover:bg-gray-100 h-11">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMeal}
              className="bg-red-600 hover:bg-red-700 text-white h-11"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
