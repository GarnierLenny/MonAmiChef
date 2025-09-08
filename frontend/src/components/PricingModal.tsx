import { useState } from "react";
import { X, Check, Loader2, Crown, Sparkles } from "lucide-react";
import { products, type Product } from "../stripe-config";
import { supabase } from "../lib/supabase";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

export default function PricingModal({
  isOpen,
  onClose,
  isAuthenticated,
  onAuthRequired,
}: PricingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (product: Product) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    setIsLoading(true);
    setLoadingProductId(product.id);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        onAuthRequired();
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            price_id: product.priceId,
            mode: product.mode,
            success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/pricing`,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Failed to start checkout process");
    } finally {
      setIsLoading(false);
      setLoadingProductId(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 mt-1">
                Unlock premium features and take your cooking to the next level
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Free Plan
                </h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">€0</div>
                <p className="text-gray-600">Forever free</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Basic recipe generation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">5 recipes per day</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Basic nutritional info</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Simple cooking timers</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            {/* Premium Plans */}
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-xl p-6 border-2 border-orange-300 relative"
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Crown className="w-4 h-4" />
                    <span>Premium</span>
                  </div>
                </div>

                <div className="text-center mb-6 mt-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  <p className="text-gray-600">per {product.interval}</p>
                </div>

                <p className="text-gray-700 mb-6 text-center">
                  {product.description}
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">
                      Unlimited recipe generation
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">
                      Advanced AI recipe suggestions
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">
                      Detailed nutritional analysis
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">Weekly meal planning</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">Smart grocery lists</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">
                      Recipe collections & favorites
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700">
                      Priority customer support
                    </span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-700 font-medium">
                      Early access to new features
                    </span>
                  </li>
                </ul>

                <button
                  onClick={() => handleSubscribe(product)}
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading && loadingProductId === product.id ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Subscribe Now</span>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              All plans include a 7-day free trial. Cancel anytime. No hidden
              fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
