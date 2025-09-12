import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Clock,
  Users,
  Tag,
  Eye,
  History,
  LogIn,
  ChefHat,
} from "lucide-react";
import { recipeService } from "../services/recipeService";
import { RecipeHistory, Recipe } from "../types/recipe";
import { createClient } from "@supabase/supabase-js";
import AuthModal from "../components/AuthModal";
import { User } from "../types/types";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function RecipeHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [recipeHistory, setRecipeHistory] = useState<RecipeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error("Auth check failed:", error);
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
      console.error("Failed to load recipe history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeId: string) => {
    try {
      const result = await recipeService.saveRecipe(recipeId);
      // Update the history to reflect the saved status
      setRecipeHistory((prev) =>
        prev.map((item) =>
          item.recipe.id === recipeId
            ? { ...item, recipe: { ...item.recipe, is_saved: result.is_saved } }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  };

  const clearConversationParam = () => {
    const params = new URLSearchParams(location.search);
    if (params.has("c")) {
      params.delete("c");
      navigate(
        { pathname: "/recipes/history", search: params.toString() },
        { replace: true },
      );
    }
  };

  const handleAuthenticate = (u: User) => {
    clearConversationParam();
    setUser(u);
    setIsAuthModalOpen(false);
    // Reload recipe history after authentication
    loadRecipeHistory();
  };

  const handleLoginClick = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 flex items-center justify-center px-4">
          <div className="text-center w-full max-w-2xl mx-auto">
            {/* Friendly illustration */}
            <div className="relative mb-12">
              <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-16 h-16 text-orange-500" />
              </div>
              <div className="absolute top-0 right-1/2 translate-x-16 -translate-y-2">
                <ChefHat className="w-10 h-10 text-orange-400" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ✨ Track your culinary journey and revisit past discoveries
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Create a free account to automatically save every recipe you
              explore. Build your personal cooking timeline!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={handleLoginClick}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
              >
                Log in
              </button>
              <button
                onClick={handleRegisterClick}
                className="flex-1 px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 font-semibold"
              >
                Register
              </button>
            </div>

            <p className="text-lg text-gray-500 mt-8">
              Never lose track of a great recipe again with automatic history
              tracking
            </p>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticate={handleAuthenticate}
          authModeParam={authMode}
        />
      </>
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
      <div className="w-screen mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Recipe History
          </h1>
          <p className="text-gray-600">
            All the recipes you've discovered with our AI Chef
          </p>
        </div>

        {recipeHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your culinary adventure starts here!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Every recipe you explore with our AI Chef will automatically
              appear in your history. Start cooking to see your journey unfold!
            </p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Discover Your First Recipe
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipeHistory.map((historyItem) => (
              <div
                key={historyItem.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {historyItem.recipe.title}
                    </h3>
                    <button
                      onClick={() => handleSaveRecipe(historyItem.recipe.id)}
                      className={`p-1 transition-colors ${
                        historyItem.recipe.is_saved
                          ? "text-red-500 hover:text-red-700"
                          : "text-gray-400 hover:text-orange-500"
                      }`}
                      title={
                        historyItem.recipe.is_saved
                          ? "Remove from saved"
                          : "Save recipe"
                      }
                    >
                      <Heart
                        className={`w-5 h-5 ${historyItem.recipe.is_saved ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    {historyItem.recipe.content_json.servings && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {historyItem.recipe.content_json.servings} servings
                        </span>
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
                      {historyItem.recipe.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {historyItem.recipe.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{historyItem.recipe.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-4">
                    Explored on {formatDate(historyItem.created_at)}
                  </div>

                  <button
                    onClick={() => setSelectedRecipe(historyItem.recipe)}
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
                      {selectedRecipe.content_json.ingredients.map(
                        (ingredient, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-gray-700">{ingredient}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {selectedRecipe.content_json.instructions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Instructions
                    </h3>
                    <ol className="space-y-3">
                      {selectedRecipe.content_json.instructions.map(
                        (instruction, index) => (
                          <li key={index} className="flex space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 leading-relaxed">
                              {instruction}
                            </span>
                          </li>
                        ),
                      )}
                    </ol>
                  </div>
                )}

                {selectedRecipe.content_json.tips &&
                  selectedRecipe.content_json.tips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Tips & Variations
                      </h3>
                      <ul className="space-y-2">
                        {selectedRecipe.content_json.tips.map((tip, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
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
                      {Object.entries(selectedRecipe.nutrition).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="text-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="text-sm text-gray-600 capitalize">
                              {key}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              {value}
                              {key === "calories" ? "" : "g"}
                            </div>
                          </div>
                        ),
                      )}
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

