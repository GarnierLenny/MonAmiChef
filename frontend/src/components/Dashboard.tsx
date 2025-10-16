import { useState, useEffect } from "react";
import { Scale, Activity, TrendingDown, Zap, Target, Plus } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { healthApi, type DashboardData } from "@/lib/api/healthApi";
import { User } from "@/types/types";
import type { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  currentSubView: string;
  user: User | null;
  session: Session | null;
}

export default function Dashboard({ session }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [bodyFatInput, setBodyFatInput] = useState("");
  const { toast } = useToast();
  // Load dashboard data
  useEffect(() => {
    if (session) {
      loadDashboardData();
    }
  }, [session]);

  // Update input fields when dashboard data changes
  useEffect(() => {
    if (dashboardData?.currentStats) {
      setWeightInput(dashboardData.currentStats.weight?.toString() || "");
      setBodyFatInput(dashboardData.currentStats.bodyFat?.toString() || "");
    }
  }, [dashboardData]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await healthApi.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weightInput && !bodyFatInput) {
      toast({
        title: "Error",
        description: "Please enter at least weight or body fat percentage.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const logData: { weight?: number; body_fat?: number } = {};

      if (weightInput) {
        const weight = parseFloat(weightInput);
        if (isNaN(weight) || weight <= 0) {
          throw new Error("Please enter a valid weight.");
        }
        logData.weight = weight;
      }

      if (bodyFatInput) {
        const bodyFat = parseFloat(bodyFatInput);
        if (isNaN(bodyFat) || bodyFat < 0 || bodyFat > 100) {
          throw new Error("Please enter a valid body fat percentage (0-100).");
        }
        logData.body_fat = bodyFat;
      }

      await healthApi.logMetric(logData);

      toast({
        title: "Success",
        description: "Entry logged successfully",
      });

      // Reload dashboard data to show updated values
      await loadDashboardData();
    } catch (err) {
      console.error("Error logging entry:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to log entry. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Early return for non-authenticated users
  if (!session) {
    return (
      <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="max-w-md text-center">
            {/* Icon */}
            <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6">
              <Activity className="w-10 h-10 text-orange-600" />
            </div>

            {/* Heading */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Track Your Health Journey
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Monitor your weight, body composition, and nutrition goals. Get
              personalized insights based on your meal plans and track your
              progress over time.
            </p>

            {/* Features List */}
            <div className="text-left mb-8 space-y-3">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Track weight and body fat percentage
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Set and monitor health goals
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Auto-calculate nutrition from meal plans
                </span>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // This would trigger the auth modal
                  window.location.href = "/?auth=signup";
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Create Free Account
              </button>
              <button
                onClick={() => {
                  // This would trigger the auth modal for sign in
                  window.location.href = "/?auth=signin";
                }}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors"
              >
                Sign In
              </button>
            </div>

            {/* Small text */}
            <p className="text-sm text-gray-500 mt-4">
              Start your personalized nutrition journey today
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-viewport bg-orange-50 w-screen overflow-y-auto">
        <div className="p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const weightData = {
    current: dashboardData?.currentStats.weight || 0,
    change: dashboardData?.currentStats.weightChange || 0,
    unit: "kg",
  };

  const bodyFatData = {
    current: dashboardData?.currentStats.bodyFat || 0,
    change: dashboardData?.currentStats.bodyFatChange || 0,
    unit: "%",
  };

  const caloriesData = dashboardData?.chartData.caloriesWeek || [];
  const weightProgressData = dashboardData?.chartData.weightProgress || [];
  const bodyFatProgressData = dashboardData?.chartData.bodyFatProgress || [];

  // Helper function to get recent entries combining weight and body fat data
  const getRecentEntries = () => {
    const entriesMap = new Map<
      string,
      { date: string; weight?: number; bodyFat?: number }
    >();

    // Add weight entries
    weightProgressData.forEach((entry) => {
      entriesMap.set(entry.date, {
        date: entry.date,
        weight: entry.weight,
        bodyFat: entriesMap.get(entry.date)?.bodyFat,
      });
    });

    // Add body fat entries
    bodyFatProgressData.forEach((entry) => {
      const existing = entriesMap.get(entry.date);
      entriesMap.set(entry.date, {
        date: entry.date,
        weight: existing?.weight,
        bodyFat: entry.bodyFat,
      });
    });

    // Convert to array, sort by date (newest first), and take the most recent 5
    return Array.from(entriesMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  // Helper function to format date for display
  const formatEntryDate = (dateString: string, isToday: boolean) => {
    if (isToday) {
      const today = new Date().toISOString().split("T")[0];
      if (dateString === today) {
        return "Today";
      }
    }

    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    }

    // Format as "Mon 15" or "Feb 15" depending on how recent
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "#3b82f6",
    },
    weight: {
      label: "Weight (kg)",
      color: "#ea580c",
    },
    bodyFat: {
      label: "Body Fat (%)",
      color: "#16a34a",
    },
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-2 gap-4">
      {/* Weight Card */}
      <div className="bg-blue-50 rounded-xl p-4 shadow-sm/10">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full mb-3">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {weightData.current}kg
        </div>
        <div className="text-gray-600 text-sm mb-2">Current Weight</div>
        {/* <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="text-green-600 text-sm font-medium">
            {weightData.change}kg this month
          </span>
        </div> */}
      </div>

      {/* Body Fat Card */}
      <div className="bg-green-50 rounded-xl p-4 shadow-sm/10">
        <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full mb-3">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {bodyFatData.current}%
        </div>
        <div className="text-gray-600 text-sm mb-2">Body Fat</div>
        {/* <div className="flex items-center gap-1">
          <TrendingDown className="w-4 h-4 text-green-600" />
          <span className="text-green-600 text-sm font-medium">
            {bodyFatData.change}% this month
          </span>
        </div> */}
      </div>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="bg-white rounded-lg p-1 shadow-sm">
      <div className="grid grid-cols-3">
        {["Overview", "Tracking", "Goals"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      {/* This Week's Calories Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            This Week's Calories
          </h3>
        </div>

        <div className="w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={caloriesData}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 2500]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="calories"
                fill="var(--color-calories)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Weight Progress
          </h3>
        </div>

        <div className="w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart data={weightProgressData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[70, 77]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-weight)"
                strokeWidth={3}
                dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>

      {/* Body Fat Percentage Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Body Fat Percentage
          </h3>
        </div>

        <div className="w-full overflow-hidden">
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <LineChart data={bodyFatProgressData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[15, 20]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="var(--color-bodyFat)"
                strokeWidth={3}
                dot={{ fill: "var(--color-bodyFat)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-4">
      {/* Log Today's Metrics */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Log Today's Metrics
          </h3>
        </div>

        <form onSubmit={handleLogEntry}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1000"
                placeholder="72.8"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Fat (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="16.5"
                value={bodyFatInput}
                onChange={(e) => setBodyFatInput(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? "Logging Entry..." : "Log Entry"}
          </button>
        </form>
      </div>

      {/* Today's Macros */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Macros
          </h3>
        </div>

        {/* Protein */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">Protein</span>
            <span className="text-teal-600 font-bold">
              135g <span className="text-gray-500 font-normal">/ 150g</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: "90%" }}
            ></div>
          </div>
        </div>

        {/* Carbs */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">Carbs</span>
            <span className="text-teal-600 font-bold">
              180g <span className="text-gray-500 font-normal">/ 200g</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: "90%" }}
            ></div>
          </div>
        </div>

        {/* Fat */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">Fat</span>
            <span className="text-orange-600 font-bold">
              65g <span className="text-gray-500 font-normal">/ 80g</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: "81%" }}
            ></div>
          </div>
        </div>

        {/* Total Calories */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-900">Total Calories</span>
            <span className="font-bold text-gray-900">
              1,820 <span className="text-gray-500 font-normal">/ 2,000</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: "91%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Entries
        </h3>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : dashboardData?.chartData.weightProgress.length === 0 &&
          dashboardData?.chartData.bodyFatProgress.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No entries yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Start logging your metrics to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getRecentEntries().map((entry, index) => (
              <div
                key={entry.date}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {formatEntryDate(entry.date, index === 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.weight && `Weight: ${entry.weight}kg`}
                    {entry.weight && entry.bodyFat && " • "}
                    {entry.bodyFat && `Body Fat: ${entry.bodyFat}%`}
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Logged
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-4">
      {/* Daily Macro Goals */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Macro Goals
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              defaultValue="150"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              defaultValue="200"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fat (g)
            </label>
            <input
              type="number"
              defaultValue="80"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium mt-4">
          Update Goals
        </button>
      </div>

      {/* Goals Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Goals Summary</h3>
        </div>

        {/* Weight Loss Target */}
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-teal-700 mb-2">
            Weight Loss Target
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            Target: 70kg (2.8kg to go)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className="bg-teal-600 h-2 rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
          <p className="text-xs text-teal-600 font-medium">75% complete</p>
        </div>

        {/* Body Fat Target */}
        <div className="bg-orange-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-orange-700 mb-2">
            Body Fat Target
          </h4>
          <p className="text-sm text-gray-600 mb-2">Target: 15% (1.5% to go)</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: "65%" }}
            ></div>
          </div>
          <p className="text-xs text-orange-600 font-medium">65% complete</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">2120</div>
            <div className="text-xs text-gray-600">Daily Calories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">30</div>
            <div className="text-xs text-gray-600">Days Tracked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">85%</div>
            <div className="text-xs text-gray-600">Goal Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Tracking":
        return renderTracking();
      case "Goals":
        return renderGoals();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="mobile-viewport bg-background-dark-layer w-screen overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Stats Cards - Always Visible */}
        {renderStatsCards()}

        {/* Tab Navigation - Always Visible */}
        {renderTabNavigation()}

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
