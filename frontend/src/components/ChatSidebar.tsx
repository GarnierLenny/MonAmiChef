import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  History,
  CircleDot,
  Plus,
  Ellipsis,
  Edit,
  Trash,
  Share,
} from "lucide-react";
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
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState("history");

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-80 p-0 bg-background border-l mb-5"
      >
        <div className="flex flex-col h-full">
          {/* Header with Tabs */}
          <div className="p-4 border-b">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ChatSidebar;
