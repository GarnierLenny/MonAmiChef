import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  ChefHat,
  CalendarDays,
  Calculator,
  Timer,
  BarChart3,
} from "lucide-react";
import { User as UserType } from "../types/types";

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onAuthClick: () => void;
  onSignOut: () => Promise<void>;
}

export function NavigationSidebar({
  isOpen,
  onClose,
  user,
  onAuthClick,
  onSignOut,
}: NavigationSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await onSignOut();
      onClose();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleAuthClick = () => {
    onAuthClick();
    onClose();
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 bg-background border-r">
        <div className="flex flex-col h-full">
          {/* Orange Header */}
          <div className="bg-orange-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Try image first, fallback to icon */}
                <img
                  src="/favicon.png"
                  alt="Chef Logo"
                  className="h-6 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "block";
                  }}
                />
                <ChefHat
                  className="h-6 w-6 text-white"
                  style={{ display: "none" }}
                />
                <span className="font-semibold text-lg tracking-wide">
                  Mon Ami Chef
                </span>
              </div>
            </div>
            {/*{user && (
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.name}</p>
                    <p className="text-sm text-white/80">{user.email}</p>
                  </div>
                </div>
              </div>
            )}*/}
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6">
            <nav className="space-y-2 px-6">
              <Button
                variant="ghost"
                className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                  isActivePath("/")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => handleNavigation("/")}
              >
                <Home className="h-5 w-5" />
                Home
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                  isActivePath("/dashboard")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => handleNavigation("/dashboard")}
              >
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                  isActivePath("/meal-plan-chat")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => handleNavigation("/meal-plan-chat")}
              >
                <CalendarDays className="h-5 w-5" />
                Meal Planning
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                  isActivePath("/calories")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => handleNavigation("/calories")}
              >
                <Calculator className="h-5 w-5" />
                Calorie Calculator
              </Button>

              <Button
                variant="ghost"
                className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                  isActivePath("/timer")
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => handleNavigation("/timer")}
              >
                <Timer className="h-5 w-5" />
                Cooking Timer
              </Button>

              {user && (
                <>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                      isActivePath("/recipes/saved")
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => handleNavigation("/recipes/saved")}
                  >
                    <Heart className="h-5 w-5" />
                    Saved Recipes
                  </Button>

                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-4 h-12 text-left font-medium ${
                      isActivePath("/profile")
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => handleNavigation("/profile")}
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Button>
                </>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t p-6">
            {user ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-4 h-12 text-left font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="h-5 w-5" />
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="default"
                  className="w-full justify-start gap-4 h-12 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleAuthClick}
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 h-12 border-gray-300 text-gray-600 hover:bg-gray-50"
                  onClick={handleAuthClick}
                >
                  <UserPlus className="h-5 w-5" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default NavigationSidebar;
