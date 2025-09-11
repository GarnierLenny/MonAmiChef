import { useState, useEffect } from "react";
import { Heart, Clock, Users, Tag, Trash2, Eye } from "lucide-react";
import { recipeService } from "../services/recipeService";
import { SavedRecipe, Recipe } from "../types/recipe";

export default function SavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    try {
      const recipes = await recipeService.getSavedRecipes();
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Failed to load saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    try {
      await recipeService.unsaveRecipe(recipeId);
      setSavedRecipes(prev => prev.filter(saved => saved.recipe.id !== recipeId));
    } catch (error) {
      console.error('Failed to unsave recipe:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your saved recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Recipes</h1>
          <p className="text-gray-600">Your collection of favorite recipes</p>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved recipes yet</h2>
            <p className="text-gray-600 mb-4">
              Start chatting with our AI Chef and save your favorite recipes!
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Start Cooking
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((saved) => (
              <div
                key={saved.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {saved.recipe.title}
                    </h3>
                    <button
                      onClick={() => handleUnsaveRecipe(saved.recipe.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove from saved"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {saved.recipe.content_json.servings && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{saved.recipe.content_json.servings} servings</span>
                      </div>
                    )}
                    {saved.recipe.content_json.totalTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{saved.recipe.content_json.totalTime}</span>
                      </div>
                    )}
                  </div>

                  {saved.recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {saved.recipe.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {saved.recipe.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{saved.recipe.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Saved on {formatDate(saved.created_at)}
                  </div>

                  <button
                    onClick={() => setSelectedRecipe(saved.recipe)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Recipe</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRecipe.title}
                </h2>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {selectedRecipe.content_json.ingredients.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Ingredients
                    </h3>
                    <ul className="space-y-2">
                      {selectedRecipe.content_json.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipe.content_json.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Instructions
                    </h3>
                    <ol className="space-y-3">
                      {selectedRecipe.content_json.instructions.map((instruction, index) => (
                        <li key={index} className="flex space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 leading-relaxed">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedRecipe.content_json.tips && selectedRecipe.content_json.tips.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tips & Variations
                    </h3>
                    <ul className="space-y-2">
                      {selectedRecipe.content_json.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedRecipe.nutrition && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Nutrition (per serving)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(selectedRecipe.nutrition).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600 capitalize">{key}</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {value}{key === 'calories' ? '' : 'g'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}