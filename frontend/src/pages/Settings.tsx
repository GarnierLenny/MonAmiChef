import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Languages, User, Bell, Crown, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription, getSubscriptionDisplayName, isSubscriptionActive } from "@/hooks/useSubscription";
import type { Session } from "@supabase/supabase-js";

interface SettingsProps {
  onPricingClick?: () => void;
}

const Settings = ({ onPricingClick }: SettingsProps) => {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const subscription = useSubscription(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Get browser's preferred language for display
  const getBrowserLanguage = () => {
    const browserLang = navigator.language || "en";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("en")) return "en";
    return "en";
  };

  const browserLang = getBrowserLanguage();
  const isUsingBrowserDefault = i18n.language === browserLang;

  return (
    <div className="min-h-screen w-screen overflow-y-hidden bg-orange-50 pt-4">
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Settings Cards */}
          <div className="grid gap-6">
            {/* Subscription Settings */}
            {session && (
              <Card className="bg-white/80 backdrop-blur-sm border border-orange-300 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-chef-brown">
                        Subscription
                      </CardTitle>
                      <CardDescription>
                        Manage your subscription and billing
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {subscription.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                  ) : subscription.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                      <p className="text-sm">{subscription.error}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-200">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                          <p className="text-xl font-bold text-gray-900">
                            {getSubscriptionDisplayName(subscription.status)}
                          </p>
                          {isSubscriptionActive(subscription.status) && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                              {subscription.cancelAtPeriodEnd && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Cancels on {formatDate(subscription.currentPeriodEnd)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {isSubscriptionActive(subscription.status) && (
                          <Crown className="w-12 h-12 text-orange-500" />
                        )}
                      </div>

                      {isSubscriptionActive(subscription.status) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Next Billing Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatDate(subscription.currentPeriodEnd)}
                            </p>
                          </div>
                          {subscription.paymentMethodBrand && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {subscription.paymentMethodBrand.toUpperCase()} ****{" "}
                                {subscription.paymentMethodLast4}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        {!isSubscriptionActive(subscription.status) ? (
                          <button
                            onClick={onPricingClick}
                            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Crown className="w-4 h-4" />
                            Upgrade to Premium
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              // TODO: Replace with your actual Stripe Customer Portal URL
                              // Get it from: https://dashboard.stripe.com/settings/billing/portal
                              const portalUrl = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL_URL ||
                                               "https://billing.stripe.com/p/login/test_your_portal_link";
                              window.open(portalUrl, "_blank");
                            }}
                            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            Manage Subscription
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Language Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border border-chef-orange/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-chef-orange to-chef-yellow rounded-full flex items-center justify-center">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-chef-brown">
                      {t("navigation.language")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.languageDescription")}
                      {isUsingBrowserDefault && (
                        <span className="block text-green-600 text-sm mt-1">
                          ✓ {t("settings.usingBrowserLanguage")} (
                          {navigator.language})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="max-w-xs">
                  <Select
                    value={i18n.language}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("navigation.language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          🇺🇸 <span>{t("languages.en")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                          🇫🇷 <span>{t("languages.fr")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Account Settings - Placeholder for future */}
            <Card className="bg-white/80 backdrop-blur-sm border border-chef-green/20 shadow-lg opacity-60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-chef-green to-chef-yellow rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-chef-brown">
                      {t("settings.accountSettings")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.accountDescription")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Notifications - Placeholder for future */}
            <Card className="bg-white/80 backdrop-blur-sm border border-chef-brown/20 shadow-lg opacity-60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-chef-brown">
                      {t("settings.notifications")}
                    </CardTitle>
                    <CardDescription>
                      {t("settings.notificationsDescription")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
