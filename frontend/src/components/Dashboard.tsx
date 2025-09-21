import { useState } from "react";
import { Scale, Activity, TrendingDown, TrendingUp } from "lucide-react";

interface DashboardProps {
  currentSubView: string;
}

export default function Dashboard({ currentSubView }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  // Mock data - in real app this would come from API/database
  const weightData = {
    current: 72.8,
    change: -2.4,
    unit: "kg"
  };

  const bodyFatData = {
    current: 16.5,
    change: -2.0,
    unit: "%"
  };

  const renderOverview = () => (
    <div className="mobile-viewport bg-gray-50 w-screen overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Weight Card */}
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full mb-3">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {weightData.current}kg
            </div>
            <div className="text-gray-600 text-sm mb-2">Current Weight</div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-green-600 text-sm font-medium">
                {weightData.change}kg this month
              </span>
            </div>
          </div>

          {/* Body Fat Card */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full mb-3">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {bodyFatData.current}%
            </div>
            <div className="text-gray-600 text-sm mb-2">Body Fat</div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-green-600 text-sm font-medium">
                {bodyFatData.change}% this month
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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

        {/* Weight Progress Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Weight Progress</h3>
          </div>

          {/* Chart Container */}
          <div className="relative h-48 bg-orange-50 rounded-lg p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600">
              <span>76.2</span>
              <span>73.8</span>
              <span>71.8</span>
            </div>

            {/* Chart area with gradient */}
            <div className="ml-8 h-full relative">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-200/50 to-orange-50 rounded"></div>

              {/* Trend line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 0,20 Q 25,25 50,40 T 100,70"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-600 mt-2 ml-8">
              <span>Jan 8</span>
              <span>Jan 22</span>
              <span>Feb 5</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Body Fat Percentage Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Body Fat Percentage</h3>
          </div>

          {/* Chart Container */}
          <div className="relative h-48 bg-green-50 rounded-lg p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600">
              <span>19.5</span>
              <span>18.5</span>
              <span>17.5</span>
              <span>16.5</span>
              <span>15.5</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 h-full relative">
              {/* Trend line with dots */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Line */}
                <path
                  d="M 0,30 L 25,40 L 50,50 L 75,60 L 100,70"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Dots */}
                <circle cx="0" cy="30" r="3" fill="#16a34a" />
                <circle cx="25" cy="40" r="3" fill="#16a34a" />
                <circle cx="50" cy="50" r="3" fill="#16a34a" />
                <circle cx="75" cy="60" r="3" fill="#16a34a" />
                <circle cx="100" cy="70" r="3" fill="#16a34a" />
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-600 mt-2 ml-8">
              <span>Jan 8</span>
              <span>Jan 22</span>
              <span>Feb 5</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="mobile-viewport bg-gray-50 w-screen overflow-y-auto">
      <div className="p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tracking</h3>
          <p className="text-gray-600">Data entry forms will go here</p>
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="mobile-viewport bg-gray-50 w-screen overflow-y-auto">
      <div className="p-4">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals</h3>
          <p className="text-gray-600">Goal setting interface will go here</p>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case "Tracking":
      return renderTracking();
    case "Goals":
      return renderGoals();
    default:
      return renderOverview();
  }
}