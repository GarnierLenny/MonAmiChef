import { useState, useEffect } from "react";
import {
  User,
  Crown,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  ChefHat,
  Heart,
  Clock,
  Trophy,
  MapPin,
  Edit,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { getProductByPriceId } from "../stripe-config";

interface UserProfileProps {
  user: { email: string; name: string } | null;
  onSignOut: () => void;
}

interface Subscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export default function UserProfile({ user, onSignOut }: UserProfileProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("stripe_user_subscriptions")
        .select("*")
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSubscription(data);
    } catch (err: any) {
      console.error("Error fetching subscription:", err);
      setError(err.message || "Failed to load subscription data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "trialing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "past_due":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "canceled":
        return "bg-red-100 text-red-700 border-red-200";
      case "not_started":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "trialing":
        return "Trial Period";
      case "past_due":
        return "Past Due";
      case "canceled":
        return "Canceled";
      case "not_started":
        return "Free Plan";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Not Signed In
          </h3>
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
      <div className="relative">
        {/* Profile section */}
        <div className="px-6 pb-6 bg-orange-50 relative">
          <div className="flex justify-center mt-4 mb-4">
            <div className="bg-orange-500 p-4 rounded-full shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* User info */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user.name}
            </h1>
            {/*<p className="text-gray-600 text-sm mb-3">
              Passionate home chef exploring flavors from around the world 🌍
            </p>*/}

            {/* Location and badge */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 text-sm">Paris, France</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                Pro Chef
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recipes Cooked */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Recipes Cooked</div>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Favorites</div>
            </div>

            {/* Cooking Hours */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Cooking Hours</div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Achievements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
