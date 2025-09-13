import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  History,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home,
  ChefHat,
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
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/2db14320-f76b-4b9d-978c-1761722e2695.png"
                alt="Chef Logo"
                className="h-8 w-auto"
              />
              <span className="text-foreground font-semibold text-lg tracking-wide">
                Mon Ami Chef
              </span>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-accent/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4">
            <nav className="space-y-1 px-4">
              <Button
                variant={isActivePath("/") ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => handleNavigation("/")}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>

              {user && (
                <>
                  <Button
                    variant={
                      isActivePath("/recipes/saved") ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavigation("/recipes/saved")}
                  >
                    <Heart className="h-4 w-4" />
                    Saved Recipes
                  </Button>

                  <Button
                    variant={
                      isActivePath("/recipes/history") ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavigation("/recipes/history")}
                  >
                    <History className="h-4 w-4" />
                    Recipe History
                  </Button>

                  <Button
                    variant={isActivePath("/profile") ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavigation("/profile")}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </>
              )}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            {user ? (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="h-4 w-4" />
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="default"
                  className="w-full justify-start gap-3"
                  onClick={handleAuthClick}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={handleAuthClick}
                >
                  <UserPlus className="h-4 w-4" />
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

