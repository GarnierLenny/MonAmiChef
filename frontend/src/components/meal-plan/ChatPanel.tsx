import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat, Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "../../types/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onMessageSubmit: (message: string) => void;
  isGenerating: boolean;
}

export const ChatPanel = ({
  messages,
  onMessageSubmit,
  isGenerating,
}: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle chat message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    const text = inputValue.trim();
    if (!text) return;

    onMessageSubmit(text);
    setInputValue("");
  };

  return (
    <div className="hidden md:flex md:w-1/3 bg-white border-r border-gray-200 flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Meal Planning Chat
            </h2>
            <p className="text-orange-100 text-sm">
              Your AI cooking assistant
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-4 mb-2 p-2 pl-5 bg-white flex-1 shadow-lg shadow-orange-500/30 border border-gray-300 focus-within:ring-2 focus-within:ring-orange-500 rounded-full transition-colors"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about meal planning, dietary preferences..."
            disabled={isGenerating}
            className="min-w-0 grow basis-0 bg-transparent outline-none focus:ring-0"
          />
          <Button
            type="submit"
            disabled={isGenerating || !inputValue.trim()}
            className="shrink-0 rounded-full px-4 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};