// src/pages/ChatPage.tsx
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Preferences, ChatItem, ChatMessage } from "../types/types";
import PreferencesSidebar from "../components/PreferenceSidebar";
import ChatInterface from "../components/ChatInterface";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import MobileTopBar from "../components/MobileTopBar";
import NavigationSidebar from "../components/NavigationSidebar";
import ChatSidebar from "../components/ChatSidebar";
import { useIsMobile } from "../hooks/use-mobile";
import Cookies from "universal-cookie";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { apiFetch } from "../lib/apiClient";
import { ArrowLeftFromLine } from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8888";
const MAX_CHARACTERS = 150;

const cookies = new Cookies(null, { path: "/" });

const initialAIText = (max: number): string =>
  `Hi! I'm your AI cooking assistant. Tell me what ingredients you have (max ${max} characters) and I'll create a personalized recipe for you based on your preferences!`;

const buildAiGreeting = (): ChatMessage => ({
  id: "initial",
  role: "model",
  text: initialAIText(MAX_CHARACTERS),
  timestamp: new Date(),
});

interface ChatPageProps {
  user?: { id: string; email: string; name: string } | null;
  onAuthClick?: () => void;
  onSignOut?: () => Promise<void>;
}

function ChatPage({ user, onAuthClick, onSignOut }: ChatPageProps = {}) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([buildAiGreeting()]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [preferences, setPreferences] = useState<Preferences>({
    mealType: [],
    mealOccasion: [],
    cookingEquipment: [],
    cookingTime: [],
    skillLevel: [],
    nutrition: [],
    cuisine: [],
    spiceLevel: [],
    meat: [],
    vegetables: [],
    servings: null,
  });
  const latestChatIdRef = useRef<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // History sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

  const isMobile = useIsMobile();
  const chatId = searchParams.get("c");

  // helpers to mutate ?c=
  const setChatParam = (id: string, replace = true) => {
    const params = new URLSearchParams(searchParams);
    params.set("c", id);
    setSearchParams(params, { replace });
  };
  const clearChatParam = (replace = true) => {
    const params = new URLSearchParams(searchParams);
    if (params.has("c")) {
      params.delete("c");
      setSearchParams(params, { replace });
    }
  };

  // Derived values
  const remainingCharacters = useMemo(
    () => MAX_CHARACTERS - inputValue.length,
    [inputValue],
  );
  const isOverLimit = remainingCharacters < 0;

  // History chats actions
  const handleDropdownAction = async (
    action: "rename" | "delete" | "share",
    dropdownChatId: string,
  ) => {
    console.log("id", dropdownChatId, action);
    setActiveDropdown(null);
    if (action === "rename") {
      setRenamingId(dropdownChatId);
    } else if (action === "delete") {
      setConfirmDeleteId(dropdownChatId);
    } else if (action === "share") {
      console.log("Share action for chat:", dropdownChatId);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId === chatId) {
      handleNewChat();
    }
    await apiFetch(`/chat/conversations/${confirmDeleteId}`, {
      auth: "optional",
      method: "DELETE",
    });
    setConfirmDeleteId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
  };

  const saveRename = useCallback(async () => {
    if (!renamingId) return;
    const newTitle = renameValue.trim();
    if (!newTitle) return;

    await apiFetch(`/chat/conversations/${renamingId}`, {
      auth: "optional",
      method: "PATCH",
      body: JSON.stringify({ newTitle }),
    });

    setChats((prev) =>
      prev.map((c) => (c.id === renamingId ? { ...c, title: newTitle } : c)),
    );
    setRenamingId(null);
  }, [renamingId, renameValue]);

  // Load history chats
  useEffect(() => {
    (async () => {
      const result = await apiFetch("/chat/conversations", {
        auth: "optional",
      });
      const tmpChats: ChatItem[] = [];
      result.forEach((chat: any) => {
        tmpChats.push({
          title: chat.title,
          id: chat.id,
          timestamp: chat.created_at,
        });
      });
      setChats(tmpChats);
    })();
  }, [chatId, isSidebarOpen, saveRename]);

  const handlePreferenceChange = (
    category: ArrayKeys | NumberKeys,
    value: string | number,
    action: "add" | "remove" | "set" | "clear",
  ) => {
    setPreferences((prev) => {
      const next = { ...prev };

      if (category === "servings" || category === "cooks") {
        if (action === "set") next[category] = value as number;
        if (action === "clear" || action === "remove") next[category] = null;
        return next;
      }

      const arr = [...(next[category] as string[])];
      if (action === "add") {
        if (!arr.includes(value as string)) arr.push(value as string);
      } else if (action === "remove") {
        next[category] = arr.filter((v) => v !== value) as any;
        return next;
      } else if (action === "clear") {
        next[category] = [];
        return next;
      }
      next[category] = arr;
      return next;
    });
  };

  // Clear all preferences
  function clearAllPreferences() {
    Object.keys(preferences).forEach((category) => {
      if (category === "servings") {
        handlePreferenceChange(category, 0, "remove");
      } else {
        handlePreferenceChange(category as ArrayKeys, "", "clear");
      }
    });
  }

  // Load current chat messages
  useEffect(() => {
    // New chat: keep greeting
    if (!chatId) {
      setMessages([buildAiGreeting()]);
      clearAllPreferences();
      return;
    }

    // Mark this fetch as the latest
    latestChatIdRef.current = chatId;

    const ac = new AbortController();
    setIsLoadingChat(true);

    (async () => {
      const startedFor = chatId; // capture
      try {
        const result = await apiFetch(
          `/chat/conversations/${chatId}/messages`,
          {
            auth: "optional",
            method: "GET",
            headers: { "Content-Type": "application/json" },
            signal: ac.signal,
          },
        );

        if (latestChatIdRef.current !== startedFor) return;

        const msgs = result?.messages ?? [];
        setMessages(
          Array.isArray(msgs) && msgs.length ? msgs : [buildAiGreeting()],
        );
      } catch (err: any) {
        if (err.name !== "AbortError") {
          // Only log; keep previous messages to avoid flash
          console.error("Failed to load chat: ", err);
        }
      } finally {
        if (!ac.signal.aborted && latestChatIdRef.current === startedFor) {
          setIsLoadingChat(false);
        }
      }
    })();

    return () => ac.abort();
  }, [chatId]);

  type ArrayKeys =
    | "mealType"
    | "mealOccasion"
    | "cookingEquipment"
    | "cookingTime"
    | "skillLevel"
    | "nutrition"
    | "cuisine"
    | "spiceLevel"
    | "meat"
    | "vegetables";
  type NumberKeys = "servings" | "cooks";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGenerating) return;
    const text = inputValue.trim();
    if (!text) return;
    void handleSubmitMessage(text);
  };

  const handleSubmitMessage = async (text: string) => {
    setInputValue("");

    // optimistic user bubble
    const now = new Date();
    setMessages((m) => [
      ...m,
      { id: `user-${now.getTime()}`, role: "user", text, timestamp: now },
    ]);
    setIsGenerating(true);

    const payload = { userMessage: text, preferences };

    try {
      const path = chatId
        ? `/chat/conversations/${chatId}`
        : `/chat/conversations`;

      const res = await apiFetch<{
        reply: string;
        conversationId: string;
      }>(path, {
        auth: "optional",
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMessages((m) => [
        ...m,
        {
          id: `model-${Date.now()}`,
          role: "model",
          text: res.reply ?? "",
          timestamp: new Date(),
        },
      ]);

      if (!chatId && res.conversationId) {
        setChatParam(res.conversationId, true);
      }

      clearAllPreferences();
    } catch (err) {
      console.error("Message sending failed:", err);
      setMessages((m) => [
        ...m,
        {
          id: `error-${Date.now()}`,
          role: "model",
          text: "Oops, something went wrong.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    clearChatParam(false);
    setMessages([buildAiGreeting()]);
    setInputValue("");
  };

  const hasSelectedPreferences = useMemo(() => {
    return (
      preferences.mealType.length > 0 ||
      preferences.mealOccasion.length > 0 ||
      preferences.cookingEquipment.length > 0 ||
      preferences.cookingTime.length > 0 ||
      preferences.skillLevel.length > 0 ||
      preferences.nutrition.length > 0 ||
      preferences.cuisine.length > 0 ||
      preferences.spiceLevel.length > 0 ||
      preferences.meat.length > 0 ||
      preferences.vegetables.length > 0 ||
      preferences.servings !== null
    );
  }, [preferences]);

  return (
    <>
      {isMobile ? (
        <div className="flex flex-col h-screen min-h-0">
          <MobileTopBar
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            rightIcon={<ArrowLeftFromLine className="h-5 w-5" />}
            onRightIconClick={() => setIsChatSidebarOpen(true)}
          />

          <NavigationSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            user={user}
            onAuthClick={onAuthClick || (() => {})}
            onSignOut={onSignOut || (async () => {})}
          />

          <ChatSidebar
            isOpen={isChatSidebarOpen}
            onClose={() => setIsChatSidebarOpen(false)}
            chats={chats}
            onNewChat={handleNewChat}
            handleDropdownAction={handleDropdownAction}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            renamingId={renamingId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            cancelRename={cancelRename}
            saveRename={saveRename}
            confirmDeleteId={confirmDeleteId}
            confirmDelete={confirmDelete}
            cancelDelete={cancelDelete}
            preferences={preferences}
            onPreferenceChange={(category, value, action) =>
              handlePreferenceChange(
                category as ArrayKeys | NumberKeys,
                value,
                action as "add" | "remove" | "set" | "clear",
              )
            }
            clearAllPreferences={clearAllPreferences}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            {isLoadingChat && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-4">
                <div className="rounded-full h-6 w-6 border-2 border-gray-300 border-t-transparent animate-spin" />
              </div>
            )}
            <ChatInterface
              preferences={preferences}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onPreferenceChange={(category, value, action) =>
                handlePreferenceChange(
                  category as ArrayKeys | NumberKeys,
                  value,
                  action as "add" | "remove" | "set" | "clear",
                )
              }
              messages={messages}
              remainingCharacters={remainingCharacters}
              isOverLimit={isOverLimit}
              maxCharacters={MAX_CHARACTERS}
              hasSelectedPreferences={hasSelectedPreferences}
              handleSubmit={handleSubmit}
              isGenerating={isGenerating}
              clearAllPreferences={clearAllPreferences}
              inputRef={inputRef}
              user={user}
              onAuthClick={onAuthClick}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          <div className="hidden md:block">
            <PreferencesSidebar
              preferences={preferences}
              onPreferenceChange={(category, value, action) =>
                handlePreferenceChange(
                  category as ArrayKeys | NumberKeys,
                  value,
                  action as "add" | "remove" | "set" | "clear",
                )
              }
              clearAllPreferences={clearAllPreferences}
            />
          </div>

          <div className="relative flex-1 flex flex-col overflow-hidden">
            {isLoadingChat && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-4">
                <div className="rounded-full h-6 w-6 border-2 border-gray-300 border-t-transparent animate-spin" />
              </div>
            )}
            <ChatInterface
              preferences={preferences}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onPreferenceChange={(category, value, action) =>
                handlePreferenceChange(
                  category as ArrayKeys | NumberKeys,
                  value,
                  action as "add" | "remove" | "set" | "clear",
                )
              }
              messages={messages}
              remainingCharacters={remainingCharacters}
              isOverLimit={isOverLimit}
              maxCharacters={MAX_CHARACTERS}
              hasSelectedPreferences={hasSelectedPreferences}
              handleSubmit={handleSubmit}
              isGenerating={isGenerating}
              clearAllPreferences={clearAllPreferences}
              inputRef={inputRef}
              user={user}
              onAuthClick={onAuthClick}
            />
          </div>

          <div className="hidden md:block">
            <ChatHistorySidebar
              chats={chats}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onNewChat={handleNewChat}
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
          </div>
        </div>
      )}
    </>
  );
}

export default ChatPage;
