// src/App.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

import Navbar from "./components/Navbar";
import MobileTopBar from "./components/MobileTopBar";
import NavigationSidebar from "./components/NavigationSidebar";
import NutritionView from "./components/NutritionView";
import CookingToolsView from "./components/CookingToolsView";
import MealPlanningView from "./components/MealPlanningView";
import ExploreView from "./components/ExploreView";
import ComingSoonView from "./components/ComingSoonView";
import AuthModal from "./components/AuthModal";
import PricingModal from "./components/PricingModal";
import SuccessPage from "./components/SuccessPage";
import RecipePage from "./components/RecipePage";
import UserProfile from "./components/UserProfile";
import ChatPage from "./pages/ChatPage";
import AuthCallback from "./components/AuthCallback";
import SavedRecipes from "./pages/SavedRecipes";
import RecipeHistoryPage from "./pages/RecipeHistory";
import { Toaster } from "@/components/ui/toaster";
import { AppErrorBoundary, ComponentErrorBoundary } from "./components/ErrorBoundary";

import { supabase } from "./lib/supabase";
import { User } from "./types/types";

function RequireAuth({
  session,
  children,
}: {
  session: Session | null;
  children: JSX.Element;
}) {
  return session ? children : <Navigate to="/" replace />;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRecipePage = location.pathname.startsWith("/recipe/");
  const isChatPage = location.pathname === "/";

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 🔁 used to force-remount ChatPage (reset chats)
  const [chatResetKey, setChatResetKey] = useState(0);

  const clearConversationParam = useCallback(() => {
    const params = new URLSearchParams(location.search);
    if (params.has("c")) {
      params.delete("c");
      navigate({ pathname: "/", search: params.toString() }, { replace: true });
    }
  }, [location.search, navigate]);

  const resetChats = useCallback(() => {
    setChatResetKey((k) => k + 1); // remount ChatPage
  }, []);

  useEffect(() => {
    let unsubscribed = false;

    const applySession = async (
      s: import("@supabase/supabase-js").Session | null,
    ) => {
      if (unsubscribed) return;

      setSession(s);

      if (s?.user) {
        const u = s.user;
        setUser({
          id: u.id,
          email: u.email ?? "",
          name: (u.user_metadata as any)?.name ?? u.email?.split("@")[0] ?? "",
        });
      } else {
        setUser(null);
      }
    };

    (async () => {
      setIsLoadingAuth(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("getSession error:", error);
        await applySession(data?.session ?? null);
      } finally {
        if (!unsubscribed) setIsLoadingAuth(false);
      }
    })();

    // ✅ Correct v2 signature + destructuring
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void applySession(session ?? null);
      if (event === "SIGNED_IN") {
        resetChats(); // or window.location.reload() if you prefer a hard refresh
      }
    });

    return () => {
      unsubscribed = true;
      subscription.unsubscribe(); // ✅ correct unsubscribe
    };

    // keep deps stable or wrap resetChats in useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewChange = (view: string) => {
    navigate(`/${view === "generator" ? "" : view}`);
  };

  const handleAuthenticate = (u: User) => {
    clearConversationParam();
    setUser(u);
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    clearConversationParam();
    resetChats();
    setUser(null);
    await supabase.auth.signOut();
  };

  const getCurrentView = () => {
    const path = location.pathname.slice(1);
    return path || "generator";
  };

  const getSubscriptionPlanName = () => {
    return "Free Plan";
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Anonymous-first: we do NOT block the app if not logged in.
  return (
    <AppErrorBoundary>
      <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      {!isRecipePage && !isChatPage && (
        <MobileTopBar onMenuClick={() => setIsMobileSidebarOpen(true)} />
      )}
      
      {!isRecipePage && (
        <div className="hidden md:block sticky top-0 z-50">
          <Navbar
            handleSignOut={handleSignOut}
            currentView={getCurrentView()}
            onViewChange={handleViewChange}
            user={user}
            subscriptionPlan={getSubscriptionPlanName()}
            onAuthClick={() => setIsAuthModalOpen(true)}
            onPricingClick={() => setIsPricingModalOpen(true)}
          />
        </div>
      )}

      <div
        className={`flex ${isRecipePage ? "h-screen" : "flex-1"} overflow-y-auto`}
      >
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <ComponentErrorBoundary componentName="ChatPage">
                <ChatPage
                  key={chatResetKey}
                  user={user}
                  onAuthClick={() => setIsAuthModalOpen(true)}
                  onSignOut={handleSignOut}
                />
              </ComponentErrorBoundary>
            }
          />
          <Route
            path="/macros"
            element={<NutritionView currentSubView="macros" recipe={null} />}
          />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route
            path="/calories"
            element={<NutritionView currentSubView="calories" recipe={null} />}
          />
          <Route
            path="/timer"
            element={<CookingToolsView currentSubView="timer" />}
          />
          <Route
            path="/notifications"
            element={<CookingToolsView currentSubView="notifications" />}
          />
          <Route
            path="/weekly-planner"
            element={<MealPlanningView currentSubView="weekly-planner" />}
          />
          <Route
            path="/plan-week"
            element={<MealPlanningView currentSubView="plan-week" />}
          />
          <Route path="/explore" element={<ExploreView />} />
          <Route path="/coming-soon" element={<ComingSoonView />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/recipes/saved" element={<SavedRecipes />} />
          <Route path="/recipes/history" element={<RecipeHistoryPage />} />

          {/* Private */}
          <Route
            path="/profile"
            element={
              <RequireAuth session={session}>
                <UserProfile user={user} onSignOut={handleSignOut} />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <NavigationSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        user={user}
        onAuthClick={() => {
          setIsMobileSidebarOpen(false);
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticate}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        isAuthenticated={!!session}
        onAuthRequired={() => {
          setIsPricingModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
        <Toaster />
      </div>
    </AppErrorBoundary>
  );
}

export default App;
