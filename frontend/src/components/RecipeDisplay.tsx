import { useState } from "react";
import { Clock, Users, Copy, Share2, Save, CheckCircle, X } from "lucide-react";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  createdAt: Date;
}

interface RecipeDisplayProps {
  recipe: Recipe;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  isAuthenticated: boolean;
}

export default function RecipeDisplay({
  recipe,
  onClose,
  onSave,
  isAuthenticated,
}: RecipeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const copyToClipboard = () => {
    const recipeText = `${recipe.title}\n\nIngredients:\n${recipe.ingredients.join("\n")}\n\nInstructions:\n${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join("\n")}\n\nPrep Time: ${recipe.prepTime} min | Cook Time: ${recipe.cookTime} min | Serves: ${recipe.servings}`;

    navigator.clipboard.writeText(recipeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(recipe);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const shareRecipe = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe: ${recipe.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Error sharing - fall back to copy to clipboard
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90dvh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Prep: {recipe.prepTime}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Cook: {recipe.cookTime}min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Serves: {recipe.servings}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              onClick={shareRecipe}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
              >
                {saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saved ? "Saved!" : "Save"}</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ingredients
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>

            {/* Nutrition Facts */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Nutrition Facts
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Calories: {recipe.nutrition.calories}</div>
                <div>Protein: {recipe.nutrition.protein}g</div>
                <div>Carbs: {recipe.nutrition.carbs}g</div>
                <div>Fat: {recipe.nutrition.fat}g</div>
                <div className="col-span-2">
                  Fiber: {recipe.nutrition.fiber}g
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Instructions
            </h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex space-x-4 items-start">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={completedSteps.has(index)}
                      onChange={() => toggleStep(index)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        completedSteps.has(index)
                          ? "bg-green-500 text-white"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <p
                    className={`leading-relaxed pt-1 transition-all duration-200 ${
                      completedSteps.has(index)
                        ? "text-green-600 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {instruction}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
