// Type definitions for User Health endpoints

export interface HealthMetric {
  id: string;
  profile_id: string;
  weight?: number;
  body_fat?: number;
  recorded_at: string;
  created_at: string;
}

export interface UserGoals {
  id: string;
  profile_id: string;
  target_weight?: number;
  target_body_fat?: number;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fat_goal?: number;
  daily_calories_goal?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  currentStats: {
    weight?: number;
    bodyFat?: number;
    weightChange?: number;
    bodyFatChange?: number;
  };
  todayMacros: {
    protein: { current: number; goal?: number };
    carbs: { current: number; goal?: number };
    fat: { current: number; goal?: number };
    calories: { current: number; goal?: number };
  };
  chartData: {
    weightProgress: Array<{ date: string; weight: number }>;
    bodyFatProgress: Array<{ date: string; bodyFat: number }>;
    caloriesWeek: Array<{ day: string; calories: number }>;
  };
  goals?: UserGoals;
}
