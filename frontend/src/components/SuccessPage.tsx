import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight, Sparkles, Crown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-full inline-block">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Welcome to the premium experience! Your subscription is now active.
          </p>

          {/* Session ID (for debugging) */}
          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-500 mb-1">Session ID:</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {sessionId}
              </p>
            </div>
          )}

          {/* Premium Features Highlight */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-6 mb-8 border border-orange-200">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Crown className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">
                You now have access to:
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">
                  Unlimited recipe generation
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">
                  Advanced nutritional analysis
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">Weekly meal planning</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">Smart grocery lists</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">Recipe collections</span>
              </div>
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Start Cooking</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Manage Subscription
            </button>
          </div>

          {/* Auto-redirect Notice */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              You'll be automatically redirected to the app in{" "}
              <span className="font-bold">{countdown}</span> seconds
            </p>
          </div>

          {/* Thank You Message */}
          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Thank you for choosing Mon Ami Chef! We're excited to help you
              create amazing meals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
