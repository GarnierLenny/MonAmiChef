import { Button } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GuestMealPlanningCTAProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export function GuestMealPlanningCTA({ onSignUp, onSignIn }: GuestMealPlanningCTAProps) {
  const { t } = useTranslation();

  return (
    <div className="flex mobile-viewport w-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 text-center">
        {/* Icon */}
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Smart Meal Planning
        </h1>

        {/* Description */}
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          {t('preferences.guestPlanningCta')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onSignUp}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full shadow-lg"
          >
            Sign Up Free
          </Button>
          <Button
            onClick={onSignIn}
            variant="outline"
            size="lg"
            className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 w-full"
          >
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-4">
          No credit card required
        </p>
      </div>
    </div>
  );
}