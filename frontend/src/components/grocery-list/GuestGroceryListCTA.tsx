import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Sparkles, Smartphone } from "lucide-react";

interface GuestGroceryListCTAProps {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export function GuestGroceryListCTA({ onSignUp, onSignIn }: GuestGroceryListCTAProps) {
  return (
    <div className="flex mobile-viewport w-screen bg-gradient-to-br from-orange-50 via-orange-25 to-pink-50 items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          {/* Icon */}
          <div className="relative mb-6 inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-md">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Smart Grocery Lists Await
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Transform your meal plans into organized shopping lists. Sign in to access your grocery list,
            track ingredients, and never forget an item at the store.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Auto-Generated</h3>
              <p className="text-sm text-gray-600">Ingredients automatically added from your meal plans</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Check Off Items</h3>
              <p className="text-sm text-gray-600">Track your shopping progress as you go</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Shop Anywhere</h3>
              <p className="text-sm text-gray-600">Access your list on any device, anytime</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onSignUp}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Sign Up Free
            </Button>
            <Button
              onClick={onSignIn}
              variant="outline"
              size="lg"
              className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-3 text-lg font-semibold transition-all duration-200"
            >
              Sign In
            </Button>
          </div>

          {/* Additional Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <Sparkles className="w-4 h-4 inline-block mr-1 text-orange-500" />
              Start your free account today • No credit card required • Sync across all devices
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
