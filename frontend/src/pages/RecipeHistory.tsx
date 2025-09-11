import { useState, useEffect } from "react";
import { Heart, Clock, Users, Tag, Eye, History, LogIn } from "lucide-react";
import { recipeService } from "../services/recipeService";
import { RecipeHistory, Recipe } from "../types/recipe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function RecipeHistoryPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadRecipeHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loadRecipeHistory = async () => {
    try {
      const history = await recipeService.getRecipeHistory();
      setRecipeHistory(history);
    } catch (error) {
      console.error('Failed to load recipe history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      const result = await recipeService.saveRecipe(recipeId);
      // Update the history to reflect the saved status
      setRecipeHistory(prev => 
        prev.map(item => 
          item.recipe.id === recipeId 
            ? { ...item, recipe: { ...item.recipe, is_saved: result.is_saved } }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your recipe history. Please sign up or log in to access this feature.
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-center"
            >
              Go to Home & Sign In
            </a>
            <p className="text-sm text-gray-500">
              Start cooking with our AI Chef to build your recipe history!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your recipe history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipe History</h1>
          <p className="text-gray-600">All the recipes you've discovered with our AI Chef</p>
        </div>

        {recipeHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No recipe history yet</h2>
            <p className="text-gray-600 mb-4">
              Start chatting with our AI Chef to build your recipe history!
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Start Cooking
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {recipeHistory.map((historyItem) => (
              <div
                key={historyItem.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <History className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {formatDate(historyItem.created_at)} at {formatTime(historyItem.created_at)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {historyItem.recipe.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleSaveRecipe(historyItem.recipe.id)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        historyItem.recipe.is_saved
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      }`}
                      title={historyItem.recipe.is_saved ? "Remove from saved" : "Save recipe"}
                    >
                      <Heart className={`w-4 h-4 ${historyItem.recipe.is_saved ? "fill-current" : ""}`} />
                      <span>{historyItem.recipe.is_saved ? "Saved" : "Save"}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {historyItem.recipe.content_json.servings && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{historyItem.recipe.content_json.servings} servings</span>
                      </div>
                    )}
                    {historyItem.recipe.content_json.totalTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{historyItem.recipe.content_json.totalTime}</span>
                      </div>
                    )}
                  </div>

                  {historyItem.recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {historyItem.recipe.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {historyItem.recipe.tags.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{historyItem.recipe.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {historyItem.recipe.content_json.ingredients.length > 0 && (
                        <span>{historyItem.recipe.content_json.ingredients.length} ingredients</span>
                      )}
                      {historyItem.recipe.content_json.instructions.length > 0 && (
                        <span>{historyItem.recipe.content_json.instructions.length} steps</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedRecipe(historyItem.recipe)}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Recipe</span>
                    </button>
                  </div>
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