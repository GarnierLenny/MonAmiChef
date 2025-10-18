import React from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tag {
  category: string;
  value: string | number;
  label: string;
  color: string;
}

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  isOverLimit?: boolean;
  maxCharacters?: number;
  placeholder?: string;
  canSend?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  tags?: Tag[];
  onRemoveTag?: (category: string, value: string | number) => void;
  onClearAllTags?: () => void;
  className?: string;
  helperText?: string; // Keep for backward compatibility with ChatPage
}

export const ChatInput = React.forwardRef<HTMLDivElement, ChatInputProps>(
  (
    {
      inputValue,
      onInputChange,
      onSubmit,
      isGenerating,
      isOverLimit = false,
      maxCharacters,
      placeholder = "Tell me what you crave",
      canSend = true,
      inputRef,
      tags = [],
      onRemoveTag,
      onClearAllTags,
      className,
      helperText,
    },
    ref,
  ) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isGenerating || !canSend) return;
      onSubmit(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0",
          !className?.includes("meal-plan-input") && !className?.includes("no-container") && "chat-input-container bg-orange-50",
          className?.includes("no-container") && "",
        )}
      >
        <div className={cn(!className?.includes("meal-plan-input") && "px-4 pb-4")}>
          {/* Enhanced Input Form */}
          <form
            onSubmit={handleSubmit}
            className={cn(
              "flex items-center gap-4 p-0.5 pl-5 bg-white flex-1 border rounded-full",
              "transition-shadow duration-200",
              isOverLimit
                ? "border-red-300 bg-red-50 shadow-lg shadow-red-200/50 focus-within:shadow-xl focus-within:shadow-red-300/50 focus-within:ring-2 focus-within:ring-red-400"
                : "border-orange-200/50 shadow-lg shadow-orange-500/15 hover:shadow-xl hover:shadow-orange-500/20 focus-within:shadow-xl focus-within:shadow-orange-500/25 focus-within:ring-2 focus-within:ring-orange-400",
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={placeholder}
              maxLength={maxCharacters}
              disabled={isGenerating}
              className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0 placeholder:text-gray-400 text-gray-900"
            />
            <Button
              type="submit"
              disabled={!canSend || isGenerating || isOverLimit}
              className={cn(
                "shrink-0 rounded-full px-4 py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-0",
                "hover:scale-105 active:scale-95",
                isOverLimit
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30",
              )}
            >
              <Send
                className={cn(
                  "transition-transform duration-200",
                  canSend &&
                    !isGenerating &&
                    "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                )}
              />
            </Button>
          </form>

          {/* Helper Text */}
          {helperText && (
            <p className="text-xs text-gray-500 mt-1.5 px-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              {helperText}
            </p>
          )}
        </div>
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";
