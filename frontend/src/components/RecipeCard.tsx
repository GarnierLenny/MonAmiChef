import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users } from "lucide-react";

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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">{recipe.title}</CardTitle>
        <CardDescription>
          <div className="flex gap-4 text-sm mt-2">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Prep: {recipe.prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Cook: {recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Servings: {recipe.servings}</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ingredients */}
        <div>
          <h3 className="font-semibold mb-2">Ingredients</h3>
          <ul className="list-disc pl-5 space-y-1">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>

        <Separator />

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
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Nutrition</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.nutrition.calories && (
                  <Badge variant="secondary">
                    {recipe.nutrition.calories} kcal
                  </Badge>
                )}
                {recipe.nutrition.protein && (
                  <Badge variant="secondary" className="bg-green-100">
                    {recipe.nutrition.protein}g protein
                  </Badge>
                )}
                {recipe.nutrition.carbs && (
                  <Badge variant="secondary" className="bg-blue-100">
                    {recipe.nutrition.carbs}g carbs
                  </Badge>
                )}
                {recipe.nutrition.fat && (
                  <Badge variant="secondary" className="bg-orange-100">
                    {recipe.nutrition.fat}g fat
                  </Badge>
                )}
                {recipe.nutrition.fiber && (
                  <Badge variant="secondary">
                    {recipe.nutrition.fiber}g fiber
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
          <a
            href={`/recipe/${recipeId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open full recipe
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
