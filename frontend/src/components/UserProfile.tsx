import { useState, useEffect } from "react";
import { User, ChefHat, Heart, Clock, Trophy, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  healthApi,
  type UserGoals,
  type DashboardData,
} from "../lib/api/healthApi";
import { UserGoalsSection } from "./profile/UserGoalsSection";
import { GoalsCTA } from "./profile/GoalsCTA";
import { TodayProgress } from "./profile/TodayProgress";

interface UserProfileProps {
  user: { email: string; name: string } | null;
  onSignOut: () => void;
}

export default function UserProfile({ user }: UserProfileProps) {
  // Health goals state
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthData();
    }
  }, [user]);

  const fetchHealthData = async () => {
    try {
      setIsLoadingGoals(true);
      setIsLoadingDashboard(true);

      // Fetch user goals
      const goals = await healthApi.getGoals();
      setUserGoals(goals);

      // Fetch dashboard data if goals exist
      if (goals) {
        try {
          const dashboard = await healthApi.getDashboardData();
          setDashboardData(dashboard);
        } catch (dashboardError) {
          console.warn("Failed to load dashboard data:", dashboardError);
          // Don't set error, just proceed without dashboard data
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching health data:", err);
      // Don't show error for health data as it's optional
    } finally {
      setIsLoadingGoals(false);
      setIsLoadingDashboard(false);
    }
  };

  const handleSetGoals = () => {
    // Navigate to calorie calculator
    window.location.href = "/calories";
  };

  const handleEditGoals = () => {
    // Navigate to calorie calculator
    window.location.href = "/calories";
  };

  const handleViewMealPlan = () => {
    // Navigate to meal planning page
    window.location.href = "/meal-plan-chat";
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Not Signed In
          </h3>
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
      <div className="relative">
        {/* Profile section */}
        <div className="px-6 pb-6 bg-orange-50 relative">
          <div className="flex justify-center mt-4 mb-4">
            <div className="bg-orange-500 p-4 rounded-full shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* User info */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user.name}
            </h1>
            {/*<p className="text-gray-600 text-sm mb-3">
              Passionate home chef exploring flavors from around the world 🌍
            </p>*/}

            {/* Location and badge */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 text-sm">Paris, France</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                Pro Chef
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="mb-6">
            {userGoals ? (
              <UserGoalsSection
                goals={userGoals}
                isLoading={isLoadingGoals}
                onEditGoals={handleEditGoals}
              />
            ) : (
              <GoalsCTA onSetGoals={handleSetGoals} />
            )}
          </div>

          {/* Today's Progress */}
          {userGoals &&
            userGoals.daily_calories_goal &&
            userGoals.daily_calories_goal > 0 && (
              <div className="mb-6">
                <TodayProgress
                  goals={userGoals}
                  dashboardData={dashboardData}
                  isLoading={isLoadingDashboard}
                  onViewMealPlan={handleViewMealPlan}
                />
              </div>
            )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recipes Cooked */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Recipes Cooked</div>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Favorites</div>
            </div>

            {/* Cooking Hours */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Cooking Hours</div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
              <div className="text-gray-600 text-sm">Achievements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
