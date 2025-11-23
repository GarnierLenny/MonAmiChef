import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../services/prisma.service';
import { JwtOptionalAuthGuard } from '../guards/jwt-optional-auth.guard';
import { getPerformanceStats } from '../interceptors/performance.interceptor';

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  database: {
    connected: boolean;
    responseTime?: number;
  };
  performance?: {
    totalClients: number;
    totalRequests: number;
    averageResponseTime: number;
    totalErrors: number;
  };
}

interface DatabaseStats {
  guests: {
    total: number;
    converted: number;
    active: number;
  };
  profiles: {
    total: number;
  };
  conversations: {
    total: number;
    guest: number;
    user: number;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic health check endpoint
   */
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    let dbConnected = false;
    let dbResponseTime: number | undefined;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      dbResponseTime = Date.now() - startTime;
    } catch (error) {
      console.error('Database health check failed:', error);
      dbConnected = false;
    }

    const perfStats = getPerformanceStats();

    return {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbConnected,
        responseTime: dbResponseTime,
      },
      performance: {
        totalClients: perfStats.totalClients,
        totalRequests: perfStats.summary.totalRequests,
        averageResponseTime: perfStats.summary.averageResponseTime,
        totalErrors: perfStats.summary.totalErrors,
      },
    };
  }

  /**
   * Detailed performance metrics (admin only in production)
   */
  @Get('metrics')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved' })
  @ApiResponse({ status: 403, description: 'Metrics not available in production' })
  async getMetrics() {
    // In production, you might want to restrict this to admin users
    const isDev =
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    if (!isDev) {
      return { error: 'Metrics endpoint not available in production' };
    }

    return getPerformanceStats();
  }

  /**
   * Database statistics
   */
  @Get('stats')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Get database statistics' })
  @ApiResponse({ status: 200, description: 'Database statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Stats not available in production' })
  async getDatabaseStats(): Promise<DatabaseStats> {
    const isDev =
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    if (!isDev) {
      return {
        guests: { total: 0, converted: 0, active: 0 },
        profiles: { total: 0 },
        conversations: { total: 0, guest: 0, user: 0 },
      };
    }

    const [
      totalGuests,
      convertedGuests,
      activeGuests,
      totalProfiles,
      totalConversations,
      guestConversations,
      userConversations,
    ] = await Promise.all([
      this.prisma.guest.count(),
      this.prisma.guest.count({ where: { converted_to_profile: true } }),
      this.prisma.guest.count({
        where: {
          converted_to_profile: false,
          Conversation: { some: {} },
        },
      }),
      this.prisma.profile.count(),
      this.prisma.conversation.count(),
      this.prisma.conversation.count({ where: { owner_guest_id: { not: null } } }),
      this.prisma.conversation.count({ where: { owner_profile_id: { not: null } } }),
    ]);

    return {
      guests: {
        total: totalGuests,
        converted: convertedGuests,
        active: activeGuests,
      },
      profiles: {
        total: totalProfiles,
      },
      conversations: {
        total: totalConversations,
        guest: guestConversations,
        user: userConversations,
      },
    };
  }
}
