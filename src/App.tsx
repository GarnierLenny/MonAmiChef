// src/App.tsx
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

import Navbar from "./components/Navbar";
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

import { supabase } from "./lib/supabase";
import { getProductByPriceId } from "./stripe-config";
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

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) console.error("getSession error:", error);

        const s = data?.session ?? null;
        setSession(s);

        if (s?.user) {
          setUser({
            id: s.user.id,
            email: s.user.email || "",
            name:
              (s.user.user_metadata as any)?.name ||
              s.user.email?.split("@")[0] ||
              "",
          });
          fetchUserSubscription(s.user.id);
        } else {
          setUser(null);
          setUserSubscription(null); // anonymous -> Free
        }
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession ?? null);

        if (newSession?.user) {
          setUser({
            id: newSession.user.id,
            email: newSession.user.email || "",
            name:
              (newSession.user.user_metadata as any)?.name ||
              newSession.user.email?.split("@")[0] ||
              "",
          });
          fetchUserSubscription(newSession.user.id);
        } else {
          setUser(null);
          setUserSubscription(null); // back to Free
        }
      },
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function fetchUserSubscription(userId: string) {
    try {
      // IMPORTANT: filter by current user id to avoid RLS issues & wrong rows
      const { data, error } = await supabase
        .from("stripe_user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Subscription fetch error:", error);
        setUserSubscription(null);
        return;
      }
      setUserSubscription(data ?? null); // null => free
    } catch (e) {
      console.error("Subscription fetch threw:", e);
      setUserSubscription(null);
    }
  }

  const handleViewChange = (view: string) => {
    navigate(`/${view === "generator" ? "" : view}`);
  };

  const handleAuthenticate = (u: User) => {
    setUser(u);
    setIsAuthModalOpen(false);
    void fetchUserSubscription();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserSubscription(null);
  };

  const getCurrentView = () => {
    const path = location.pathname.slice(1);
    return path || "generator";
  };

  const getSubscriptionPlanName = () => {
    if (
      !userSubscription ||
      userSubscription.subscription_status === "not_started"
    ) {
      return "Free Plan";
    }
    if (userSubscription.price_id) {
      const product = getProductByPriceId(userSubscription.price_id);
      return product?.name || "Premium Plan";
    }
    return "Premium Plan";
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
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      {!isRecipePage && (
        <div className="hidden md:block sticky top-0 z-50">
          <Navbar
            currentView={getCurrentView()}
            onViewChange={handleViewChange}
            user={user} // null if anonymous
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
          {/* Public routes (anonymous-friendly) */}
          <Route path="/" element={<ChatPage />} />
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

          {/* Private route(s) (gate only what must be authenticated) */}
          <Route
            path="/profile"
            element={
              <RequireAuth session={session}>
                <UserProfile user={user} onSignOut={handleSignOut} />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Your custom email/password modal (optional auth) */}
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
    </div>
  );
}

export default App;
