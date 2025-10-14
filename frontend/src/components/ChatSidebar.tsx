import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Send, PanelLeft, ChefHat } from "lucide-react";
import { Preferences } from "@/types/types";
import PreferencesSidebar from "./PreferenceSidebar";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  onPreferenceChange: (
    category: string,
    value: string | number,
    action: "add" | "remove" | "set" | "clear",
  ) => void;
  clearAllPreferences: () => void;
  onSubmitPreferences?: () => void;
  hasSelectedPreferences?: boolean;
}

export function ChatSidebar({
  isOpen,
  onClose,
  preferences,
  onPreferenceChange,
  clearAllPreferences,
  onSubmitPreferences,
  hasSelectedPreferences,
}: ChatSidebarProps) {

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-72 p-0 bg-orange-50 border-l border-orange-200/50 flex flex-col h-full">
        {/* Orange to Pink Gradient Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 shadow-md relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <ChefHat className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <span className="font-bold text-white text-lg drop-shadow-md">Preferences</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 relative z-10"
          >
            <PanelLeft className="h-5 w-5 drop-shadow" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-0 relative">
          <PreferencesSidebar
            preferences={preferences}
            onPreferenceChange={onPreferenceChange}
            clearAllPreferences={clearAllPreferences}
          />

          {/* Mobile Preferences Submit Button */}
          {hasSelectedPreferences && onSubmitPreferences && (
            <div className="absolute bottom-0 left-0 right-0 z-50 md:hidden">
              <div className="bg-gradient-to-t from-orange-50 via-orange-50/80 to-transparent h-24 absolute inset-0 backdrop-blur-sm"></div>
              <div className="relative p-4">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-lg mx-4"></div>
                <Button
                  onClick={() => {
                    onSubmitPreferences();
                    onClose();
                  }}
                  className="relative w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg shadow-lg border border-white/20 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Generate Recipe
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatSidebar;
