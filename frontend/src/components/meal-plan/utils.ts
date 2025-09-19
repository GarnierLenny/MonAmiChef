import type { MealPlan } from "./constants";
import { DAILY_GOALS } from "./constants";

// Helper function for grade badge styling
export const getGradeStyles = (grade: "A" | "B" | "C" | "D") => {
  switch (grade) {
    case "A":
      return "bg-emerald-500 text-white";
    case "B":
      return "bg-blue-500 text-white";
    case "C":
      return "bg-amber-500 text-white";
    case "D":
      return "bg-rose-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
};

// Helper function for macro badge styling
export const getMacroBadgeClass = (type: "protein" | "carbs" | "fat") => {
  switch (type) {
    case "protein":
      return "badge-protein";
    case "carbs":
      return "badge-carbs";
    case "fat":
      return "badge-fat";
    default:
      return "badge-protein";
  }
};

// Helper function for macro progress styling
export const getMacroProgressClass = (type: "protein" | "carbs" | "fat") => {
  switch (type) {
    case "protein":
      return "progress-protein";
    case "carbs":
      return "progress-carbs";
    case "fat":
      return "progress-fat";
    default:
      return "progress-protein";
  }
};

// Helper function for macro colors (for progress bars)
export const getMacroColor = (type: "protein" | "carbs" | "fat") => {
  switch (type) {
    case "protein":
      return "#22c55e"; // Green
    case "carbs":
      return "#6366f1"; // Purple-blue
    case "fat":
      return "#f97316"; // Favicon orange
    default:
      return "#64748b";
  }
};

// Helper function to calculate today's progress
export const calculateDayProgress = (mealPlan: MealPlan, day: string) => {
  const dayMeals = mealPlan[day] || {};
  const consumed = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  Object.values(dayMeals).forEach((meal) => {
    if (meal) {
      consumed.calories += meal.calories;
      consumed.protein += meal.macros.protein;
      consumed.carbs += meal.macros.carbs;
      consumed.fat += meal.macros.fat;
    }
  });

  const progress = {
    calories: {
      used: consumed.calories,
      goal: DAILY_GOALS.calories,
      percentage: Math.round((consumed.calories / DAILY_GOALS.calories) * 100),
    },
    protein: {
      used: consumed.protein,
      goal: DAILY_GOALS.protein,
      percentage: Math.round((consumed.protein / DAILY_GOALS.protein) * 100),
    },
    carbs: {
      used: consumed.carbs,
      goal: DAILY_GOALS.carbs,
      percentage: Math.round((consumed.carbs / DAILY_GOALS.carbs) * 100),
    },
    fat: {
      used: consumed.fat,
      goal: DAILY_GOALS.fat,
      percentage: Math.round((consumed.fat / DAILY_GOALS.fat) * 100),
    },
  };

  return progress;
};

// Helper function to get progress status styling
export const getProgressStatus = (percentage: number) => {
  if (percentage >= 100)
    return {
      color: "text-red-600",
      bg: "bg-red-100",
      status: "over",
      strokeColor: "#dc2626",
    };
  if (percentage >= 80)
    return {
      color: "text-orange-600",
      bg: "bg-orange-100",
      status: "near",
      strokeColor: "#ea580c",
    };
  return {
    color: "text-green-600",
    bg: "bg-green-100",
    status: "under",
    strokeColor: "#16a34a",
  };
};