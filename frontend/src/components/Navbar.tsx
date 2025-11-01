import {
  ChefHat,
  Calculator,
  Timer,
  CalendarDays,
  Bookmark,
  User,
  Crown,
  LogIn,
  LogOut,
  Plus,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  handleSignOut: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  user: { email: string; name: string } | null;
  subscriptionPlan: string;
  onAuthClick: () => void;
  onPricingClick: () => void;
  onToggleChatHistory?: () => void;
  onTogglePreferences?: () => void;
  onNewChat?: () => void;
}

export default function Navbar({
  handleSignOut,
  currentView,
  onViewChange,
  user,
  subscriptionPlan,
  onAuthClick,
  onPricingClick,
  onNewChat,
}: NavbarProps) {

  const navItems = [
    {
      id: "generator",
      label: "Recipe Generator",
      icon: ChefHat,
      color: "text-orange-600",
    },
    {
      id: "meal-plan-chat",
      label: "Meal Plan",
      icon: CalendarDays,
      color: "text-green-600",
    },
    {
      id: "calories",
      label: "Calorie Calculator",
      icon: Calculator,
      color: "text-green-600",
    },
    {
      id: "timer",
      label: "Cooking Timer",
      icon: Timer,
      color: "text-orange-600",
    },
    {
      id: "recipes/saved",
      label: "My Recipes",
      icon: Bookmark,
      color: "text-green-600",
    },
    /*{
      id: "explore",
      label: "Explore",
      icon: Compass,
      color: "text-orange-600",
    },*/
  ];

  return (
    <nav className="bg-white overflow-visible shadow-lg relative z-50 py-2">
      <div className="overflow-visible max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mon ami chef</h1>
              <p className="text-xs text-gray-600">
                AI-Powered Recipe Generator
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const hasDropdown = item.dropdown && item.dropdown.length > 0;

              if (hasDropdown) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`space-x-2 ${
                          isActive
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            : "text-gray-700 hover:text-orange-700 hover:bg-orange-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="hidden md:inline font-medium">
                          {item.label}
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {item.dropdown?.map((dropdownItem) => {
                        const DropdownIcon = dropdownItem.icon;
                        return (
                          <DropdownMenuItem
                            key={dropdownItem.id}
                            onClick={() => onViewChange(dropdownItem.id)}
                            className="cursor-pointer"
                          >
                            <DropdownIcon className="w-5 h-5 text-orange-500 mr-3" />
                            <span className="font-medium">
                              {dropdownItem.label}
                            </span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => onViewChange(item.id)}
                  className={`space-x-2 ${
                    isActive
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      : "text-gray-700 hover:text-orange-700 hover:bg-orange-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline font-medium">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* New Chat Button */}
          {onNewChat && (
            <Button
              onClick={onNewChat}
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden lg:inline font-medium">New Chat</span>
              <Sparkles className="w-4 h-4 hidden lg:inline ml-2" />
            </Button>
          )}

          {/* User Profile / Auth */}
          <div className="ml-4 flex items-center space-x-3">
            {user ? (
              <>
                {/* Subscription Badge - Clickable */}
                <Badge
                  onClick={onPricingClick}
                  className="hidden sm:flex items-center space-x-2 bg-orange-100 hover:bg-orange-200 text-orange-700 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">{subscriptionPlan}</span>
                </Badge>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="space-x-2">
                      <User className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onViewChange("profile")}
                      className="cursor-pointer"
                    >
                      <User className="w-5 h-5 text-gray-500 mr-3" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onPricingClick}
                      className="cursor-pointer"
                    >
                      <Crown className="w-5 h-5 text-orange-500 mr-3" />
                      <span>Upgrade Plan</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-500 focus:text-red-500"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={onAuthClick}
                className="bg-orange-500 hover:bg-orange-600 text-white space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
