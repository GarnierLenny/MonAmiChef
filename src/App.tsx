import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import RecipeDisplay from "./components/RecipeDisplay";
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
import { supabase } from "./lib/supabase";
import { getProductByPriceId } from "./stripe-config";
import ChatPage from "./pages/ChatPage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRecipePage = location.pathname.startsWith("/recipe/");

  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check initial auth state
    checkAuthState();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser({
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "",
        });
        await fetchUserSubscription();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserSubscription(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthState = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "",
        });
        await fetchUserSubscription();
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("stripe_user_subscriptions")
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        return;
      }

      setUserSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleViewChange = (view: string) => {
    navigate(`/${view === "generator" ? "" : view}`);
  };

  const handleAuthenticate = (userData: User) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    fetchUserSubscription();
  };

  const handleSignOut = () => {
    setUser(null);
    setUserSubscription(null);
  };

  // Get current view from URL
  const getCurrentView = () => {
    const path = location.pathname.slice(1); // Remove leading slash
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50">
      {!isRecipePage && (
        <div className="hidden md:block sticky top-0 z-50">
          <Navbar
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
          <Route path="/" element={<ChatPage />} />
          <Route
            path="/macros"
            element={<NutritionView currentSubView="macros" />}
          />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route
            path="/calories"
            element={<NutritionView currentSubView="calories" />}
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
          <Route
            path="/profile"
            element={<UserProfile user={user} onSignOut={handleSignOut} />}
          />
          <Route
            path="/pricing"
            element={
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg"
                >
                  View Pricing
                </button>
              </div>
            }
          />
        </Routes>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticate={handleAuthenticate}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        isAuthenticated={!!user}
        onAuthRequired={() => {
          setIsPricingModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
