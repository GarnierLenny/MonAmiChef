import {
  Controller,
  Get,
  Route,
  Tags,
  Security,
} from "tsoa";
import { prisma } from "../app";
import { getPerformanceStats } from "../middlewares/performanceMonitor";

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

@Route("health")
@Tags("Health")
export class HealthController extends Controller {
  /**
   * Basic health check endpoint
   */
  @Get("")
  public async getHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    let dbConnected = false;
    let dbResponseTime: number | undefined;

    try {
      await prisma.$queryRaw`SELECT 1`;
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
  @Get("metrics")
  @Security("optionalAuth")
  public async getMetrics() {
    // In production, you might want to restrict this to admin users
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
      this.setStatus(403);
      return { error: 'Metrics endpoint not available in production' };
    }

    return getPerformanceStats();
  }

  /**
   * Database statistics
   */
  @Get("stats")
  @Security("optionalAuth")
  public async getDatabaseStats(): Promise<DatabaseStats> {
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) {
      this.setStatus(403);
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
      prisma.guest.count(),
      prisma.guest.count({ where: { converted_to_profile: true } }),
      prisma.guest.count({
        where: {
          converted_to_profile: false,
          Conversation: { some: {} },
        },
      }),
      prisma.profile.count(),
      prisma.conversation.count(),
      prisma.conversation.count({ where: { owner_guest_id: { not: null } } }),
      prisma.conversation.count({ where: { owner_profile_id: { not: null } } }),
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