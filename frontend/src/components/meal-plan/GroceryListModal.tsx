import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MealPlan, MealSlot } from "./constants";
import type { Recipe } from "@/lib/api/recipeApi";
import { recipeApi } from "@/lib/api/recipeApi";

interface GroceryListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMeals: Set<string>;
  mealPlan: MealPlan;
}

interface MealWithRecipe {
  mealKey: string;
  day: string;
  slot: MealSlot;
  title: string;
  recipeId: string;
  recipe?: Recipe;
}

export const GroceryListModal = ({
  isOpen,
  onClose,
  selectedMeals,
  mealPlan,
}: GroceryListModalProps) => {
  const { t } = useTranslation();
  const [mealsWithRecipes, setMealsWithRecipes] = useState<MealWithRecipe[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );

  // Fetch recipes for selected meals when modal opens
  useEffect(() => {
    if (isOpen && selectedMeals.size > 0) {
      loadRecipes();
    }
  }, [isOpen, selectedMeals]);

  const loadRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mealsList: MealWithRecipe[] = [];

      // Build list of selected meals with their basic info
      for (const mealKey of selectedMeals) {
        const [day, slot] = mealKey.split("-");
        const meal = mealPlan[day]?.[slot as MealSlot];

        if (meal) {
          mealsList.push({
            mealKey,
            day,
            slot: slot as MealSlot,
            title: meal.title,
            recipeId: meal.id,
          });
        }
      }

      // Fetch all recipes in parallel
      const recipePromises = mealsList.map((mealItem) =>
        recipeApi
          .getRecipe(mealItem.recipeId)
          .then((recipe) => ({ ...mealItem, recipe }))
          .catch((err) => {
            console.error(`Failed to fetch recipe for ${mealItem.title}:`, err);
            return mealItem; // Return without recipe on error
          }),
      );

      const mealsWithRecipeData = await Promise.all(recipePromises);
      setMealsWithRecipes(mealsWithRecipeData);
    } catch (err) {
      console.error("Failed to load recipes:", err);
      setError("Failed to load grocery list");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMealsWithRecipes([]);
      setError(null);
      setCheckedIngredients(new Set());
    }
  }, [isOpen]);

  // Toggle ingredient checked state
  const toggleIngredientCheck = (mealKey: string, ingredientIndex: number) => {
    const checkKey = `${mealKey}-${ingredientIndex}`;
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(checkKey)) {
        newSet.delete(checkKey);
      } else {
        newSet.add(checkKey);
      }
      return newSet;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90dvh] max-w-2xl w-[calc(100vw-2rem)] p-0 gap-0 mx-auto">
        {/* Header */}
        <DialogHeader className="p-6 bg-info-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-info-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {t("mealPlan.groceryList")}
              </DialogTitle>
              <p className="text-sm text-neutral-600 mt-1">
                {selectedMeals.size}{" "}
                {selectedMeals.size !== 1
                  ? t("mealPlan.mealsSelected")
                  : t("mealPlan.mealSelected")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 pt-2">
            {isLoading ? (
              // Loading state
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-info-500" />
                  <span className="text-neutral-600">
                    {t("mealPlan.loadingGroceryList")}
                  </span>
                </div>
              </div>
            ) : error ? (
              // Error state
              <div className="flex items-center justify-center h-64">
                <p className="text-danger-600">{error}</p>
              </div>
            ) : mealsWithRecipes.length === 0 ? (
              // Empty state
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600">{t("mealPlan.noMealsSelected")}</p>
                </div>
              </div>
            ) : (
              // Meals and ingredients list
              <div className="space-y-6">
                {mealsWithRecipes.map((mealItem, index) => (
                  <div key={mealItem.mealKey}>
                    {/* Meal header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-info-600 mb-1">
                        {mealItem.title}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        {mealItem.day} •{" "}
                        {mealItem.slot.charAt(0).toUpperCase() +
                          mealItem.slot.slice(1)}
                      </p>
                    </div>

                    {/* Ingredients */}
                    {mealItem.recipe?.content_json?.ingredients &&
                    mealItem.recipe.content_json.ingredients.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                        {mealItem.recipe.content_json.ingredients.map(
                          (ingredient, idx) => {
                            const checkKey = `${mealItem.mealKey}-${idx}`;
                            const isChecked = checkedIngredients.has(checkKey);
                            return (
                              <label
                                key={idx}
                                className="flex items-start gap-3 p-2 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    toggleIngredientCheck(mealItem.mealKey, idx)
                                  }
                                  className="w-4 h-4 text-success-600 bg-gray-100 border-gray-300 rounded focus:ring-success-500 focus:ring-2 flex-shrink-0 mt-0.5"
                                />
                                <span
                                  className={`text-sm transition-all duration-200 ${
                                    isChecked
                                      ? "text-success-600 line-through"
                                      : "text-neutral-700"
                                  }`}
                                >
                                  {ingredient}
                                </span>
                              </label>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-neutral-500 text-sm">
                        {t("mealPlan.noIngredientsAvailable")}
                      </div>
                    )}

                    {/* Separator between meals (not after last one) */}
                    {index < mealsWithRecipes.length - 1 && (
                      <Separator className="my-6" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
