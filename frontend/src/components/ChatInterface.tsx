import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Heart, ShoppingCart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMessage } from "../types/types";
import { parseRecipeFromText } from "../utils/recipeParser";
import { recipeService } from "../services/recipeService";
import { groceryListApi } from "../lib/api/groceryListApi";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ui/chat-input";
import ChatPlaceholder from "./ChatPlaceholder";
import PreferencesQuickAccess from "./PreferencesQuickAccess";

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
  onOpenPreferences?: () => void;
  onPromptClick?: (prompt: string) => void;
  isLoadingChat?: boolean;
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
  onOpenPreferences,
  onPromptClick,
  isLoadingChat = false,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [savedRecipes, setSavedRecipes] = useState<Set<string>>(new Set());
  const [savingRecipes, setSavingRecipes] = useState<Set<string>>(new Set());
  const [addedToGrocery, setAddedToGrocery] = useState<Set<string>>(new Set());
  const [addingToGrocery, setAddingToGrocery] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('chat.signUpToSave'),
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
          title: t('chat.recipeSaved'),
          description: t('chat.recipeSavedDescription'),
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      toast({
        title: t('chat.failedToSave'),
        description: t('chat.failedToSaveDescription'),
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

  const handleAddToGroceryList = async (messageText: string, messageId?: string) => {
    if (!messageId) return;

    // Check if user is authenticated
    if (!user) {
      toast({
        title: t('chat.signUpForGrocery'),
        description:
          "Grocery list is only available for registered users. Sign up to start organizing your shopping!",
        duration: 5000,
      });

      if (onAuthClick) {
        onAuthClick();
      }
      return;
    }

    // Parse the message text to see if it contains a recipe
    const parsedRecipe = parseRecipeFromText(messageText);
    if (!parsedRecipe || !parsedRecipe.content.ingredients) {
      toast({
        title: t('chat.noIngredients'),
        description: t('chat.noIngredientsDescription'),
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setAddingToGrocery((prev) => new Set([...prev, messageId]));

    try {
      console.log("Adding recipe to grocery list:", parsedRecipe.title);

      // Step 1: Create/save the recipe (similar to handleSaveRecipe)
      const recipe = await recipeService.createRecipe({
        title: parsedRecipe.title,
        content_json: parsedRecipe.content,
        nutrition: parsedRecipe.nutrition,
        tags: parsedRecipe.tags,
      });

      console.log("Recipe created:", recipe.id);

      // Step 2: Get current week's meal plan or create a "Quick Add" meal plan
      const { mealPlanApi } = await import("@/lib/api/mealPlanApi");

      // Get user's meal plans
      const mealPlans = await mealPlanApi.getUserMealPlans();

      // Find current week's meal plan or create one
      let currentPlan = mealPlans.find(plan => {
        const planDate = new Date(plan.weekStartDate);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of this week
        return planDate.toDateString() === weekStart.toDateString();
      });

      if (!currentPlan) {
        // Create a new meal plan for this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        currentPlan = await mealPlanApi.createMealPlan({
          weekStartDate: weekStart.toISOString(),
          title: t('chat.quickAddRecipes'),
          generationMethod: "manual",
        });
      }

      console.log("Using meal plan:", currentPlan.id);

      // Step 3: Add the recipe to the meal plan as a snack for today
      const today = new Date().getDay();
      await mealPlanApi.addMealPlanItem(currentPlan.id, {
        day: today,
        mealSlot: "snack",
        recipeId: recipe.id,
      });

      // Step 4: Get the updated meal plan with the new item
      const updatedPlan = await mealPlanApi.getMealPlan(currentPlan.id);

      // Find the meal plan item we just created
      const newItem = updatedPlan.items?.find(
        item => item.day === today && item.mealSlot === "snack" && item.recipeId === recipe.id
      );

      if (!newItem) {
        throw new Error("Failed to create meal plan item");
      }

      console.log("Meal plan item created:", newItem.id);

      // Step 5: Add to grocery list using the same method as meal planning
      await groceryListApi.addMeals([newItem.id]);

      setAddedToGrocery((prev) => new Set([...prev, messageId]));
      toast({
        title: t('chat.addedToGrocery'),
        description: `${parsedRecipe.title} ingredients have been added to your shopping list.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to add to grocery list:", error);
      toast({
        title: "Failed to add to grocery list",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setAddingToGrocery((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  // Smooth scroll to bottom with animation
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Check grocery list and saved recipes on mount and when messages change to update button states
  useEffect(() => {
    const checkRecipeStates = async () => {
      if (!user) return;

      try {
        // Check grocery list
        const groceryList = await groceryListApi.getGroceryList();
        const recipeTitlesInGrocery = new Set<string>(
          groceryList.meals.map(meal => meal.recipe.title.toLowerCase().trim())
        );

        // Check saved recipes
        const savedRecipesList = await recipeService.getSavedRecipes();
        const savedRecipeTitles = new Set<string>(
          savedRecipesList.map(saved => saved.recipe.title.toLowerCase().trim())
        );

        // Check each message to see if its recipe is in the grocery list or saved
        const newAddedToGrocery = new Set<string>();
        const newSavedRecipes = new Set<string>();

        messages.forEach((message, index) => {
          const messageId = message.id ?? `${index}-${message.role}`;
          const parsedRecipe = message.role === "model" && parseRecipeFromText(message.text);

          if (parsedRecipe) {
            const recipeTitle = parsedRecipe.title.toLowerCase().trim();

            // Check if in grocery list
            if (recipeTitlesInGrocery.has(recipeTitle)) {
              newAddedToGrocery.add(messageId);
            }

            // Check if saved
            if (savedRecipeTitles.has(recipeTitle)) {
              newSavedRecipes.add(messageId);
            }
          }
        });

        setAddedToGrocery(newAddedToGrocery);
        setSavedRecipes(newSavedRecipes);
      } catch (error) {
        // Silently fail - not critical if we can't check recipe states
        console.debug("Could not check recipe states:", error);
      }
    };

    checkRecipeStates();
  }, [user, messages]);

  // Scroll to bottom after messages change
  useLayoutEffect(() => {
    scrollToBottom("smooth");
  }, [location.search, messages]);

  useEffect(() => {
    if (!isGenerating) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isGenerating]);

  const canSend = inputValue.trim() !== "" || hasSelectedPreferences;

  const hasMessages = messages.length > 0;

  // Show placeholder only when there are no messages AND we're not currently loading a chat
  const showPlaceholder = !hasMessages && !isLoadingChat;

  return (
    <div className="flex-1 flex flex-col bg-orange-50 h-full overflow-hidden w-screen">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Show placeholder when no messages and not loading, otherwise show messages */}
        {showPlaceholder ? (
          <div className="flex-1 flex items-center justify-center w-full">
            <ChatPlaceholder onPromptClick={onPromptClick} />
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 md:px-8 pt-0 pb-32 space-y-4 relative scroll-smooth"
          >
            {/* Subtle top gradient fade */}
            <div className="sticky top-0 left-0 right-0 h-2 bg-gradient-to-b from-orange-50 to-transparent pointer-events-none z-10" />

            {messages.map((message, index) => {
              const messageId = message.id ?? `${index}-${message.role}`;
              const isRecipe =
                message.role === "model" && parseRecipeFromText(message.text);
              const isSaved = savedRecipes.has(messageId);
              const isSaving = savingRecipes.has(messageId);
              const isAddedToGrocery = addedToGrocery.has(messageId);
              const isAddingToGrocery = addingToGrocery.has(messageId);
              const isLastMessage = index === messages.length - 1;

              return (
                <div
                  key={messageId}
                  className={`flex text-md md:text-base w-full animate-message-slide-in ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{
                    animationDelay: isLastMessage ? "0ms" : "0ms",
                    animationFillMode: "both",
                  }}
                >
                  <div
                    className={`max-w-3xl md:max-w-4xl rounded-2xl px-4 py-3 md:px-6 md:py-5 relative transition-all duration-200 hover:shadow-md ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20 shadow-md hover:shadow-orange-500/30"
                        : "bg-white text-gray-900 shadow-sm hover:shadow-md border border-gray-100/80"
                    }`}
                  >
                    {message.role === "model" && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="relative">
                          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-orange-500 animate-pulse-subtle" />
                        </div>
                        <span className="text-xs md:text-sm font-semibold text-orange-600 tracking-wide">
                          AI Chef
                        </span>
                      </div>
                    )}

                    {message.role === "user" ? (
                      <div className="font-sans text-base leading-relaxed">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="font-sans text-base">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            p: (props) => (
                              <p
                                className="my-3 text-base leading-7 md:leading-8 text-gray-700"
                                {...props}
                              />
                            ),
                            ul: (props) => (
                              <ul
                                className="my-3 text-base pl-5 list-disc space-y-1.5 text-gray-700"
                                {...props}
                              />
                            ),
                            ol: (props) => (
                              <ol
                                className="my-3 text-base pl-5 list-decimal space-y-1.5 text-gray-700"
                                {...props}
                              />
                            ),
                            li: (props) => <li className="my-1" {...props} />,
                            h1: (props) => (
                              <h3
                                className="mt-4 mb-2 text-lg md:text-xl font-bold text-gray-900"
                                {...props}
                              />
                            ),
                            h2: (props) => (
                              <h4
                                className="mt-4 mb-2 text-base md:text-lg font-semibold text-gray-900"
                                {...props}
                              />
                            ),
                            h3: (props) => (
                              <h5
                                className="mt-3 mb-1.5 text-base font-semibold text-gray-800"
                                {...props}
                              />
                            ),
                            strong: (props) => (
                              <strong
                                className="font-semibold text-gray-900"
                                {...props}
                              />
                            ),
                            em: (props) => (
                              <em className="italic text-gray-700" {...props} />
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>

                        {/* Recipe Action Buttons */}
                        {isRecipe && (
                          <div className="mt-4 pt-4 border-t border-gray-200/80">
                            <div className="flex flex-col sm:flex-row gap-3">
                              {/* Save Recipe Button */}
                              <button
                                onClick={() =>
                                  handleSaveRecipe(message.text, messageId)
                                }
                                disabled={isSaving || isSaved}
                                className={`group flex-1 flex items-center justify-center space-x-2.5 px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 ${
                                  isSaved
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 cursor-default shadow-sm"
                                    : "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 hover:from-orange-100 hover:to-orange-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                                } ${isSaving ? "opacity-70 cursor-wait" : ""}`}
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Saving Recipe...</span>
                                  </>
                                ) : (
                                  <>
                                    <Heart
                                      className={`w-5 h-5 transition-all duration-300 ${
                                        isSaved
                                          ? "fill-green-600 text-green-600 scale-110"
                                          : "group-hover:scale-110 group-hover:fill-orange-300"
                                      }`}
                                    />
                                    <span>
                                      {isSaved ? t('chat.recipeSavedStatus') : t('chat.saveRecipe')}
                                    </span>
                                  </>
                                )}
                              </button>

                              {/* Add to Grocery List Button */}
                              <button
                                onClick={() =>
                                  handleAddToGroceryList(message.text, messageId)
                                }
                                disabled={isAddingToGrocery || isAddedToGrocery}
                                className={`group flex-1 flex items-center justify-center space-x-2.5 px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-300 ${
                                  isAddedToGrocery
                                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 cursor-default shadow-sm"
                                    : "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
                                } ${isAddingToGrocery ? "opacity-70 cursor-wait" : ""}`}
                              >
                                {isAddingToGrocery ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Adding...</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart
                                      className={`w-5 h-5 transition-all duration-300 ${
                                        isAddedToGrocery
                                          ? "fill-green-600 text-green-600 scale-110"
                                          : "group-hover:scale-110"
                                      }`}
                                    />
                                    <span>
                                      {isAddedToGrocery ? t('chat.addedToGroceryList') : t('chat.addToGroceryList')}
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Enhanced typing indicator */}
            {isGenerating && (
              <div className="flex mb-18 justify-start w-full animate-message-slide-in">
                <div className="max-w-3xl md:max-w-4xl rounded-2xl px-6 py-4 md:px-8 md:py-6 bg-white shadow-md border border-orange-100/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-orange-500 animate-pulse-subtle" />
                    <span className="text-sm md:text-base font-semibold text-orange-600">
                      AI Chef
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm md:text-base font-medium">
                      {"Creating your perfect recipe".split("").map((char, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent animate-wave-letter"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {char === " " ? "\u00A0" : char}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input with Quick Access - Now sticky at bottom dont put border-t */}
        <div className="flex-shrink-0 chat-input-container bg-orange-50">
          <PreferencesQuickAccess
            onPreferenceSelect={(category, value) => {
              // For servings, use "set" action, for others use "add"
              const action = category === "servings" ? "set" : "add";
              onPreferenceChange(category, value, action);
            }}
            onOpenPreferences={onOpenPreferences}
            selectedTags={selectedTags}
            onRemoveTag={handleRemoveTag}
            onClearAllTags={clearAllPreferences}
            preferences={preferences}
          />
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
            className="no-container"
          />
        </div>
      </div>
    </div>
  );
}
