import { useState, useEffect } from "react";
import {
  Timer,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Calendar,
} from "lucide-react";

interface CookingToolsViewProps {
  currentSubView: string;
}

export default function CookingToolsView({
  currentSubView,
}: CookingToolsViewProps) {
  const [timers, setTimers] = useState<
    Array<{
      id: string;
      name: string;
      duration: number;
      remaining: number;
      isRunning: boolean;
    }>
  >([]);

  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerDuration, setNewTimerDuration] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              // Timer finished - could trigger notification here
              return { ...timer, remaining: 0, isRunning: false };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTimer = () => {
    if (newTimerName.trim()) {
      const newTimer = {
        id: Date.now().toString(),
        name: newTimerName,
        duration: newTimerDuration * 60,
        remaining: newTimerDuration * 60,
        isRunning: false,
      };
      setTimers((prev) => [...prev, newTimer]);
      setNewTimerName("");
      setNewTimerDuration(10);
    }
  };

  const toggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer,
      ),
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, remaining: timer.duration, isRunning: false }
          : timer,
      ),
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderCookingTimer = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl">
            <Timer className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Cooking Timers</h2>
            <p className="text-gray-600">
              Keep track of multiple cooking processes
            </p>
          </div>
        </div>

        {/* Add New Timer */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-xl mb-8 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Add New Timer
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              placeholder="Timer name (e.g., Pasta, Chicken)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={newTimerDuration}
                onChange={(e) => setNewTimerDuration(Number(e.target.value))}
                min="1"
                max="180"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-gray-600">minutes</span>
            </div>
            <button
              onClick={addTimer}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Timer</span>
            </button>
          </div>
        </div>

        {/* Active Timers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200"
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {timer.name}
              </h4>
              <div className="text-4xl font-bold text-center mb-4">
                <span
                  className={
                    timer.remaining === 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {formatTime(timer.remaining)}
                </span>
              </div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => toggleTimer(timer.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    timer.isRunning
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {timer.isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => resetTimer(timer.id)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {timers.length === 0 && (
          <div className="text-center py-12">
            <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Timers
            </h3>
            <p className="text-gray-600">Add a timer above to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Push Notifications
            </h2>
            <p className="text-gray-600">Smart cooking alerts and reminders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Settings */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-xl border border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Notification Preferences
              </h3>
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Timer className="w-5 h-5 mr-2 text-orange-500" />
                    Timer Alerts
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                        defaultChecked
                      />
                      <span className="text-gray-700">
                        Timer completion alerts
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                        defaultChecked
                      />
                      <span className="text-gray-700">
                        5-minute warning before completion
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                      />
                      <span className="text-gray-700">Sound alerts</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-green-500" />
                    Cooking Reminders
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                        defaultChecked
                      />
                      <span className="text-gray-700">
                        Step-by-step cooking reminders
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                      />
                      <span className="text-gray-700">
                        Ingredient prep notifications
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                      />
                      <span className="text-gray-700">
                        Temperature check reminders
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Meal Planning
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                      />
                      <span className="text-gray-700">
                        Daily meal planning reminders
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                      />
                      <span className="text-gray-700">
                        Weekly grocery list reminders
                      </span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-orange-600 rounded"
                      />
                      <span className="text-gray-700">
                        Meal prep day notifications
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification History & Settings */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Recent Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Timer className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      Pasta Timer Completed
                    </p>
                    <p className="text-sm text-gray-600">
                      Your 12-minute pasta timer has finished
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Bell className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      Cooking Step Reminder
                    </p>
                    <p className="text-sm text-gray-600">
                      Time to flip the chicken breast
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      Meal Prep Reminder
                    </p>
                    <p className="text-sm text-gray-600">
                      Sunday meal prep session in 1 hour
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Smart Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Auto-pause timers
                    </p>
                    <p className="text-sm text-gray-600">
                      Pause timers when you leave the app
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Vibration alerts
                    </p>
                    <p className="text-sm text-gray-600">
                      Feel notifications on mobile devices
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentSubView) {
    case "timer":
      return renderCookingTimer();
    case "notifications":
      return renderNotifications();
    default:
      return renderCookingTimer();
  }
}
