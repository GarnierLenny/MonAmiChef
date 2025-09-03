import { useState, useEffect, useMemo, useRef } from "react";
import type { Preferences, ChatItem, ChatMessage } from "../types/types";
import PreferencesSidebar from "../components/PreferenceSidebar";
import ChatInterface from "../components/ChatInterface";
import ChatHistorySidebar from "../components/ChatHistorySidebar";
import MobileTopBar from "../components/MobileTopBar";
import MobileSidebar from "../components/MobileSidebar";
import { useIsMobile } from "../hooks/use-mobile";
import Cookies from "universal-cookie";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8888";

const MAX_CHARACTERS = 150;

const cookies = new Cookies(null, { path: "/" });

const initialAIText = (max: number): string =>
  `Hi! I'm your AI cooking assistant. Tell me what ingredients you have (max ${max} characters) and I'll create a personalized recipe for you based on your preferences!`;

const buildAiGreeting = (): ChatMessage => ({
  id: "initial",
  role: "assistant",
  content: initialAIText(MAX_CHARACTERS),
  timestamp: new Date(),
});

function ChatPage() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([buildAiGreeting()]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
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
    cooks: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // History sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const isMobile = useIsMobile();

  const chatId = searchParams.get("c");
  const userId = cookies.get("userId");

  // Derived values
  const remainingCharacters = useMemo(
    () => MAX_CHARACTERS - inputValue.length,
    [inputValue],
  );
  const isOverLimit = remainingCharacters < 0; // kept even though maxLength prevents it

  // History chats actions
  const handleDropdownAction = async (
    action: "rename" | "delete" | "share",
    dropdownChatId: string,
  ) => {
    setActiveDropdown(null);
    if (action === "rename") {
      setRenamingId(dropdownChatId);
    } else if (action === "delete") {
      setConfirmDeleteId(dropdownChatId);
    } else if (action === "share") {
      // Handle share action - placeholder
      console.log("Share action for chat:", dropdownChatId);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmDelete = async () => {
    setConfirmDeleteId(null);
    if (confirmDeleteId === chatId) {
      handleNewChat();
    }
    await fetch(`${API_URL}/chat/user/${userId}/${confirmDeleteId}/delete`, {
      method: "DELETE",
    });
  };

  const cancelRename = () => {
    setRenamingId(null);
  };

  const saveRename = async () => {
    await fetch(
      `${API_URL}/chat/user/${userId}/${renamingId}/rename`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newTitle: renameValue }),
      },
    );
    setRenamingId(null);
  };

  // Load history chats
  useEffect(() => {
    (async () => {
      const userId = cookies.get("userId");

      if (userId) {
        const query = await fetch(
          `${import.meta.env.VITE_API_URL}/chat/user/${userId}`,
          {
            method: "GET",
          },
        );
        const result = await query.json();
        const tmpChats: ChatItem[] = [];

        result.forEach((chat: any) => {
          tmpChats.push({
            title: chat.title,
            id: chat.id,
            timestamp: chat.createdAt,
          });
        });

        setChats(tmpChats);
      }
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
    if (!userId || !chatId) {
      setMessages([buildAiGreeting()]);
      clearAllPreferences();
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        const query = await fetch(`${API_URL}/chat/user/${userId}/${chatId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
        });

        if (!query.ok) {
          throw new Error(`HTTP ${query.status}`);
        }

        const result = await query.json();
        console.log("loaded messages", result);
        setMessages(result.messages.messages);
      } catch (err) {
        if (err && typeof err === 'object' && 'name' in err && err.name !== "AbortError") {
          console.error("Failed to load chat: ", err);
          setMessages([buildAiGreeting()]);
        }
      }
    })();

    return () => ac.abort();
  }, [chatId, userId]);

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

  const handleSubmit = () => {
    const text = inputValue.trim();
    handleSubmitMessage(text);
  };

  const handleSubmitMessage = async (text: string) => {

    setInputValue("");

    // optimistic user bubble
    setMessages((m) => [
      ...m,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);
    setIsGenerating(true);

    const uid = cookies.get("userId") ?? null;

    const payload = {
      userMessage: text,
      preferences: preferences,
      userId: uid,
      conversationId: chatId,
    };

    try {
      const res = await fetch(`${API_URL}/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("Server 4xx/5xx:", res.status, errText);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json?.userId) cookies.set("userId", json.userId, { path: "/" });

      console.log("Success", json);
      setMessages((m) => [
        ...m,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: json.reply ?? "",
          timestamp: new Date(),
        },
      ]);
      clearAllPreferences();
      navigate(`?c=${encodeURIComponent(json.conversationId)}`);
    } catch (err) {
      console.error("Message sending failed:", err);
      setMessages((m) => [
        ...m,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Oops, something went wrong.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("c");
    setSearchParams(params, { replace: false });

    setMessages([buildAiGreeting()]);
    setInputValue("");
    return;
  };

  // Check if user has selected any preferences
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
    <div className="flex flex-col h-full">
      {/* Mobile Top Bar */}
      {isMobile && (
        <MobileTopBar onMenuClick={() => setIsMobileSidebarOpen(true)} />
      )}
      
      {/* Mobile Sidebar */}
      {isMobile && (
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
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
          onPreferenceChange={(category: string, value: string | number, action: "add" | "remove" | "set") => 
            handlePreferenceChange(category as ArrayKeys | NumberKeys, value, action as "add" | "remove" | "set" | "clear")
          }
          clearAllPreferences={clearAllPreferences}
        />
      )}

      <div className="flex flex-1">
        <div className="hidden md:block">
          <PreferencesSidebar
            preferences={preferences}
            onPreferenceChange={(category: string, value: string | number, action: "add" | "remove" | "set") => 
              handlePreferenceChange(category as ArrayKeys | NumberKeys, value, action as "add" | "remove" | "set" | "clear")
            }
            clearAllPreferences={clearAllPreferences}
          />
        </div>
        <ChatInterface
          preferences={preferences}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onPreferenceChange={(category: string, value: string | number, action: "add" | "remove" | "set") => 
            handlePreferenceChange(category as ArrayKeys | NumberKeys, value, action as "add" | "remove" | "set" | "clear")
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
        />
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
    </div>
  );
}

export default ChatPage;
