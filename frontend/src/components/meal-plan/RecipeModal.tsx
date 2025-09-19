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
import { Clock, Users, Zap, X, ChefHat, Utensils, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Meal } from "./constants";
import type { Recipe } from "@/lib/api/recipeApi";
import { recipeApi } from "@/lib/api/recipeApi";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal | null;
}

export const RecipeModal = ({ isOpen, onClose, meal }: RecipeModalProps) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [isOpen]);

  // Reset recipe when meal ID changes (for regeneration)
  useEffect(() => {
    if (meal?.id && recipe?.id !== meal.id) {
      setRecipe(null);
    }
  }, [meal?.id, recipe?.id]);

  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="h-[90vh] max-w-4xl w-[calc(100vw-2rem)] p-0 gap-0 mx-auto">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {meal.title}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{meal.cookingTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{meal.servings} servings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{meal.calories} cal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Macros */}
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
              Protein {meal.macros.protein}g
            </Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1">
              Carbs {meal.macros.carbs}g
            </Badge>
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1">
              Fat {meal.macros.fat}g
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
                <span className="text-gray-600">Loading recipe details...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">
                  Failed to load recipe details
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
                        .catch(() => setError("Failed to load recipe details"))
                        .finally(() => setIsLoading(false));
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : recipe ? (
            <div className="space-y-8">
              {/* Recipe Image/Emoji */}
              {/* <div className="text-center">
                <div className="text-8xl mb-4">{meal.image}</div>
                <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                  {meal.description}
                </p>
              </div> */}

              {/* Ingredients Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-gray-700" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Ingredients
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recipe.content_json.ingredients && recipe.content_json.ingredients.length > 0 ? (
                    recipe.content_json.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{ingredient}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-gray-500">No ingredients available</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Instructions Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-gray-700" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Instructions
                  </h3>
                </div>
                <div className="space-y-4">
                  {recipe.content_json.instructions && recipe.content_json.instructions.length > 0 ? (
                    recipe.content_json.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-700 leading-relaxed">
                            {instruction}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No instructions available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Section */}
              {recipe.content_json.tips &&
                recipe.content_json.tips.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      💡 Chef's Tips
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
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">No recipe data available</p>
            </div>
          )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {/* <div className="p-6 pt-4 border-t">
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-8">
              Close
            </Button>
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};

