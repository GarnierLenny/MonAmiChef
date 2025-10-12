import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
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

export default function GroceryListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    loadGroceryList();
  }, []);

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
      const list = await groceryListApi.getGroceryList();
      setGroceryList(list);
    } catch (err: any) {
      console.error("Failed to load grocery list:", err);
      setError(err.message || "Failed to load grocery list");
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
        title: "Ingredient successfully added",
        description: `${input.name} has been added to your grocery list.`,
      });
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

      if (!hasOther) {
        // Add empty "other" category if it doesn't exist
        return [
          ...categoriesWithItems,
          {
            category: "other",
            emoji: "📦",
            items: [],
          },
        ];
      }

      return categoriesWithItems;
    }

    // Return all categories, with empty ones if they don't exist
    return allCategoryNames.map((categoryName) => {
      if (existingCategories.has(categoryName)) {
        return existingCategories.get(categoryName)!;
      }
      return {
        category: categoryName,
        emoji: categoryEmojis[categoryName] || "📦",
        items: [],
      };
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-info-500 mx-auto mb-4" />
          <p className="text-neutral-600">{t("groceryList.loading")}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-danger-600 mb-4">{error}</p>
          <Button onClick={loadGroceryList}>{t("common.retry")}</Button>
        </div>
      </div>
    );
  }

  const isEmpty =
    !groceryList ||
    (groceryList.meals.length === 0 && groceryList.customItems.length === 0);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 w-full">
          {isEmpty ? (
            // Empty state
            <div className="flex flex-col h-screen items-center justify-center pb-26 text-center">
              <ShoppingCart className="w-16 h-16 text-neutral-400 mb-4" />
              <h2 className="text-xl font-semibold text-neutral-700 mb-2">
                {t("groceryList.emptyState")}
              </h2>
              <p className="text-neutral-500 mb-6">
                {t("groceryList.emptyStateCta")}
              </p>
              <Button onClick={() => navigate("/meal-plan")}>
                {t("groceryList.goToMealPlan")}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Meals Section */}
              {groceryList && groceryList.meals.length > 0 && (
                <section>
                  <div className="rounded-lg overflow-hidden">
                    <button
                      onClick={() => setMealsExpanded(!mealsExpanded)}
                      className="w-full pr-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {mealsExpanded ? (
                          <ChevronDown className="w-5 h-5 text-neutral-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-neutral-500" />
                        )}
                        <h2 className="text-md font-semibold text-neutral-900">
                          {t("groceryList.mealsSection")}
                        </h2>
                        <span className="text-sm text-neutral-500">
                          ({groceryList.meals.length})
                        </span>
                      </div>
                    </button>

                    {mealsExpanded && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {groceryList.meals.map((meal) => (
                            <div
                              key={meal.id}
                              className="bg-neutral-50 rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-medium text-neutral-900 mb-1">
                                    {meal.recipe.title}
                                  </h3>
                                  <p className="text-sm text-neutral-500">
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
                                    }{" "}
                                    • {meal.mealSlot}
                                  </p>
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
                                  className="text-danger-600 hover:bg-danger-50"
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

              {/* Ingredients Section (always show, includes "other" category for additional items) */}
              {groceryList && (
                <section>
                  <div className="flex flex-1 items-center mb-4 justify-between">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {t("groceryList.ingredientsSection")}
                    </h2>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={showAllCategories}
                        onCheckedChange={(checked) =>
                          setShowAllCategories(checked === true)
                        }
                      />
                      <span className="text-sm text-neutral-600">
                        {t("groceryList.showAllCategories")}
                      </span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    {getAllCategories().map((category) => {
                      const isExpanded = expandedCategories.has(
                        category.category,
                      );
                      return (
                        <div
                          key={category.category}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCategory(category.category)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-neutral-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-neutral-500" />
                              )}
                              <span className="text-2xl">{category.emoji}</span>
                              <span className="font-medium text-neutral-900 capitalize">
                                {t(
                                  `groceryList.categories.${category.category}`,
                                )}
                              </span>
                              <span className="text-sm text-neutral-500">
                                (
                                {category.items.length +
                                  (groceryList?.customItems.filter((item) =>
                                    category.category === "other"
                                      ? !item.category ||
                                        item.category === "" ||
                                        item.category === "other"
                                      : item.category === category.category,
                                  ).length || 0)}
                                )
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 pt-2 space-y-2">
                              {/* Recipe ingredients from meals */}
                              {category.items.map((ingredient, idx) => {
                                const ingredientKey = `${category.category}-${idx}`;
                                const isChecked =
                                  checkedIngredients.has(ingredientKey);
                                return (
                                  <label
                                    key={ingredientKey}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() =>
                                        toggleIngredientCheck(ingredientKey)
                                      }
                                      className="mt-0.5"
                                    />
                                    <span
                                      className={`text-sm transition-all break-words ${
                                        isChecked
                                          ? "text-success-600 line-through"
                                          : "text-neutral-700"
                                      }`}
                                    >
                                      {ingredient.quantity} {ingredient.name}
                                      {ingredient.recipes.length > 1 && (
                                        <span className="text-xs text-neutral-400 ml-2">
                                          ({ingredient.recipes.length} recipes)
                                        </span>
                                      )}
                                    </span>
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
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors"
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
                                      className={`flex-1 text-sm transition-all ${
                                        item.checked
                                          ? "text-success-600 line-through"
                                          : "text-neutral-700"
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
                                      className="text-danger-600 hover:bg-danger-50 h-auto p-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}

                              {/* Add item to category form */}
                              <div className="pt-2 mt-2 border-t border-gray-100">
                                <div className="flex flex-col gap-2">
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
                                      }
                                    }}
                                    className="w-full h-8 text-sm"
                                  />
                                  <div className="flex gap-2 items-center">
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
                                        }
                                      }}
                                      className="flex-1 h-8 text-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddCategoryItem(category.category)
                                      }
                                      disabled={
                                        !categoryItemInputs[
                                          category.category
                                        ]?.name?.trim() ||
                                        categoryLoading[category.category]
                                      }
                                      className={`p-2 flex-shrink-0 rounded-md transition-colors ${
                                        categoryItemInputs[
                                          category.category
                                        ]?.name?.trim() &&
                                        !categoryLoading[category.category]
                                          ? "bg-primary-500 text-white hover:bg-primary-600 cursor-pointer"
                                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      }`}
                                    >
                                      {categoryLoading[category.category] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Check className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </div>
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
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-danger-600" />
              </div>
              <AlertDialogTitle className="text-left">
                {t("groceryList.confirmRemoveMeal")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {t("groceryList.confirmRemoveMealDescription", {
                mealName: mealToDelete?.title || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMeal}
              className="bg-danger-600 hover:bg-danger-700 text-white"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
