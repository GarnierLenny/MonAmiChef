import {
  MessageSquare,
  X,
  Clock,
  MoreHorizontal,
  Edit3,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ChatItem } from "../types/types";
import { formatTimestamp } from "../utils/format_timestamp.utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatHistorySidebarProps {
  chats: ChatItem[];
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  handleDropdownAction: (
    action: "rename" | "delete" | "share",
    chatId: string,
  ) => void;
  activeDropdown: string | null;
  setActiveDropdown: (chatId: string | null) => void;
  renamingId: string | null;
  setRenamingId: (newId: string | null) => void;
  renameValue: string;
  setRenameValue: (rename: string) => void;
  cancelRename: () => void;
  saveRename: () => void;
  confirmDeleteId: string | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

export default function ChatHistorySidebar({
  chats,
  isOpen,
  onClose,
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
}: ChatHistorySidebarProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentId = searchParams.get("c");
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const toggleDropdown = (chatId: string) => {
    setActiveDropdown(activeDropdown === chatId ? null : chatId);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`bg-orange-50 h-full overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "w-80 opacity-100" : "w-0 opacity-0"
      }`}
    >
      <div
        className={`h-full flex flex-col transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-orange-50/50">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('chatHistory.title')}
              </h2>
              <p className="text-sm text-orange-700">
                {t('chatHistory.recentConversations')}
              </p>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-orange-100"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (isMobile) {
                onClose();
              }
            }}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
            type="button"
          >
            <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-semibold">New Chat</span>
            <Sparkles className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Chat History Yet
              </h3>
              <p className="text-gray-600 text-sm">
                Start a conversation to see your chat history here
              </p>
            </div>
          ) : (
            <div className="p-2">
              {chats.map((chat) => {
                const params = new URLSearchParams(searchParams);
                params.set("c", chat.id);
                const isActive = currentId === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (isMobile) {
                        onClose();
                      }
                    }}
                    className="group relative mb-1 rounded-lg"
                  >
                    {/* Use Link to update ?c= without full reload */}
                    <Link
                      to={{
                        pathname: location.pathname,
                        search: `?${params.toString()}`,
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg hover:bg-orange-100/50 transition-colors duration-200 ${
                        isActive ? "bg-orange-100/70" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-orange-800 transition-colors">
                          {chat.title || t('chatHistory.untitled')}
                        </h4>
                        <p className="text-xs text-orange-600 mt-1">
                          {formatTimestamp(new Date(chat.timestamp)) ??
                            "timestamp"}
                        </p>
                      </div>

                      {/* Three dots menu (don’t navigate when clicking it) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDropdown(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-orange-200 transition-all duration-200 text-gray-500 hover:text-gray-700"
                        aria-label="Chat actions"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </Link>

                    {/* Dropdown menu */}
                    {activeDropdown === chat.id && (
                      <div className="absolute right-2 top-12 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDropdownAction("rename", chat.id);
                            setRenamingId(chat.id);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDropdownAction("delete", chat.id);
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}

                    {/* Confirm delete row */}
                    {confirmDeleteId === chat.id && (
                      <div className="px-3 py-2 bg-red-50 border-t flex items-center justify-between rounded-b-lg">
                        <span className="text-sm">Delete this chat?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-sm px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              confirmDelete();
                            }}
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            className="text-sm px-2 py-1 rounded border"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              cancelDelete();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Rename modal */}
      {renamingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={cancelRename}
          />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Rename chat
            </h3>
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveRename();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  cancelRename();
                }
              }}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder={t('chatHistory.enterNewTitle')}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelRename}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRename}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={cancelDelete}
          />
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-full max-w-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete chat?
            </h3>
            <p className="text-sm text-gray-600">
              This action will permanently remove the conversation. This cannot
              be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
