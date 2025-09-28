import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Save, Sparkles } from "lucide-react";

interface GuestMealPlanningCTAProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export function GuestMealPlanningCTA({ onSignUp, onSignIn }: GuestMealPlanningCTAProps) {
  return (
    <div className="flex mobile-viewport w-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unlock Smart Meal Planning
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Create personalized weekly meal plans with AI-powered recipe suggestions.
            Sign up to save your plans, track nutrition, and get custom recommendations.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
              <p className="text-sm text-gray-600">Get personalized recipe suggestions based on your preferences</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Save className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Save & Sync</h3>
              <p className="text-sm text-gray-600">Access your meal plans across all devices</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Save Time</h3>
              <p className="text-sm text-gray-600">Plan entire weeks in minutes with smart automation</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onSignUp}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-semibold"
            >
              Sign Up Free
            </Button>
            <Button
              onClick={onSignIn}
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg font-semibold"
            >
              Sign In
            </Button>
          </div>

          {/* Additional Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              🚀 Start your free account today • ⚡ No credit card required • 🔒 Your data is secure
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}