import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../services/prisma.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthUser } from '../strategies/jwt.strategy';
import { resolveOptimizedOwner } from '../utils/owner.util';
import { UserHealthRepository } from '../repositories/user-health.repository';
import { UserHealthService } from '../services/user-health.service';
import { LogMetricDto } from '../dto/user-health/log-metric.dto';
import { UpdateGoalsDto } from '../dto/user-health/update-goals.dto';
import { GetMetricsQueryDto } from '../dto/user-health/get-metrics-query.dto';
import { HealthMetric, UserGoals, DashboardData } from '../types/UserHealthTypes';

@ApiTags('User Health')
@Controller('user-health')
export class UserHealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userHealthRepository: UserHealthRepository,
    private readonly userHealthService: UserHealthService,
  ) {}

  /**
   * Get user's health metrics with optional date filtering
   */
  @Get('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's health metrics" })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date for filtering (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date for filtering (ISO string)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of metrics to return',
  })
  @ApiResponse({ status: 200, description: 'Health metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async getMetrics(
    @CurrentUser() user: AuthUser,
    @Query() query: GetMetricsQueryDto,
  ): Promise<HealthMetric[]> {
    const userId = user.sub;

    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const whereClause: any = { profile_id: userId };

    if (query.startDate || query.endDate) {
      whereClause.recorded_at = {};
      if (query.startDate) whereClause.recorded_at.gte = new Date(query.startDate);
      if (query.endDate) whereClause.recorded_at.lte = new Date(query.endDate);
    }

    const metrics = await this.userHealthRepository.findHealthMetrics(
      whereClause,
      { recorded_at: 'desc' },
      query.limit || 100,
    );

    return metrics.map((metric) => ({
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
  @Post('metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log new health metric' })
  @ApiResponse({ status: 200, description: 'Health metric logged successfully' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async logMetric(
    @CurrentUser() user: AuthUser,
    @Body() body: LogMetricDto,
  ): Promise<HealthMetric> {
    const userId = user.sub;

    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // Validate that at least one metric is provided
    if (body.weight === undefined && body.body_fat === undefined) {
      throw new HttpException(
        'At least one of weight or body_fat must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const recordedAt = body.recorded_at ? new Date(body.recorded_at) : new Date();

    // Check if metric already exists for this date
    const existingMetric = await this.userHealthRepository.findHealthMetricByProfileAndDate(
      userId,
      recordedAt,
    );

    let metric;
    if (existingMetric) {
      // Update existing metric
      metric = await this.userHealthRepository.updateHealthMetric(existingMetric.id, {
        weight: body.weight,
        body_fat: body.body_fat,
      });
    } else {
      // Create new metric
      metric = await this.userHealthRepository.createHealthMetric({
        profile_id: userId,
        weight: body.weight,
        body_fat: body.body_fat,
        recorded_at: recordedAt,
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
  @Get('goals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user's health goals" })
  @ApiResponse({ status: 200, description: 'Health goals retrieved successfully' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async getGoals(@CurrentUser() user: AuthUser): Promise<UserGoals | null> {
    const userId = user.sub;

    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const goals = await this.userHealthRepository.findUserGoals(userId);

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
  @Put('goals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user's health goals" })
  @ApiResponse({ status: 200, description: 'Health goals updated successfully' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async updateGoals(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateGoalsDto,
  ): Promise<UserGoals> {
    const userId = user.sub;

    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    const goals = await this.userHealthRepository.upsertUserGoals(userId, body);

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
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete health dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async getDashboardData(@CurrentUser() user: AuthUser): Promise<DashboardData> {
    const userId = user.sub;

    if (!userId) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // Get latest health metrics
    const latestMetrics = await this.userHealthRepository.findHealthMetrics(
      { profile_id: userId },
      { recorded_at: 'desc' },
      2,
    );

    // Get historical data for charts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalMetrics = await this.userHealthRepository.findHealthMetrics(
      {
        profile_id: userId,
        recorded_at: { gte: thirtyDaysAgo },
      },
      { recorded_at: 'asc' },
    );

    // Get user goals
    const goals = await this.userHealthRepository.findUserGoals(userId);

    // Calculate current stats and changes
    const currentStats: DashboardData['currentStats'] = {};
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
    const calculatedMacros = await this.userHealthService.calculateTodayMacros(userId);
    const todayMacros = {
      protein: { current: calculatedMacros.protein, goal: goals?.daily_protein_goal || undefined },
      carbs: { current: calculatedMacros.carbs, goal: goals?.daily_carbs_goal || undefined },
      fat: { current: calculatedMacros.fat, goal: goals?.daily_fat_goal || undefined },
      calories: {
        current: calculatedMacros.calories,
        goal: goals?.daily_calories_goal || undefined,
      },
    };

    // Prepare chart data
    const weightProgress = historicalMetrics
      .filter((m) => m.weight)
      .map((m) => ({
        date: m.recorded_at.toISOString().split('T')[0],
        weight: Number(m.weight!),
      }));

    const bodyFatProgress = historicalMetrics
      .filter((m) => m.body_fat)
      .map((m) => ({
        date: m.recorded_at.toISOString().split('T')[0],
        bodyFat: Number(m.body_fat!),
      }));

    // Calculate weekly calories from meal plans
    const weekMacros = await this.userHealthService.calculateWeekMacros(userId);
    const caloriesWeek = weekMacros.map((dayData) => ({
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
      goals: goals
        ? {
            id: goals.id,
            profile_id: goals.profile_id,
            target_weight: goals.target_weight ? Number(goals.target_weight) : undefined,
            target_body_fat: goals.target_body_fat
              ? Number(goals.target_body_fat)
              : undefined,
            daily_protein_goal: goals.daily_protein_goal || undefined,
            daily_carbs_goal: goals.daily_carbs_goal || undefined,
            daily_fat_goal: goals.daily_fat_goal || undefined,
            daily_calories_goal: goals.daily_calories_goal || undefined,
            created_at: goals.created_at.toISOString(),
            updated_at: goals.updated_at.toISOString(),
          }
        : undefined,
    };
  }
}
