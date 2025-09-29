import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, CircleDot, Send } from "lucide-react";
import { ChatItem, Preferences } from "@/types/types";
import PreferencesSidebar from "./PreferenceSidebar";
import ChatHistorySidebar from "./ChatHistorySidebar";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatItem[];
  onNewChat: () => void;
  handleDropdownAction: (
    action: "rename" | "delete" | "share",
    chatId: string,
  ) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameValue: string;
  setRenameValue: (value: string) => void;
  cancelRename: () => void;
  saveRename: () => void;
  confirmDeleteId: string | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
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
  chats,
  onNewChat,
  handleDropdownAction,
  activeDropdown,
  setActiveDropdown,
  renamingId,
  setRenamingId,
  renameValue,
  setRenameValue,
  cancelRename,
  saveRename,
  confirmDeleteId,
  confirmDelete,
  cancelDelete,
  preferences,
  onPreferenceChange,
  clearAllPreferences,
  onSubmitPreferences,
  hasSelectedPreferences,
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 p-0 bg-orange-50 border-l">
        <div className="flex flex-col mt-6 h-full">
          {/* Header with Tabs */}
          <div className="bg-orange-50 p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex items-center gap-2"
                >
                  <CircleDot className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsContent value="history" className="h-full m-0 p-0">
                <ChatHistorySidebar
                  chats={chats}
                  isOpen={true}
                  onClose={onClose}
                  onNewChat={onNewChat}
                  handleDropdownAction={handleDropdownAction}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  renamingId={renamingId}
                  setRenamingId={setRenamingId}
                  renameValue={renameValue}
                  setRenameValue={setRenameValue}
                  cancelRename={cancelRename}
                  saveRename={saveRename}
                  confirmDeleteId={confirmDeleteId}
                  confirmDelete={confirmDelete}
                  cancelDelete={cancelDelete}
                />
              </TabsContent>
              <TabsContent value="preferences" className="h-full m-0 p-0">
                <PreferencesSidebar
                  preferences={preferences}
                  onPreferenceChange={onPreferenceChange}
                  clearAllPreferences={clearAllPreferences}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile Preferences Submit Button */}
          {activeTab === "preferences" && hasSelectedPreferences && onSubmitPreferences && (
            <div className="absolute bottom-0 left-0 right-0 z-50 md:hidden">
              <div className="bg-gradient-to-t from-orange-50 via-orange-50/80 to-transparent h-24 absolute inset-0 backdrop-blur-sm"></div>
              <div className="relative p-4">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-lg mx-4"></div>
                <Button
                  onClick={() => {
                    onSubmitPreferences();
                    onClose();
                  }}
                  className="relative w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium py-3 rounded-lg shadow-lg border border-white/20 flex items-center justify-center gap-2 transition-all duration-200 animate-in slide-in-from-bottom-2 hover:scale-105 active:scale-95"
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
