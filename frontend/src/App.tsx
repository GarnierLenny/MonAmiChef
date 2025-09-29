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
import Dashboard from "./components/Dashboard";
import ExploreView from "./components/ExploreView";
import ComingSoonView from "./components/ComingSoonView";
import AuthModal from "./components/AuthModal";
import PricingModal from "./components/PricingModal";
import SuccessPage from "./components/SuccessPage";
import RecipePage from "./components/RecipePage";
import UserProfile from "./components/UserProfile";
import ChatPage from "./pages/ChatPage";
import MealPlanPage from "./pages/MealPlanPage";
import AuthCallback from "./components/AuthCallback";
import SavedRecipes from "./pages/SavedRecipes";
import NotFoundPage from "./pages/NotFoundPage";
import CanonicalUrl from "./components/CanonicalUrl";
import RedirectHandler from "./components/RedirectHandler";
import SEOHead from "./components/SEOHead";
import Breadcrumb from "./components/Breadcrumb";
import OrganizationStructuredData from "./components/OrganizationStructuredData";
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
  const isMealPlanPage = location.pathname === "/meal-plan-chat";

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
      <div className="flex items-center justify-center mobile-viewport bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
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
      <CanonicalUrl />
      <RedirectHandler />
      <OrganizationStructuredData />
      <div className="flex flex-col mobile-viewport overflow-hidden bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
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
        className={`flex ${isRecipePage ? "mobile-viewport" : "flex-1"} ${isChatPage || isMealPlanPage ? "overflow-hidden" : "overflow-y-auto"}`}
      >
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <ComponentErrorBoundary componentName="ChatPage">
                <SEOHead
                  title="Mon Ami Chef - AI Recipe Generator & Cooking Assistant"
                  description="Get personalized AI-generated recipes based on your ingredients, dietary preferences, and cooking style. Chat with your AI cooking assistant for instant meal ideas and cooking tips."
                  keywords="AI recipe generator, cooking assistant, personalized recipes, meal ideas, ingredient-based recipes, AI cooking chat"
                />
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
            element={
              <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
                <SEOHead
                  title="Recipe Macros & Nutrition Analysis - Mon Ami Chef"
                  description="Analyze the nutritional content and macros of your saved recipes. Track protein, carbs, fat, and calories for better meal planning and health goals."
                  keywords="recipe macros, nutrition analysis, calorie tracking, protein carbs fat, recipe nutrition, meal planning macros"
                />
                <div className="px-4 pt-4">
                  <Breadcrumb />
                </div>
                <NutritionView currentSubView="macros" recipe={null} />
              </div>
            }
          />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route
            path="/calories"
            element={
              <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
                <SEOHead
                  title="Calorie Calculator & BMI Tool - Mon Ami Chef"
                  description="Calculate your daily calorie needs, BMI, and macronutrient requirements. Get personalized nutrition recommendations for your health and fitness goals."
                  keywords="calorie calculator, BMI calculator, daily calories, nutrition calculator, macro calculator, weight management"
                />
                <div className="px-4 pt-4">
                  <Breadcrumb />
                </div>
                <NutritionView currentSubView="calories" recipe={null} />
              </div>
            }
          />
          <Route
            path="/timer"
            element={
              <>
                <SEOHead
                  title="Cooking Timer & Kitchen Tools - Mon Ami Chef"
                  description="Set multiple cooking timers for your recipes. Never overcook or burn your food again with our smart kitchen timer tools."
                  keywords="cooking timer, kitchen timer, recipe timer, cooking tools, kitchen assistant, food timer"
                />
                <CookingToolsView currentSubView="timer" />
              </>
            }
          />
          <Route
            path="/notifications"
            element={
              <>
                <SEOHead
                  title="Cooking Notifications & Alerts - Mon Ami Chef"
                  description="Set up smart cooking notifications and alerts. Get reminders for cooking steps, timer alerts, and meal planning notifications."
                  keywords="cooking notifications, cooking alerts, timer notifications, cooking reminders, kitchen notifications"
                />
                <CookingToolsView currentSubView="notifications" />
              </>
            }
          />
          <Route
            path="/dashboard"
            element={
              <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
                <SEOHead
                  title="Cooking Dashboard - Mon Ami Chef"
                  description="View your cooking stats, saved recipes, and meal planning progress. Track your culinary journey with detailed insights and analytics."
                  keywords="cooking dashboard, recipe stats, meal planning dashboard, cooking progress, recipe analytics"
                />
                <div className="px-4 pt-4">
                  <Breadcrumb />
                </div>
                <Dashboard currentSubView="overview" user={user} session={session} />
              </div>
            }
          />
          <Route
            path="/meal-plan-chat"
            element={
              <ComponentErrorBoundary componentName="MealPlanPage">
                <SEOHead
                  title="AI Meal Planning Chat - Mon Ami Chef"
                  description="Chat with our AI to create personalized weekly meal plans. Get instant meal suggestions, grocery lists, and dietary customizations."
                  keywords="AI meal planning, weekly meal planner, meal plan generator, grocery list generator, diet meal planning, automatic meal planning"
                />
                <MealPlanPage
                  onSignUp={() => setIsAuthModalOpen(true)}
                  onSignIn={() => setIsAuthModalOpen(true)}
                />
              </ComponentErrorBoundary>
            }
          />
          <Route
            path="/explore"
            element={
              <>
                <SEOHead
                  title="Explore Recipes & Discover New Meals - Mon Ami Chef"
                  description="Discover new recipe ideas and explore different cuisines. Browse trending recipes and find inspiration for your next meal."
                  keywords="explore recipes, discover meals, recipe ideas, cooking inspiration, recipe discovery, meal inspiration"
                />
                <ExploreView />
              </>
            }
          />
          <Route path="/coming-soon" element={<ComingSoonView />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/recipes/saved"
            element={
              <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
                <SEOHead
                  title="Saved Recipes Collection - Mon Ami Chef"
                  description="Access your personal collection of saved recipes. View, organize, and manage all your favorite AI-generated recipes in one place."
                  keywords="saved recipes, recipe collection, favorite recipes, my recipes, recipe library, personal recipes"
                />
                <div className="px-4 pt-4">
                  <Breadcrumb />
                </div>
                <SavedRecipes />
              </div>
            }
          />

          {/* Private */}
          <Route
            path="/profile"
            element={
              <RequireAuth session={session}>
                <UserProfile user={user} onSignOut={handleSignOut} />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
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
