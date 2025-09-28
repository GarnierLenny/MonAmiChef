import { apiFetch } from "../apiClient";

// Type definitions matching backend
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

export interface LogMetricRequest {
  weight?: number;
  body_fat?: number;
  recorded_at?: string; // ISO date string, defaults to today
}

export interface UpdateGoalsRequest {
  target_weight?: number;
  target_body_fat?: number;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fat_goal?: number;
  daily_calories_goal?: number;
}

export const healthApi = {
  /**
   * Get user's health metrics with optional date filtering
   */
  getMetrics: async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<HealthMetric[]> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/user-health/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return apiFetch(url, { auth: "required" });
  },

  /**
   * Log new health metric (weight and/or body fat)
   */
  logMetric: async (data: LogMetricRequest): Promise<HealthMetric> => {
    return apiFetch("/user-health/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      auth: "required",
    });
  },

  /**
   * Get user's health goals
   */
  getGoals: async (): Promise<UserGoals | null> => {
    return apiFetch("/user-health/goals", { auth: "required" });
  },

  /**
   * Update user's health goals
   */
  updateGoals: async (data: UpdateGoalsRequest): Promise<UserGoals> => {
    return apiFetch("/user-health/goals", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      auth: "required",
    });
  },

  /**
   * Get complete dashboard data (metrics + calculated macros from meal plans)
   */
  getDashboardData: async (): Promise<DashboardData> => {
    return apiFetch("/user-health/dashboard", { auth: "required" });
  },
};

// Custom hooks for health data
export const useHealthMetrics = () => {
  // This will be implemented with proper state management
  // For now, return basic functions
  return {
    metrics: [],
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

export const useHealthGoals = () => {
  // This will be implemented with proper state management
  return {
    goals: null,
    loading: false,
    error: null,
    updateGoals: (data: UpdateGoalsRequest) => Promise.resolve(),
  };
};

export const useDashboardData = () => {
  // This will be implemented with proper state management
  return {
    data: null,
    loading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
};