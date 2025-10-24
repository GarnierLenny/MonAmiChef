import { useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  User,
  LogOut,
  ChefHat,
  CalendarDays,
  Calculator,
  Timer,
  BarChart3,
  Settings,
  ShoppingCart,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  PanelRight,
} from "lucide-react";
import { User as UserType, ChatItem } from "../types/types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "../utils/format_timestamp.utils";

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onAuthClick: () => void;
  onSignOut: () => Promise<void>;
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
}

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  requiresAuth?: boolean;
}

export function NavigationSidebar({
  isOpen,
  onClose,
  user,
  onAuthClick,
  onSignOut,
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
}: NavigationSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentChatId = searchParams.get("c");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await onSignOut();
      onClose();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleAuthClick = () => {
    onAuthClick();
    onClose();
  };

  const isActivePath = (path: string) => location.pathname === path;

  const mainNavItems: NavItem[] = [
    {
      path: "/meal-plan-chat",
      icon: CalendarDays,
      label: t("navigation.mealPlan"),
    },
    {
      path: "/grocery-list",
      icon: ShoppingCart,
      label: t("navigation.groceryList"),
    },
  ];

  const toolsNavItems: NavItem[] = [
    { path: "/timer", icon: Timer, label: t("navigation.cookingTimer") },
    {
      path: "/calories",
      icon: Calculator,
      label: t("navigation.calorieCalculator"),
    },
  ];

  const userNavItems: NavItem[] = [
    {
      path: "/recipes/saved",
      icon: Heart,
      label: t("navigation.recipes"),
      requiresAuth: true,
    },
  ];

  const renderNavButton = (item: NavItem) => {
    const isActive = isActivePath(item.path);
    const Icon = item.icon;

    return (
      <motion.div
        key={item.path}
        className="mb-1"
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="ghost"
          className={`
            relative w-full justify-start gap-3 h-11 text-left font-medium rounded-xl
            transition-all duration-300 overflow-hidden group
            ${
              isActive
                ? "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 shadow-md hover:shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent"
            }
          `}
          onClick={() => handleNavigation(item.path)}
        >
          {/* Active indicator bar with glow */}
          {isActive && (
            <>
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-500 rounded-r shadow-lg shadow-orange-500/50"
                initial={false}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 to-transparent" />
            </>
          )}

          <Icon
            className={`h-5 w-5 transition-all duration-300 ${
              isActive
                ? "text-orange-600 drop-shadow"
                : "text-gray-600 group-hover:text-orange-600 group-hover:scale-110"
            }`}
          />

          <span className="relative z-10 text-sm">{item.label}</span>

          {/* Hover shimmer effect */}
          {!isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
        </Button>
      </motion.div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className="w-72 p-0 bg-orange-50 border-r border-orange-200/50 flex flex-col h-full"
      >
        {/* Orange to Pink Gradient Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 shadow-md relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <img
                src="/favicon.png"
                alt="Chef Logo"
                className="h-6 w-auto drop-shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextEl = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextEl) nextEl.style.display = "block";
                }}
              />
              <ChefHat className="h-6 w-6 text-white hidden drop-shadow-lg" />
            </div>
            <span className="font-bold text-white text-lg drop-shadow-md">
              Mon Ami Chef
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 hover:scale-110 relative z-10"
          >
            <PanelRight className="h-5 w-5 drop-shadow" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 pt-4 pb-6 overflow-y-auto">
          <nav className="space-y-2 px-3">
            {/* New Chat Button */}
            <div className="mb-4">
              <button
                onClick={() => {
                  onNewChat();
                  handleNavigation("/chat");
                }}
                className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-sm font-semibold relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Plus className="h-5 w-5 relative z-10 drop-shadow" />
                <span className="relative z-10">New Chat</span>
              </button>
            </div>

            {/* Main navigation items */}
            <div className="space-y-1">
              {mainNavItems.map((item) => renderNavButton(item))}
              {/* User-specific items */}
              {user && userNavItems.map((item) => renderNavButton(item))}
            </div>

            {/* Tools Section */}
            <div className="mt-6">
              <h3 className="px-3 mb-3 text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-orange-500" />
                Tools
              </h3>
              <div className="space-y-1 mb-6">
                {toolsNavItems.map((item) => renderNavButton(item))}
              </div>
            </div>

            {/* Chat History Section */}
            <div className="mt-6">
              <h3 className="px-3 mb-3 text-xs font-bold text-orange-600 uppercase tracking-wider flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-orange-500" />
                Chats
              </h3>

              {/* Chat List */}
              <div className="space-y-1">
                {chats.length === 0 ? (
                  <div className="text-center py-6 px-3">
                    <p className="text-sm text-gray-500">No chat history yet</p>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const params = new URLSearchParams(searchParams);
                    params.set("c", chat.id);
                    const isActive = currentChatId === chat.id;

                    return (
                      <div key={chat.id} className="group relative">
                        <Link
                          to={{
                            pathname: "/chat",
                            search: `?${params.toString()}`,
                          }}
                          onClick={onClose}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-orange-100 text-orange-700"
                              : "hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent text-gray-700 hover:scale-[1.02]"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium truncate text-sm">
                              {chat.title || "Untitled"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatTimestamp(new Date(chat.timestamp))}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === chat.id ? null : chat.id,
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-gray-200 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </Link>

                        {/* Dropdown menu */}
                        {activeDropdown === chat.id && (
                          <div className="absolute right-2 top-12 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDropdownAction("rename", chat.id);
                                setRenamingId(chat.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 text-sm"
                            >
                              <Edit3 className="h-4 w-4" />
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDropdownAction("delete", chat.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </nav>

          {/* Rename modal */}
          {renamingId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={cancelRename}
              />
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-full max-w-sm mx-4">
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
                  placeholder="Enter a new title"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelRename}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveRename}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-sm"
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
              <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-full max-w-sm mx-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Delete chat?
                </h3>
                <p className="text-sm text-gray-600">
                  This action will permanently remove the conversation. This
                  cannot be undone.
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelDelete}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Backdrop for dropdown */}
          {activeDropdown && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setActiveDropdown(null)}
            />
          )}
        </div>

        {/* Vibrant Profile Banner */}
        <div className="border-t border-orange-200/50 bg-gradient-to-r from-orange-50/50 to-transparent">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-orange-100/50 hover:to-transparent transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/30 ring-2 ring-white">
                    {user.name?.[0]?.toUpperCase() ||
                      user.email[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                      {user.name || user.email.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-40"
                    >
                      <button
                        onClick={(e) => {
                          console.log("Settings button clicked!");
                          e.stopPropagation();
                          setIsProfileDropdownOpen(false);
                          handleNavigation("/settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Settings className="h-4 w-4" />
                        {t("navigation.settings")}
                      </button>
                      <div className="border-t border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors text-sm"
                      >
                        <LogOut
                          className={`h-4 w-4 ${isSigningOut ? "animate-spin" : ""}`}
                        />
                        {isSigningOut
                          ? t("auth.signingOut")
                          : t("navigation.logout")}
                      </button>
                    </motion.div>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <button
                onClick={handleAuthClick}
                className="w-full h-10 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative z-10">Sign in</span>
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default NavigationSidebar;
