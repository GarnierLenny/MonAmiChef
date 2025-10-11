import { useState } from "react";
import {
  ChefHat,
  Calculator,
  Timer,
  CalendarDays,
  Compass,
  Bookmark,
  Zap,
  User,
  Crown,
  LogIn,
  LogOut,
  Heart,
  History,
  Settings2,
} from "lucide-react";

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
}

export default function Navbar({
  handleSignOut,
  currentView,
  onViewChange,
  user,
  subscriptionPlan,
  onAuthClick,
  onPricingClick,
}: NavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

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
    <nav className="bg-gradient-to-r overflow-visible from-orange-500 via-orange-600 to-pink-500 shadow-lg relative z-50 py-2">
      <div className="overflow-visible max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-white/25 backdrop-blur-sm p-2 rounded-xl border border-white/20">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mon ami chef</h1>
              <p className="text-xs text-orange-100">
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

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (hasDropdown) {
                        toggleDropdown(item.id);
                      } else {
                        onViewChange(item.id);
                        setActiveDropdown(null);
                      }
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 backdrop-blur-sm text-white shadow-lg"
                        : "text-orange-100 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden md:inline font-medium">
                      {item.label}
                    </span>
                    {hasDropdown && (
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {hasDropdown && activeDropdown === item.id && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      {item.dropdown?.map((dropdownItem) => {
                        const DropdownIcon = dropdownItem.icon;
                        return (
                          <button
                            key={dropdownItem.id}
                            onClick={() => {
                              onViewChange(dropdownItem.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <DropdownIcon className="w-5 h-5 text-orange-500" />
                            <span className="font-medium">
                              {dropdownItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Profile / Auth */}
          <div className="ml-8 flex items-center space-x-3">
            {user ? (
              <>
                {/* Subscription Badge - Clickable */}
                <button
                  onClick={onPricingClick}
                  className="hidden sm:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white">
                    {subscriptionPlan}
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown("user")}
                    className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm p-2 rounded-xl text-white hover:bg-white/30 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">
                      {user.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === "user" ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {activeDropdown === "user" && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          onViewChange("profile");
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          onPricingClick();
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Crown className="w-5 h-5 text-orange-500" />
                        <span>Upgrade Plan</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5 text-red-500" />
                        <span className="text-red-500">Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-white hover:bg-white/30 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for closing dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
}
