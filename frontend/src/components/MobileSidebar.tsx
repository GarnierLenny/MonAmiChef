import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Ellipsis, Edit, Trash, Share } from "lucide-react";
import { ChatItem, Preferences } from "@/types/types";
import PreferencesSidebar from "./PreferenceSidebar";
import { formatTimestamp } from "../utils/format_timestamp.utils";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface MobileSidebarProps {
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
    action: "add" | "remove" | "set",
  ) => void;
  clearAllPreferences: () => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  chats,
  onNewChat,
  handleDropdownAction,
  activeDropdown,
  setActiveDropdown,
  renamingId,
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
}: MobileSidebarProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"history" | "preferences">(
    "history",
  );

  const handleChatClick = (chatId: string) => {
    navigate(`/?c=${chatId}`, { replace: false });
    onClose();
  };
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        className="w-64 p-0 flex flex-col h-full bg-gradient-to-b from-chef-cream to-background data-[state=open]:animate-slide-in-right"
        style={{
          animation: "slide-in-right 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-chef-orange/20 bg-gradient-to-r from-chef-orange/10 to-chef-yellow/10">
          <div className="flex items-center justify-between">
            <img
              src="/lovable-uploads/2db14320-f76b-4b9d-978c-1761722e2695.png"
              alt="Chef Logo"
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-chef-orange/20 bg-white/50">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "text-chef-brown border-b-2 border-chef-orange bg-chef-orange/5"
                : "text-chef-brown/60 hover:text-chef-brown"
            }`}
          >
            Chat History
          </button>
          <button
            onClick={() => {
              setActiveTab("preferences");
              onClose();
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "preferences"
                ? "text-chef-brown border-b-2 border-chef-orange bg-chef-orange/5"
                : "text-chef-brown/60 hover:text-chef-brown"
            }`}
          >
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "history" ? (
            <div className="p-4 space-y-4">
              {/* New Chat Button */}
              <Button
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                variant="outline"
                className="w-full justify-start gap-2 border-chef-orange/30 text-chef-brown hover:bg-chef-orange/10"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>

              {/* Chat History */}
              <div className="space-y-2">
                {chats.map((chat, index) => (
                  <div key={chat.id} className="group relative">
                    {renamingId === chat.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-1 text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={saveRename} variant="ghost">
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          onClick={cancelRename}
                          variant="ghost"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : confirmDeleteId === chat.id ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700 mb-2">
                          Delete this chat?
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={confirmDelete}
                            variant="destructive"
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            onClick={cancelDelete}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-chef-orange/5 transition-colors">
                        <div onClick={() => handleChatClick(chat.id)}>
                          {chat.title}
                          <p className="text-xs text-pink-600">
                            {formatTimestamp(new Date(chat.timestamp)) ??
                              "timestamp"}
                          </p>
                        </div>
                        <Ellipsis
                          className="h-4 w-4 bg-blue"
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === chat.id ? null : chat.id,
                            )
                          }
                        />

                        {activeDropdown === chat.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-chef-orange/20 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                            <button
                              onClick={() =>
                                handleDropdownAction("rename", chat.id)
                              }
                              className="w-full px-3 py-2 text-left text-sm hover:bg-chef-orange/5 flex items-center gap-2"
                            >
                              <Edit className="h-3 w-3" />
                              Rename
                            </button>
                            {/*<button
                              onClick={() =>
                                handleDropdownAction("share", chat.id)
                              }
                              className="w-full px-3 py-2 text-left text-sm hover:bg-chef-orange/5 flex items-center gap-2"
                            >
                              <Share className="h-3 w-3" />
                              Share
                            </button>*/}
                            <button
                              onClick={() =>
                                handleDropdownAction("delete", chat.id)
                              }
                              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {index !== chats.length - 1 && (
                      <Separator orientation="horizontal" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <PreferencesSidebar
                  preferences={preferences}
                  onPreferenceChange={onPreferenceChange}
                  clearAllPreferences={clearAllPreferences}
                />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileSidebar;
