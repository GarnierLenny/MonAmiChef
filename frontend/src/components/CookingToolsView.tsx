import { useState, useEffect, useRef } from "react";
import {
  Timer as TimerIcon,
  Bell,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Clock,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TimerState {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  createdAt: number;
}

interface CookingToolsViewProps {
  currentSubView: string;
}

const PRESET_TIMERS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
];

export default function CookingToolsView({
  currentSubView,
}: CookingToolsViewProps) {
  const [timers, setTimers] = useState<TimerState[]>([]);
  const [isAddingTimer, setIsAddingTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState<number>(10);
  const [newTimerSeconds, setNewTimerSeconds] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastAddedTimerIdRef = useRef<string | null>(null);

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              playNotificationSound();
              // Show browser notification if permitted
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Timer Complete!", {
                  body: `${timer.name} has finished!`,
                  icon: "/favicon.ico",
                  badge: "/favicon.ico",
                });
              }
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

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Auto-scroll to newly added timer
  useEffect(() => {
    if (lastAddedTimerIdRef.current) {
      const timerId = lastAddedTimerIdRef.current;

      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        const timerElement = timerRefsMap.current.get(timerId);
        if (timerElement) {
          timerElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
          });
        }
      });

      // Clear the ref after scrolling
      lastAddedTimerIdRef.current = null;
    }
  }, [timers]);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 1,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      // Play second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = "sine";
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 1);
      }, 200);
    } catch (error) {
      console.log("Audio notification not available:", error);
    }
  };

  const addTimer = (seconds?: number) => {
    const totalSeconds = seconds || newTimerMinutes * 60 + newTimerSeconds;
    if (totalSeconds === 0) return;

    const timerName = newTimerName.trim() || `Timer ${timers.length + 1}`;
    const newTimerId = Date.now().toString();
    const newTimer: TimerState = {
      id: newTimerId,
      name: timerName,
      duration: totalSeconds,
      remaining: totalSeconds,
      isRunning: false,
      createdAt: Date.now(),
    };

    setTimers((prev) => [...prev, newTimer]);
    lastAddedTimerIdRef.current = newTimerId;
    setNewTimerName("");
    setNewTimerMinutes(10);
    setNewTimerSeconds(0);
    setIsAddingTimer(false);
  };

  const addPresetTimer = (seconds: number, label: string) => {
    const newTimerId = Date.now().toString();
    const newTimer: TimerState = {
      id: newTimerId,
      name: label,
      duration: seconds,
      remaining: seconds,
      isRunning: false,
      createdAt: Date.now(),
    };

    setTimers((prev) => [...prev, newTimer]);
    lastAddedTimerIdRef.current = newTimerId;
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

  const deleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = (timer: TimerState) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100;
  };

  const renderCookingTimer = () => (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 via-orange-50 to-amber-50">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="w-full p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto">
          {timers.length === 0 && !isAddingTimer ? (
            // Empty state - Beautiful and inviting
            <div className="flex flex-col h-screen items-center justify-center pb-32 text-center px-4">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <TimerIcon className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-10 h-10 text-amber-400 fill-current animate-bounce" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-3">
                No Active Timers
              </h2>
              <p className="text-neutral-600 mb-8 max-w-md text-sm sm:text-base leading-relaxed">
                Create a timer to keep track of your cooking. Never burn or overcook your food again!
              </p>

              {/* Quick Preset Buttons */}
              <div className="mb-6">
                <p className="text-sm font-medium text-neutral-700 mb-4">Quick Start:</p>
                <div className="flex flex-wrap gap-3 justify-center max-w-md">
                  {PRESET_TIMERS.slice(0, 4).map((preset) => (
                    <Button
                      key={preset.seconds}
                      onClick={() => addPresetTimer(preset.seconds, preset.label)}
                      className="bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-200 hover:border-orange-400 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setIsAddingTimer(true)}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Custom Timer
              </Button>
            </div>
          ) : (
            <div className="space-y-8 lg:space-y-10">
              {/* Header with Timer Count */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-md border border-orange-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2 flex items-center gap-3">
                      <TimerIcon className="w-7 h-7 text-orange-500" />
                      Cooking Timers
                    </h1>
                    <p className="text-neutral-500 text-sm sm:text-base">
                      {timers.length} active timer{timers.length !== 1 ? "s" : ""}
                      {timers.filter((t) => t.isRunning).length > 0 &&
                        ` · ${timers.filter((t) => t.isRunning).length} running`}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddingTimer(!isAddingTimer)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Timer
                  </Button>
                </div>
              </div>

              {/* Quick Preset Timers Section */}
              {!isAddingTimer && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-orange-100">
                  <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    Quick Timers
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_TIMERS.map((preset) => (
                      <Button
                        key={preset.seconds}
                        onClick={() => addPresetTimer(preset.seconds, preset.label)}
                        variant="outline"
                        className="h-16 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 text-orange-600 font-semibold transition-all duration-200"
                      >
                        <div className="text-center">
                          <Clock className="w-5 h-5 mx-auto mb-1" />
                          <span>{preset.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Timer Form */}
              {isAddingTimer && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-orange-300 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                      <Plus className="w-6 h-6 text-orange-500" />
                      Create Custom Timer
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingTimer(false)}
                      className="text-neutral-500 hover:text-neutral-700"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Timer Name */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Timer Name
                      </label>
                      <Input
                        type="text"
                        value={newTimerName}
                        onChange={(e) => setNewTimerName(e.target.value)}
                        placeholder="e.g., Pasta, Roast Chicken, Rice..."
                        className="w-full h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>

                    {/* Time Input */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-3">
                        Duration
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Minutes */}
                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">Minutes</label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={() => setNewTimerMinutes(Math.max(0, newTimerMinutes - 1))}
                              variant="outline"
                              className="h-12 w-12 p-0 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                            >
                              <span className="text-xl font-bold text-orange-600">−</span>
                            </Button>
                            <Input
                              type="number"
                              value={newTimerMinutes}
                              onChange={(e) =>
                                setNewTimerMinutes(
                                  Math.max(0, Math.min(180, Number(e.target.value) || 0)),
                                )
                              }
                              min="0"
                              max="180"
                              className="flex-1 h-12 text-center text-2xl font-bold border-2 border-gray-300 focus:border-orange-500"
                            />
                            <Button
                              type="button"
                              onClick={() => setNewTimerMinutes(Math.min(180, newTimerMinutes + 1))}
                              variant="outline"
                              className="h-12 w-12 p-0 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                            >
                              <span className="text-xl font-bold text-orange-600">+</span>
                            </Button>
                          </div>
                        </div>

                        {/* Seconds */}
                        <div>
                          <label className="block text-xs text-neutral-500 mb-2">Seconds</label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              onClick={() => setNewTimerSeconds(Math.max(0, newTimerSeconds - 1))}
                              variant="outline"
                              className="h-12 w-12 p-0 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                            >
                              <span className="text-xl font-bold text-orange-600">−</span>
                            </Button>
                            <Input
                              type="number"
                              value={newTimerSeconds}
                              onChange={(e) =>
                                setNewTimerSeconds(
                                  Math.max(0, Math.min(59, Number(e.target.value) || 0)),
                                )
                              }
                              min="0"
                              max="59"
                              className="flex-1 h-12 text-center text-2xl font-bold border-2 border-gray-300 focus:border-orange-500"
                            />
                            <Button
                              type="button"
                              onClick={() => setNewTimerSeconds(Math.min(59, newTimerSeconds + 1))}
                              variant="outline"
                              className="h-12 w-12 p-0 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                            >
                              <span className="text-xl font-bold text-orange-600">+</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => addTimer()}
                        disabled={newTimerMinutes === 0 && newTimerSeconds === 0}
                        className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Create Timer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingTimer(false)}
                        className="h-14 px-6 border-2 border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Timers Grid */}
              {timers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {timers.map((timer) => {
                    const progress = getProgress(timer);
                    const isFinished = timer.remaining === 0;
                    const isWarning = !isFinished && timer.remaining <= 60 && timer.isRunning;

                    return (
                      <div
                        key={timer.id}
                        ref={(el) => {
                          if (el) {
                            timerRefsMap.current.set(timer.id, el);
                          } else {
                            timerRefsMap.current.delete(timer.id);
                          }
                        }}
                        className={`bg-white rounded-2xl border-2 overflow-hidden shadow-md transition-all duration-300 ${
                          isFinished
                            ? "border-red-400 shadow-lg shadow-red-100 animate-pulse"
                            : isWarning
                              ? "border-amber-400 shadow-lg shadow-amber-100"
                              : "border-gray-200 hover:border-orange-200 hover:shadow-lg"
                        }`}
                      >
                        {/* Header */}
                        <div
                          className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <TimerIcon className="w-5 h-5 text-white" />
                            <h3 className="text-lg font-bold text-white">{timer.name}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTimer(timer.id)}
                            className="text-white hover:bg-white/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Timer Display */}
                        <div className="p-8 sm:p-10">
                          {/* Circular Progress */}
                          <div className="relative w-48 h-48 mx-auto mb-6">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                className="text-gray-200"
                              />
                              {/* Progress Circle */}
                              <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                                className={`transition-all duration-1000 ${
                                  isFinished
                                    ? "text-red-500"
                                    : isWarning
                                      ? "text-amber-500"
                                      : "text-orange-500"
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>

                            {/* Time Display in Center */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div
                                className={`text-4xl sm:text-5xl font-bold transition-colors ${
                                  isFinished
                                    ? "text-red-600"
                                    : isWarning
                                      ? "text-amber-600"
                                      : "text-neutral-800"
                                }`}
                              >
                                {formatTime(timer.remaining)}
                              </div>
                              {isFinished && (
                                <div className="text-red-600 font-bold text-sm mt-2 animate-pulse">
                                  FINISHED!
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Control Buttons */}
                          <div className="flex gap-3 justify-center">
                            <Button
                              onClick={() => toggleTimer(timer.id)}
                              disabled={isFinished}
                              className={`h-14 px-8 text-white font-semibold shadow-lg transition-all duration-200 ${
                                timer.isRunning
                                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              }`}
                            >
                              {timer.isRunning ? (
                                <>
                                  <Pause className="w-5 h-5 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="w-5 h-5 mr-2" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => resetTimer(timer.id)}
                              variant="outline"
                              className="h-14 px-8 border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-neutral-700 font-semibold"
                            >
                              <RotateCcw className="w-5 h-5 mr-2" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
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
                    <TimerIcon className="w-5 h-5 mr-2 text-orange-500" />
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
                    <TimerIcon className="w-4 h-4 text-red-600" />
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
