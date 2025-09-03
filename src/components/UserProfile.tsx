import React, { useState, useEffect } from "react";
import {
  User,
  Crown,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-4 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-orange-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Subscription Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Crown className="w-6 h-6 mr-2 text-orange-500" />
              Subscription Status
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">
                  Loading subscription data...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">
                    Error loading subscription
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Plan */}
                <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Plan
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionStatusColor(
                          subscription?.subscription_status || "not_started",
                        )}`}
                      >
                        {getSubscriptionStatusText(
                          subscription?.subscription_status || "not_started",
                        )}
                      </div>
                    </div>

                    {subscription?.price_id && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Plan</p>
                        <p className="font-semibold text-gray-900">
                          {getProductByPriceId(subscription.price_id)?.name ||
                            "Premium Plan"}
                        </p>
                      </div>
                    )}

                    {subscription?.subscription_status === "not_started" && (
                      <div>
                        <p className="font-semibold text-gray-900">Free Plan</p>
                        <p className="text-sm text-gray-600">
                          Basic features included
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Billing Information
                  </h3>

                  <div className="space-y-4">
                    {subscription?.current_period_end && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Next billing date
                        </p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    )}

                    {subscription?.payment_method_brand &&
                      subscription?.payment_method_last4 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Payment method
                          </p>
                          <p className="font-semibold text-gray-900">
                            {subscription.payment_method_brand.toUpperCase()}{" "}
                            •••• {subscription.payment_method_last4}
                          </p>
                        </div>
                      )}

                    {subscription?.cancel_at_period_end && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm font-medium">
                          Your subscription will cancel at the end of the
                          current period
                        </p>
                      </div>
                    )}

                    {(!subscription ||
                      subscription.subscription_status === "not_started") && (
                      <div>
                        <p className="text-sm text-gray-600">
                          No active subscription
                        </p>
                        <button className="mt-2 text-orange-600 hover:text-orange-700 font-medium text-sm">
                          Upgrade to Premium
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-gray-500" />
              Account Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Manage Subscription
                  </p>
                  <p className="text-sm text-gray-600">
                    Update billing and plan details
                  </p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Account Settings</p>
                  <p className="text-sm text-gray-600">
                    Update profile and preferences
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
