import { useEffect } from "react";

interface RecipeCardProps {
  recipe: {
    id?: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
    };
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // Ensure the recipe has a stable ID
  const recipeId = recipe.id || crypto.randomUUID();

  // Save it to localStorage when the component mounts
  useEffect(() => {
    try {
      localStorage.setItem(
        `recipe-${recipeId}`,
        JSON.stringify({ ...recipe, id: recipeId }),
      );
    } catch (e) {
      console.error("Failed to save recipe to localStorage", e);
    }
  }, [recipe, recipeId]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{recipe.title}</h2>

      {/* Times and servings */}
      <div className="flex gap-4 text-sm text-gray-600">
        <span>Prep: {recipe.prepTime} min</span>
        <span>Cook: {recipe.cookTime} min</span>
        <span>Servings: {recipe.servings}</span>
      </div>

      {/* Ingredients */}
      <div>
        <h3 className="font-semibold mb-2">Ingredients</h3>
        <ul className="list-disc pl-5 space-y-1">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal pl-5 space-y-2">
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* Nutrition (optional) */}
      {recipe.nutrition && (
        <div>
          <h3 className="font-semibold mb-2">Nutrition</h3>
          <p className="text-sm text-gray-600">
            {recipe.nutrition.calories ?? "?"} kcal •{" "}
            {recipe.nutrition.protein ?? "?"}g protein •{" "}
            {recipe.nutrition.carbs ?? "?"}g carbs •{" "}
            {recipe.nutrition.fat ?? "?"}g fat • {recipe.nutrition.fiber ?? "?"}
            g fiber
          </p>
        </div>
      )}

      {/* Open full recipe link */}
      <div className="pt-4">
        <a
          href={`/recipe/${recipeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          Open full recipe
        </a>
      </div>
    </div>
  );
}
