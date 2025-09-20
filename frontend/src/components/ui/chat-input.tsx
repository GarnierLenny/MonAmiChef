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
          "flex-shrink-0 chat-input-container",
          !className?.includes("bg-") && "bg-orange-50",
          !className?.includes("border-") && "border-gray-200",
          className,
        )}
      >
        <div className="p-3 pb-safe">
          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Selected Preferences:
                </span>
                {onClearAllTags && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAllTags}
                    className="h-auto p-0 text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className={cn(
                      "inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border border-current/20",
                      tag.color,
                    )}
                  >
                    <span>{tag.label}</span>
                    {onRemoveTag && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTag(tag.category, tag.value)}
                        className="h-auto p-0.5 hover:bg-current/20 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={cn(
              "flex items-center gap-4 mb-2 p-0.5 pl-5 bg-white flex-1 shadow-lg shadow-orange-500/30 border rounded-full transition-colors",
              isOverLimit
                ? "border-red-300 bg-red-50 focus-within:ring-2 focus-within:ring-red-500"
                : "border-gray-300 focus-within:ring-2 focus-within:ring-orange-500",
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
              className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0"
            />
            <Button
              type="submit"
              disabled={!canSend || isGenerating || isOverLimit}
              className={cn(
                "shrink-0 rounded-full px-4 py-4 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-0",
                isOverLimit
                  ? "bg-gray-400"
                  : "bg-orange-500 hover:bg-orange-600",
              )}
            >
              <Send />
            </Button>
          </form>
        </div>
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";

