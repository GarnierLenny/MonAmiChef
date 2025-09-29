import {
  Controller,
  Get,
  Post,
  Put,
  Route,
  Tags,
  Security,
  Body,
  Query,
  Request,
} from "tsoa";
import { prisma } from "../app";
import { Request as ExpressRequest } from "express";
import { z } from "zod";
import { MacroCalculationService } from "../services/MacroCalculationService";
import { resolveOwner } from "../utils/owner";

// Type definitions
interface HealthMetric {
  id: string;
  profile_id: string;
  weight?: number;
  body_fat?: number;
  recorded_at: string;
  created_at: string;
}

interface UserGoals {
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

interface DashboardData {
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

interface LogMetricRequest {
  weight?: number;
  body_fat?: number;
  recorded_at?: string; // ISO date string, defaults to today
}

interface UpdateGoalsRequest {
  target_weight?: number;
  target_body_fat?: number;
  daily_protein_goal?: number;
  daily_carbs_goal?: number;
  daily_fat_goal?: number;
  daily_calories_goal?: number;
}

// Validation schemas
const logMetricSchema = z.object({
  weight: z.number().min(1).max(1000).optional(),
  body_fat: z.number().min(0).max(100).optional(),
  recorded_at: z.string().optional(),
}).refine(data => data.weight !== undefined || data.body_fat !== undefined, {
  message: "At least one of weight or body_fat must be provided"
});

const updateGoalsSchema = z.object({
  target_weight: z.number().min(1).max(1000).optional(),
  target_body_fat: z.number().min(0).max(100).optional(),
  daily_protein_goal: z.number().min(0).max(1000).optional(),
  daily_carbs_goal: z.number().min(0).max(2000).optional(),
  daily_fat_goal: z.number().min(0).max(500).optional(),
  daily_calories_goal: z.number().min(0).max(10000).optional(),
});

@Route("user-health")
@Tags("User Health")
@Security("bearerAuth")
export class UserHealthController extends Controller {

  /**
   * Get user's health metrics with optional date filtering
   */
  @Get("metrics")
  public async getMetrics(
    @Request() request: ExpressRequest,
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() limit?: number
  ): Promise<HealthMetric[]> {
    const owner = await resolveOwner(request);
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("User not authenticated");
    }

    const whereClause: any = { profile_id: owner.userId };

    if (startDate || endDate) {
      whereClause.recorded_at = {};
      if (startDate) whereClause.recorded_at.gte = new Date(startDate);
      if (endDate) whereClause.recorded_at.lte = new Date(endDate);
    }

    const metrics = await prisma.healthMetric.findMany({
      where: whereClause,
      orderBy: { recorded_at: "desc" },
      take: limit || 100,
    });

    return metrics.map(metric => ({
      id: metric.id,
      profile_id: metric.profile_id,
      weight: metric.weight ? Number(metric.weight) : undefined,
      body_fat: metric.body_fat ? Number(metric.body_fat) : undefined,
      recorded_at: metric.recorded_at.toISOString(),
      created_at: metric.created_at.toISOString(),
    }));
  }

  /**
   * Log new health metric (weight and/or body fat)
   */
  @Post("metrics")
  public async logMetric(
    @Request() request: ExpressRequest,
    @Body() body: LogMetricRequest
  ): Promise<HealthMetric> {
    const owner = await resolveOwner(request);
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("User not authenticated");
    }

    // Validate input
    const validatedData = logMetricSchema.parse(body);

    const recordedAt = validatedData.recorded_at
      ? new Date(validatedData.recorded_at)
      : new Date();

    // Check if metric already exists for this date
    const existingMetric = await prisma.healthMetric.findFirst({
      where: {
        profile_id: owner.userId,
        recorded_at: recordedAt,
      },
    });

    let metric;
    if (existingMetric) {
      // Update existing metric
      metric = await prisma.healthMetric.update({
        where: { id: existingMetric.id },
        data: {
          weight: validatedData.weight,
          body_fat: validatedData.body_fat,
        },
      });
    } else {
      // Create new metric
      metric = await prisma.healthMetric.create({
        data: {
          profile_id: owner.userId,
          weight: validatedData.weight,
          body_fat: validatedData.body_fat,
          recorded_at: recordedAt,
        },
      });
    }

    return {
      id: metric.id,
      profile_id: metric.profile_id,
      weight: metric.weight ? Number(metric.weight) : undefined,
      body_fat: metric.body_fat ? Number(metric.body_fat) : undefined,
      recorded_at: metric.recorded_at.toISOString(),
      created_at: metric.created_at.toISOString(),
    };
  }

  /**
   * Get user's health goals
   */
  @Get("goals")
  public async getGoals(@Request() request: ExpressRequest): Promise<UserGoals | null> {
    const owner = await resolveOwner(request);
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("User not authenticated");
    }

    const goals = await prisma.userGoals.findUnique({
      where: { profile_id: owner.userId },
    });

    if (!goals) return null;

    return {
      id: goals.id,
      profile_id: goals.profile_id,
      target_weight: goals.target_weight ? Number(goals.target_weight) : undefined,
      target_body_fat: goals.target_body_fat ? Number(goals.target_body_fat) : undefined,
      daily_protein_goal: goals.daily_protein_goal || undefined,
      daily_carbs_goal: goals.daily_carbs_goal || undefined,
      daily_fat_goal: goals.daily_fat_goal || undefined,
      daily_calories_goal: goals.daily_calories_goal || undefined,
      created_at: goals.created_at.toISOString(),
      updated_at: goals.updated_at.toISOString(),
    };
  }

  /**
   * Update user's health goals
   */
  @Put("goals")
  public async updateGoals(
    @Request() request: ExpressRequest,
    @Body() body: UpdateGoalsRequest
  ): Promise<UserGoals> {
    const owner = await resolveOwner(request);
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("User not authenticated");
    }

    // Validate input
    const validatedData = updateGoalsSchema.parse(body);

    const goals = await prisma.userGoals.upsert({
      where: { profile_id: owner.userId },
      update: validatedData,
      create: {
        profile_id: owner.userId,
        ...validatedData,
      },
    });

    return {
      id: goals.id,
      profile_id: goals.profile_id,
      target_weight: goals.target_weight ? Number(goals.target_weight) : undefined,
      target_body_fat: goals.target_body_fat ? Number(goals.target_body_fat) : undefined,
      daily_protein_goal: goals.daily_protein_goal || undefined,
      daily_carbs_goal: goals.daily_carbs_goal || undefined,
      daily_fat_goal: goals.daily_fat_goal || undefined,
      daily_calories_goal: goals.daily_calories_goal || undefined,
      created_at: goals.created_at.toISOString(),
      updated_at: goals.updated_at.toISOString(),
    };
  }

  /**
   * Get complete dashboard data (metrics + calculated macros from meal plans)
   */
  @Get("dashboard")
  public async getDashboardData(@Request() request: ExpressRequest): Promise<DashboardData> {
    const owner = await resolveOwner(request);
    if (!owner.userId) {
      this.setStatus(401);
      throw new Error("User not authenticated");
    }

    // Get latest health metrics
    const latestMetrics = await prisma.healthMetric.findMany({
      where: { profile_id: owner.userId },
      orderBy: { recorded_at: "desc" },
      take: 2,
    });

    // Get historical data for charts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalMetrics = await prisma.healthMetric.findMany({
      where: {
        profile_id: owner.userId,
        recorded_at: { gte: thirtyDaysAgo },
      },
      orderBy: { recorded_at: "asc" },
    });

    // Get user goals
    const goals = await prisma.userGoals.findUnique({
      where: { profile_id: owner.userId },
    });

    // Calculate current stats and changes
    const currentStats: DashboardData["currentStats"] = {};
    if (latestMetrics.length > 0) {
      const latest = latestMetrics[0];
      currentStats.weight = latest.weight ? Number(latest.weight) : undefined;
      currentStats.bodyFat = latest.body_fat ? Number(latest.body_fat) : undefined;

      if (latestMetrics.length > 1) {
        const previous = latestMetrics[1];
        if (latest.weight && previous.weight) {
          currentStats.weightChange = Number(latest.weight) - Number(previous.weight);
        }
        if (latest.body_fat && previous.body_fat) {
          currentStats.bodyFatChange = Number(latest.body_fat) - Number(previous.body_fat);
        }
      }
    }

    // Calculate today's macros from meal plans
    const calculatedMacros = await MacroCalculationService.calculateTodayMacros(owner.userId);
    const todayMacros = {
      protein: { current: calculatedMacros.protein, goal: goals?.daily_protein_goal || undefined },
      carbs: { current: calculatedMacros.carbs, goal: goals?.daily_carbs_goal || undefined },
      fat: { current: calculatedMacros.fat, goal: goals?.daily_fat_goal || undefined },
      calories: { current: calculatedMacros.calories, goal: goals?.daily_calories_goal || undefined },
    };

    // Prepare chart data
    const weightProgress = historicalMetrics
      .filter(m => m.weight)
      .map(m => ({
        date: m.recorded_at.toISOString().split('T')[0],
        weight: Number(m.weight!),
      }));

    const bodyFatProgress = historicalMetrics
      .filter(m => m.body_fat)
      .map(m => ({
        date: m.recorded_at.toISOString().split('T')[0],
        bodyFat: Number(m.body_fat!),
      }));

    // Calculate weekly calories from meal plans
    const weekMacros = await MacroCalculationService.calculateWeekMacros(owner.userId);
    const caloriesWeek = weekMacros.map(dayData => ({
      day: dayData.day,
      calories: dayData.macros.calories,
    }));

    return {
      currentStats,
      todayMacros,
      chartData: {
        weightProgress,
        bodyFatProgress,
        caloriesWeek,
      },
      goals: goals ? {
        id: goals.id,
        profile_id: goals.profile_id,
        target_weight: goals.target_weight ? Number(goals.target_weight) : undefined,
        target_body_fat: goals.target_body_fat ? Number(goals.target_body_fat) : undefined,
        daily_protein_goal: goals.daily_protein_goal || undefined,
        daily_carbs_goal: goals.daily_carbs_goal || undefined,
        daily_fat_goal: goals.daily_fat_goal || undefined,
        daily_calories_goal: goals.daily_calories_goal || undefined,
        created_at: goals.created_at.toISOString(),
        updated_at: goals.updated_at.toISOString(),
      } : undefined,
    };
  }
}