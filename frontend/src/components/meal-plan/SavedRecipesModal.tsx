import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Clock, Users, Zap, X } from "lucide-react";
import { SavedRecipe } from "@/types/recipe";
import { recipeService } from "@/services/recipeService";
import { useToast } from "@/hooks/use-toast";

interface SavedRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: SavedRecipe) => void;
  isAuthenticated: boolean;
}

export const SavedRecipesModal = ({
  isOpen,
  onClose,
  onSelectRecipe,
  isAuthenticated,
}: SavedRecipesModalProps) => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Load saved recipes when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadSavedRecipes();
    } else if (isOpen && !isAuthenticated) {
      // Show authentication toast for anonymous users
      toast({
        title: "Sign in required",
        description: "Please sign in to access your saved recipes.",
        variant: "destructive",
      });
      onClose();
    }
  }, [isOpen, isAuthenticated]);

  // Filter recipes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(savedRecipes);
    } else {
      const filtered = savedRecipes.filter(
        (savedRecipe) =>
          savedRecipe.recipe.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          savedRecipe.recipe.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, savedRecipes]);

  const loadSavedRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recipes = await recipeService.getSavedRecipes();
      setSavedRecipes(recipes);
      setFilteredRecipes(recipes);
    } catch (err) {
      console.error("Failed to load saved recipes:", err);
      setError("Failed to load saved recipes");
      toast({
        title: "Error",
        description: "Failed to load your saved recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = (savedRecipe: SavedRecipe) => {
    onSelectRecipe(savedRecipe);
    onClose();
    toast({
      title: "Recipe selected",
      description: `${savedRecipe.recipe.title} has been added to your meal plan.`,
    });
  };

  const handleClose = () => {
    setSearchQuery("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-sm max-w-2xl w-[calc(100vw-2rem)] p-0 gap-0 mx-auto">
        {/* Header */}
        <DialogHeader className="p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Choose Saved Recipe
            </DialogTitle>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 h-[50dvh] ">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-gray-600">
                    Loading saved recipes...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-red-600 mb-3">{error}</p>
                  <Button variant="outline" onClick={loadSavedRecipes}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">
                    {searchQuery
                      ? "No recipes found matching your search"
                      : "No saved recipes yet"}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-gray-400">
                      Save recipes from your meal plans to see them here
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecipes.map((savedRecipe) => (
                  <div
                    key={savedRecipe.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectRecipe(savedRecipe)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {savedRecipe.recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(
                            savedRecipe.created_at,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Recipe Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          Servings:{" "}
                          {savedRecipe.recipe.content_json.servings || 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {savedRecipe.recipe.content_json.cookTime || "N/A"}
                        </span>
                      </div>
                      {savedRecipe.recipe.nutrition && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">
                            {savedRecipe.recipe.nutrition.calories || 0} cal
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {savedRecipe.recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {savedRecipe.recipe.tags
                          .slice(0, 4)
                          .map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        {savedRecipe.recipe.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{savedRecipe.recipe.tags.length - 4} more
                          </Badge>
                        )}
                      </div>
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

