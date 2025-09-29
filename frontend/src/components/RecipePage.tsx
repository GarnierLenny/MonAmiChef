import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import RecipeStructuredData from "./RecipeStructuredData";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Check,
  Target,
  Zap,
  Heart,
  Flame,
  Sparkles,
  Star,
} from "lucide-react";

interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

interface TimerState {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as { state?: { recipe?: Recipe } };

  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timers, setTimers] = useState<TimerState[]>([]);
  const [newTimerName, setNewTimerName] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);

  // Prefer recipe from navigation state; otherwise read from localStorage
  const recipe = useMemo(() => {
    if (location.state?.recipe) return location.state.recipe;
    if (id) {
      try {
        const raw = localStorage.getItem(`recipe-${id}`);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return null;
  }, [id, location.state]);

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((timer) => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
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

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const addTimer = () => {
    if (newTimerName.trim()) {
      const newTimer: TimerState = {
        id: Date.now().toString(),
        name: newTimerName,
        duration: newTimerMinutes * 60,
        remaining: newTimerMinutes * 60,
        isRunning: false,
      };
      setTimers((prev) => [...prev, newTimer]);
      setNewTimerName("");
      setNewTimerMinutes(5);
    }
  };

  const toggleTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === timerId
          ? { ...timer, isRunning: !timer.isRunning }
          : timer,
      ),
    );
  };

  const resetTimer = (timerId: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === timerId
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

  const getNutritionPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const renderNutritionChart = (
    label: string,
    value: number,
    color: string,
    percentage: number,
    icon: React.ElementType,
    delay: number = 0,
  ) => {
    const Icon = icon;
    return (
      <div className="group mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div
              className={`p-1 rounded bg-gradient-to-r ${color.replace("text-", "from-").replace("-500", "-100")} ${color.replace("text-", "to-").replace("-500", "-200")}`}
            >
              <Icon className={`w-3 h-3 ${color}`} />
            </div>
            <span className="font-medium text-gray-800 text-sm">{label}</span>
          </div>
          <div className="text-right">
            <div className={`text-base font-bold ${color}`}>{value}g</div>
            <div className="text-xs text-gray-600">{percentage}%</div>
          </div>
        </div>

        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${color.replace("text-", "from-").replace("-500", "-400")} ${color.replace("text-", "to-").replace("-500", "-600")} transition-all duration-1000 ease-out shadow-sm`}
            style={{
              width: `${percentage}%`,
              animationDelay: `${delay}ms`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>
    );
  };

  if (!recipe) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Recipe Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The recipe you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Generator</span>
          </Link>
        </div>
      </div>
    );
  }

  const totalMacros =
    (recipe.nutrition?.protein || 0) +
    (recipe.nutrition?.carbs || 0) +
    (recipe.nutrition?.fat || 0);
  const proteinPercentage = getNutritionPercentage(
    recipe.nutrition?.protein || 0,
    totalMacros,
  );
  const carbsPercentage = getNutritionPercentage(
    recipe.nutrition?.carbs || 0,
    totalMacros,
  );
  const fatPercentage = getNutritionPercentage(
    recipe.nutrition?.fat || 0,
    totalMacros,
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Structured Data for SEO */}
      <RecipeStructuredData recipe={recipe} />

      {/* Floating Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 inline-flex items-center space-x-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group border border-white/50"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-medium">Back</span>
      </Link>

      {/* Breadcrumb */}
      <div className="absolute top-20 left-6 z-40 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <Breadcrumb
          customItems={[
            { name: 'Recipes', href: '/recipes/saved' },
            { name: recipe.title, href: `/recipe/${id}` }
          ]}
        />
      </div>

      {/* Enhanced Header with Progress */}
      <div className="pl-12 flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

        <div className="relative p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 ml-24">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
                  {recipe.title}
                </h1>
                <div className="flex items-center space-x-6 text-white/90">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      Prep: {recipe.prepTime}min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Timer className="w-4 h-4" />
                    <span className="font-medium">
                      Cook: {recipe.cookTime}min
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">
                      Serves: {recipe.servings}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="hidden lg:flex space-x-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full animate-bounce">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Cooking Progress Bar in Header */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-lg ml-24 mr-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-white/30 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white">Cooking Progress</span>
                  <div className="text-white/80 text-sm">
                    {completedSteps.size} of {recipe.instructions.length} steps
                    completed
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white drop-shadow-lg">
                  {Math.round(
                    (completedSteps.size / recipe.instructions.length) * 100,
                  )}
                  %
                </div>
              </div>
            </div>

            <div className="relative w-full h-4 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
                style={{
                  width: `${(completedSteps.size / recipe.instructions.length) * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
              </div>
            </div>

            {completedSteps.size === recipe.instructions.length && (
              <div className="mt-2 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full font-bold animate-bounce shadow-lg">
                  <Check className="w-5 h-5" />
                  <span>Recipe Complete! 🎉</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid - More Space for Ingredients */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Column - Ingredients & Nutrition (5 columns - EXPANDED) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col space-y-4 overflow-hidden">
          {/* Ingredients */}
          <div className="flex-[3] bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-white/50 overflow-hidden flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-3 rounded-xl shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
                <p className="text-emerald-600 font-medium text-sm">
                  {recipe.ingredients.length} items needed
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <div
                  key={index}
                  className="group flex items-start space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mt-2 flex-shrink-0 shadow-sm group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-gray-800 leading-relaxed font-medium group-hover:text-emerald-800 transition-colors duration-300">
                    {ingredient}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Charts */}
          {recipe.nutrition && (
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-white/50 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-gradient-to-r from-pink-400 to-rose-500 p-2 rounded-lg shadow-lg">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Nutrition
                  </h2>
                  <p className="text-pink-600 font-medium text-xs">
                    Per serving
                  </p>
                </div>
              </div>

              {/* Calories Spotlight */}
              <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-lg p-2 mb-2 border border-orange-200 shadow-inner">
                <div className="text-center">
                  <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    {recipe.nutrition.calories || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Calories
                  </div>
                </div>
              </div>

              {/* Macro Charts */}
              <div className="space-y-2">
                {renderNutritionChart(
                  "Protein",
                  recipe.nutrition.protein || 0,
                  "text-red-500",
                  proteinPercentage,
                  Flame,
                  200,
                )}
                {renderNutritionChart(
                  "Carbs",
                  recipe.nutrition.carbs || 0,
                  "text-green-500",
                  carbsPercentage,
                  Zap,
                  400,
                )}
                {renderNutritionChart(
                  "Fat",
                  recipe.nutrition.fat || 0,
                  "text-yellow-500",
                  fatPercentage,
                  Target,
                  600,
                )}
              </div>

              {/* Fiber */}
              <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800 text-sm">
                      Fiber
                    </span>
                  </div>
                  <span className="text-base font-bold text-blue-600">
                    {recipe.nutrition.fiber || 0}g
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Instructions (4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col overflow-hidden">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/50 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-xl shadow-lg">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Cooking Steps
                </h2>
                <p className="text-orange-600 font-medium text-sm">
                  Follow along and check off each step
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {recipe.instructions.map((instruction: string, index: number) => (
                <div
                  key={index}
                  className={`group flex items-start space-x-3 p-4 rounded-xl transition-all duration-500 border-2 hover:shadow-lg transform hover:-translate-y-1 ${
                    completedSteps.has(index)
                      ? "bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-300 shadow-md"
                      : "bg-gradient-to-r from-orange-50 via-pink-50 to-rose-50 border-orange-300 hover:from-orange-100 hover:via-pink-100 hover:to-rose-100"
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={completedSteps.has(index)}
                      onChange={() => toggleStep(index)}
                      className="w-6 h-6 text-green-600 rounded-lg focus:ring-green-500 focus:ring-2 transition-all duration-200 transform hover:scale-110"
                    />
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-lg ${
                        completedSteps.has(index)
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white scale-105"
                          : "bg-gradient-to-r from-orange-400 to-pink-500 text-white group-hover:scale-105"
                      }`}
                    >
                      {completedSteps.has(index) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <p
                    className={`leading-relaxed pt-2 transition-all duration-500 ${
                      completedSteps.has(index)
                        ? "text-green-700 line-through opacity-75"
                        : "text-gray-800 group-hover:text-gray-900"
                    }`}
                  >
                    {instruction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Timers (3 columns) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col overflow-hidden">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/50 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-3 rounded-xl shadow-lg">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Cooking Timers
                </h2>
                <p className="text-blue-600 font-medium text-sm">
                  Stay on track
                </p>
              </div>
            </div>

            {/* Add Timer Form */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl mb-4 border border-blue-200 flex-shrink-0">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="Timer name (e.g., Pasta, Sauce)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-sm"
                />
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={newTimerMinutes}
                    onChange={(e) => setNewTimerMinutes(Number(e.target.value))}
                    min="1"
                    max="180"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium text-sm"
                  />
                  <span className="text-gray-700 font-semibold">minutes</span>
                </div>
                <button
                  onClick={addTimer}
                  disabled={!newTimerName.trim()}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Timer</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex-1 overflow-y-auto space-y-3">
              {timers.length > 0 ? (
                timers.map((timer, index) => (
                  <div
                    key={timer.id}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                      timer.remaining === 0
                        ? "bg-gradient-to-br from-red-50 to-rose-100 border-red-300 animate-pulse"
                        : timer.isRunning
                          ? "bg-gradient-to-br from-green-50 to-emerald-100 border-green-300"
                          : "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h4 className="font-bold text-gray-900 mb-2 text-center text-sm">
                      {timer.name}
                    </h4>

                    <div className="text-center mb-3">
                      <div
                        className={`text-2xl font-bold transition-all duration-300 ${
                          timer.remaining === 0
                            ? "text-red-600 animate-pulse"
                            : timer.isRunning
                              ? "text-green-600"
                              : "text-gray-600"
                        }`}
                      >
                        {formatTime(timer.remaining)}
                      </div>
                      {timer.remaining === 0 && (
                        <div className="text-xs font-bold text-red-600 animate-bounce mt-1 flex items-center justify-center space-x-1">
                          <span>🔔</span>
                          <span>Time's up!</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => toggleTimer(timer.id)}
                        className={`p-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          timer.isRunning
                            ? "bg-gradient-to-r from-red-400 to-rose-500 text-white hover:from-red-500 hover:to-rose-600"
                            : "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600"
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
                        className="p-3 bg-gradient-to-r from-gray-400 to-slate-500 text-white rounded-xl hover:from-gray-500 hover:to-slate-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl text-center">
                  <Timer className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Add a timer above to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
