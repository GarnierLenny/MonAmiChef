import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, X, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useLocation } from "react-router-dom";
import { ChatMessage } from "../types/types";
import { parseRecipeFromText } from "../utils/recipeParser";
import { recipeService } from "../services/recipeService";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ui/chat-input";

interface ChatInterfaceProps {
  preferences: {
    mealType: string[];
    mealOccasion: string[];
    cookingEquipment: string[];
    cookingTime: string[];
    skillLevel: string[];
    nutrition: string[];
    cuisine: string[];
    spiceLevel: string[];
    meat: string[];
    vegetables: string[];
    servings: number | null;
  };
  inputValue: string;
  onInputChange: (value: string) => void;
  onPreferenceChange: (
    category: string,
    value: string | number,
    action: "add" | "remove" | "set",
  ) => void;
  messages: ChatMessage[];
  remainingCharacters: number;
  isOverLimit: boolean;
  maxCharacters: number;
  hasSelectedPreferences: boolean;
  handleSubmit: () => void;
  isGenerating: boolean;
  clearAllPreferences: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  user?: { id: string; email: string; name: string } | null;
  onAuthClick?: () => void;
}

export default function ChatInterface({
  preferences,
  inputValue,
  onInputChange,
  onPreferenceChange,
  messages,
  // remainingCharacters, // Available for character count display
  isOverLimit,
  maxCharacters,
  hasSelectedPreferences,
  handleSubmit,
  isGenerating,
  clearAllPreferences,
  inputRef,
  user,
  onAuthClick,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [savingRecipes, setSavingRecipes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Get all selected preference tags for display
  const getSelectedTags = () => {
    const tags: Array<{
      category: string;
      value: string | number;
      label: string;
      color: string;
    }> = [];

    // Helper to add tags
    const addTags = (
      category: string,
      values: string[],
      color: string,
      labelMap?: Record<string, string>,
    ) => {
      values.forEach((value) => {
        tags.push({
          category,
          value,
          label:
            labelMap?.[value] ||
            value.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          color,
        });
      });
    };

    addTags("mealType", preferences.mealType, "bg-yellow-100 text-yellow-700");
    addTags(
      "mealOccasion",
      preferences.mealOccasion,
      "bg-emerald-100 text-emerald-700",
    );
    addTags(
      "cookingEquipment",
      preferences.cookingEquipment,
      "bg-green-100 text-green-700",
    );
    addTags(
      "cookingTime",
      preferences.cookingTime,
      "bg-blue-100 text-blue-700",
    );
    addTags(
      "skillLevel",
      preferences.skillLevel,
      "bg-purple-100 text-purple-700",
    );
    addTags(
      "nutrition",
      preferences.nutrition,
      "bg-emerald-100 text-emerald-700",
    );
    addTags("cuisine", preferences.cuisine, "bg-orange-100 text-orange-700");
    addTags("spiceLevel", preferences.spiceLevel, "bg-red-100 text-red-700");
    addTags("meat", preferences.meat, "bg-red-100 text-red-700");
    addTags(
      "vegetables",
      preferences.vegetables,
      "bg-green-100 text-green-700",
    );

    if (preferences.servings !== null) {
      tags.push({
        category: "servings",
        value: preferences.servings,
        label: `${preferences.servings} servings`,
        color: "bg-blue-100 text-blue-700",
      });
    }

    return tags;
  };

  const selectedTags = getSelectedTags();

  const handleRemoveTag = (category: string, value: string | number) => {
    if (category === "servings") {
      onPreferenceChange(category, value, "remove");
    } else {
      onPreferenceChange(category, value, "remove");
    }
  };

  const handleSaveRecipe = async (messageText: string, messageId?: string) => {
    if (!messageId) return;

    // Check if user is authenticated
    if (!user) {
      // Show registration prompt for guest users with toast
      toast({
        title: "Sign up to save recipes",
        description:
          "Recipe saving is only available for registered users. Sign up to start saving your favorite recipes!",
        duration: 5000,
      });

      // Open the authentication modal
      if (onAuthClick) {
        onAuthClick();
      }
      return;
    }

    // Parse the message text to see if it contains a recipe
    const parsedRecipe = parseRecipeFromText(messageText);
    if (!parsedRecipe) return;

    setSavingRecipes((prev) => new Set([...prev, messageId]));

    try {
      // Create recipe on backend
      const recipe = await recipeService.createRecipe({
        title: parsedRecipe.title,
        content_json: parsedRecipe.content,
        nutrition: parsedRecipe.nutrition,
        tags: parsedRecipe.tags,
      });

      // Save the recipe for the user
      const result = await recipeService.saveRecipe(recipe.id);

      if (result.is_saved) {
        setSavedRecipes((prev) => new Set([...prev, messageId]));
        toast({
          title: "Recipe saved!",
          description: "Your recipe has been added to your saved recipes.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast({
        title: "Failed to save recipe",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSavingRecipes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  // Scroll to bottom after messages change
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [location.search, messages]);

  useEffect(() => {
    if (!isGenerating) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isGenerating]);

  const canSend = inputValue.trim() !== "" || hasSelectedPreferences;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => {
            const messageId = message.id ?? `${index}-${message.role}`;
            const isRecipe =
              message.role === "model" && parseRecipeFromText(message.text);
            const isSaved = savedRecipes.has(messageId);
            const isSaving = savingRecipes.has(messageId);

            return (
              <div
                key={messageId}
                className={`flex text-sm ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-6 py-4 mb-10 relative ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.role === "model" && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">
                        AI Chef
                      </span>
                    </div>
                  )}

                  {message.role === "user" ? (
                    <div className="font-sans">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="font-sans">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          p: (props) => (
                            <p className="my-3 leading-6" {...props} />
                          ),
                          ul: (props) => (
                            <ul
                              className="my-2 pl-5 list-disc space-y-1"
                              {...props}
                            />
                          ),
                          ol: (props) => (
                            <ol
                              className="my-2 pl-5 list-decimal space-y-1"
                              {...props}
                            />
                          ),
                          li: (props) => <li className="my-1" {...props} />,
                          h1: (props) => (
                            <h3
                              className="mt-3 mb-1 text-base font-semibold"
                              {...props}
                            />
                          ),
                          h2: (props) => (
                            <h4
                              className="mt-3 mb-1 text-sm font-semibold"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>

                      {/* Save Recipe Button at the end of AI messages */}
                      {isRecipe && (
                        <div className="mt-4 py-3 border-t border-gray-200">
                          <button
                            onClick={() =>
                              handleSaveRecipe(message.text, messageId)
                            }
                            disabled={isSaving}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isSaved
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-orange-100 text-orange-700 hover:bg-orange-200 hover:scale-105"
                            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Heart
                                className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                              />
                            )}
                            <span>
                              {isSaving
                                ? "Saving Recipe..."
                                : isSaved
                                  ? "Recipe Saved"
                                  : "Save Recipe"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex mb-18 justify-start">
              <div className="max-w-3xl rounded-2xl px-6 py-4 bg-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    AI Chef
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span className="text-gray-600">
                    Creating your perfect recipe...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Now sticky at bottom dont put border-t */}
        <ChatInput
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSubmit={handleSubmit}
          isGenerating={isGenerating}
          isOverLimit={isOverLimit}
          maxCharacters={maxCharacters}
          placeholder="Tell me what you crave"
          canSend={canSend}
          inputRef={inputRef}
          tags={selectedTags}
          onRemoveTag={handleRemoveTag}
          onClearAllTags={clearAllPreferences}
        />
      </div>
    </div>
  );
}
