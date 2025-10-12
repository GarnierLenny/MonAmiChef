// Import UI components from shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import icons from lucide-react
import { Clock, Users, Zap, X, ChefHat, Utensils, Loader2 } from "lucide-react";

// Import React hooks
import { useState, useEffect } from "react";

// Import i18n for translations
import { useTranslation } from "react-i18next";

// Import types and API
import type { Meal } from "./constants";
import type { Recipe } from "@/lib/api/recipeApi";
import { recipeApi } from "@/lib/api/recipeApi";

/**
 * Props interface for RecipeModal component
 */
interface RecipeModalProps {
  isOpen: boolean; // Controls modal visibility
  onClose: () => void; // Handler for closing the modal
  meal: Meal | null; // Meal data to display recipe for
}

/**
 * RecipeModal Component
 *
 * Displays full recipe details in a modal dialog including:
 * - Recipe title, cooking time, servings, calories
 * - Nutritional macros (protein, carbs, fat)
 * - Interactive ingredient checklist
 * - Step-by-step cooking instructions with checkboxes
 * - Chef's tips and recommendations
 * - Markdown rendering support for formatted text
 */
export const RecipeModal = ({ isOpen, onClose, meal }: RecipeModalProps) => {
  // Get translation function
  const { t } = useTranslation();

  // Recipe data state
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interactive checklist states for tracking cooking progress
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set(),
  );
  const [checkedInstructions, setCheckedInstructions] = useState<Set<number>>(
    new Set(),
  );

  // Fetch recipe data when modal opens and meal changes
  useEffect(() => {
    if (isOpen && meal?.id) {
      setIsLoading(true);
      setError(null);

      recipeApi
        .getRecipe(meal.id)
        .then((fetchedRecipe) => {
          console.log("Fetched recipe:", fetchedRecipe);
          console.log("Recipe content:", fetchedRecipe.content_json);
          setRecipe(fetchedRecipe);
        })
        .catch((err) => {
          console.error("Failed to fetch recipe:", err);
          setError("Failed to load recipe details");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, meal?.id]);

  // Reset state when modal closes or meal changes
  useEffect(() => {
    if (!isOpen) {
      setRecipe(null);
      setError(null);
      setCheckedIngredients(new Set());
      setCheckedInstructions(new Set());
    }
  }, [isOpen]);

  // Reset recipe when meal ID changes (for regeneration)
  useEffect(() => {
    if (meal?.id && recipe?.id !== meal.id) {
      setRecipe(null);
      setCheckedIngredients(new Set());
      setCheckedInstructions(new Set());
    }
  }, [meal?.id, recipe?.id]);

  /**
   * Toggle ingredient checked state
   * Adds or removes ingredient index from checkedIngredients set
   */
  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  /**
   * Toggle instruction checked state
   * Adds or removes instruction index from checkedInstructions set
   */
  const toggleInstructionCheck = (index: number) => {
    setCheckedInstructions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  /**
   * Simple markdown renderer for bold text
   * Converts **text** to <strong>text</strong>
   */
  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90dvh] max-w-4xl w-[calc(100vw-2rem)] p-0 gap-0 mx-auto">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {meal.title}
              </DialogTitle>
              {/* Recipe metadata - cooking time, servings, calories */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {meal.cookingTime} {t("mealPlan.min")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>
                    {meal.servings} {t("mealPlan.servings")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">
                    {meal.calories} {t("mealPlan.cal")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Macros */}
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
              {t("mealPlan.protein")} {meal.macros.protein}g
            </Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1">
              {t("mealPlan.carbs")} {meal.macros.carbs}g
            </Badge>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1">
              {t("mealPlan.fat")} {meal.macros.fat}g
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-gray-600">{t("common.loading")}</span>
                </div>
              </div>
            ) : error ? (
              // Error state - show error message with retry button
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600 mb-2">
                    {t("mealPlan.failedToLoadRecipe")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (meal?.id) {
                        setIsLoading(true);
                        setError(null);
                        recipeApi
                          .getRecipe(meal.id)
                          .then(setRecipe)
                          .catch(() =>
                            setError(t("mealPlan.failedToLoadRecipe")),
                          )
                          .finally(() => setIsLoading(false));
                      }
                    }}
                  >
                    {t("mealPlan.tryAgain")}
                  </Button>
                </div>
              </div>
            ) : recipe ? (
              // Recipe loaded - display full recipe content
              <div className="space-y-8">
                {/* Recipe Image/Emoji */}
                {/* <div className="text-center">
                <div className="text-8xl mb-4">{meal.image}</div>
                <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                  {meal.description}
                </p>
              </div> */}

                {/* Ingredients Section - Interactive checklist */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-gray-700" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t("mealPlan.ingredients")}
                      </h3>
                    </div>
                    {/* Progress indicator - shows completion status */}
                    {recipe.content_json.ingredients &&
                      recipe.content_json.ingredients.length > 0 && (
                        <div
                          className={`text-sm transition-colors ${
                            checkedIngredients.size ===
                            recipe.content_json.ingredients.length
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {checkedIngredients.size ===
                          recipe.content_json.ingredients.length
                            ? `✅ ${t("mealPlan.allIngredientsReady")}`
                            : `${checkedIngredients.size} / ${recipe.content_json.ingredients.length} ${t("mealPlan.checked")}`}
                        </div>
                      )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recipe.content_json.ingredients &&
                    recipe.content_json.ingredients.length > 0 ? (
                      recipe.content_json.ingredients.map(
                        (ingredient, index) => {
                          const isChecked = checkedIngredients.has(index);
                          return (
                            <label
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleIngredientCheck(index)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0"
                              />
                              <span
                                className={`transition-all duration-200 ${
                                  isChecked
                                    ? "text-green-600 line-through"
                                    : "text-gray-700"
                                }`}
                              >
                                {ingredient}
                              </span>
                            </label>
                          );
                        },
                      )
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <p className="text-gray-500">
                          {t("recipe.noIngredients")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Instructions Section - Step-by-step cooking guide */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-gray-700" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        {t("mealPlan.instructions")}
                      </h3>
                    </div>
                    {/* Progress indicator - shows cooking progress */}
                    {recipe.content_json.instructions &&
                      recipe.content_json.instructions.length > 0 && (
                        <div
                          className={`text-sm transition-colors ${
                            checkedInstructions.size ===
                            recipe.content_json.instructions.length
                              ? "text-green-600 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {checkedInstructions.size ===
                          recipe.content_json.instructions.length
                            ? `🎉 ${t("mealPlan.recipeCompleted")}`
                            : `${checkedInstructions.size} / ${recipe.content_json.instructions.length} ${t("mealPlan.stepsDone")}`}
                        </div>
                      )}
                  </div>
                  <div className="space-y-4">
                    {recipe.content_json.instructions &&
                    recipe.content_json.instructions.length > 0 ? (
                      recipe.content_json.instructions.map(
                        (instruction, index) => {
                          const isChecked = checkedInstructions.has(index);
                          return (
                            <label
                              key={index}
                              className="flex gap-4 cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-colors"
                            >
                              {/* Checkbox for tracking step completion */}
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleInstructionCheck(index)}
                                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0 mt-1"
                              />
                              {/* Step number badge - changes color when completed */}
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                                  isChecked
                                    ? "bg-green-500 text-white"
                                    : "bg-orange-500 text-white"
                                }`}
                              >
                                {isChecked ? "✓" : index + 1}
                              </div>
                              {/* Instruction text with markdown support */}
                              <div className="flex-1 pt-1">
                                <p
                                  className={`leading-relaxed transition-all duration-200 ${
                                    isChecked
                                      ? "text-green-600 line-through"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {renderMarkdown(instruction)}
                                </p>
                              </div>
                            </label>
                          );
                        },
                      )
                    ) : (
                      // Empty state for instructions
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {t("recipe.noInstructions")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips Section - Chef's recommendations and pro tips */}
                {recipe.content_json.tips &&
                  recipe.content_json.tips.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        💡 {t("recipe.chefsTips")}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        {recipe.content_json.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ) : (
              // No recipe data available state
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-600">{t("recipe.noData")}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Commented out for cleaner UI */}
        {/* <div className="p-6 pt-4 border-t">
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-8">
              {t('common.close')}
            </Button>
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};
