import { useLayoutEffect, useEffect, useRef } from "react";
import { Send, Loader2, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useLocation } from "react-router-dom";
import { ChatMessage } from "../types/types";
import { Separator } from "@/components/ui/separator";

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
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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

  useEffect(() => {
    console.log('CHANGE', messages);
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex text-sm ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl rounded-2xl px-6 py-4 ${
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
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
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
        <div className="flex-shrink-0">
          <div className="p-3">
            {/* Selected Preferences Tags */}
            {selectedTags.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Selected Preferences:
                  </span>
                  <button
                    onClick={clearAllPreferences}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {selectedTags.map((tag, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${tag.color} border border-current/20`}
                    >
                      <span>{tag.label}</span>
                      <button
                        onClick={() => handleRemoveTag(tag.category, tag.value)}
                        className="hover:bg-current/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*<div className="hidden md:block flex justify-between items-center">
            <span
              className={`text-sm font-medium ${
                isOverLimit
                  ? "text-red-600"
                  : remainingCharacters <= 5
                    ? "text-orange-600"
                    : "text-gray-500"
              }`}
            >
              {remainingCharacters} characters left
            </span>
          </div>*/}

            <form
              onSubmit={handleSubmit}
              className={`flex items-center gap-4 mb-2 p-2 pl-5 bg-white flex-1 shadow-lg shadow-orange-500/30 border rounded-full transition-colors
              ${
                isOverLimit
                  ? "border-red-300 bg-red-50 focus-within:ring-2 focus-within:ring-red-500"
                  : "border-gray-300 focus-within:ring-2 focus-within:ring-orange-500"
              }
            `}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Tell me what you crave"
                maxLength={maxCharacters}
                disabled={isGenerating}
                className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={!canSend || isGenerating || isOverLimit}
                className={`shrink-0 rounded-full px-4 py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${
                  isOverLimit
                    ? "bg-gray-400"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
