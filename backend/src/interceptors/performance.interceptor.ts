import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

interface PerformanceMetrics {
  requestCount: number;
  responseTime: number[];
  errorCount: number;
  lastReset: number;
}

const metrics = new Map<string, PerformanceMetrics>();
const METRICS_RESET_INTERVAL = 60 * 1000; // 1 minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per window per IP

function getClientId(req: Request): string {
  // Use guest session if available, otherwise IP
  const guestSession = req.cookies?.guestSession;
  if (guestSession) {
    try {
      const [guestId] = guestSession.split(':');
      if (guestId) return `guest:${guestId}`;
    } catch {}
  }

  // Fallback to IP address
  return (
    req.ip ||
    req.get('x-forwarded-for')?.split(',')[0] ||
    (req.connection as any).remoteAddress ||
    'unknown'
  );
}

function getOrCreateMetrics(clientId: string): PerformanceMetrics {
  const now = Date.now();
  let metric = metrics.get(clientId);

  if (!metric || now - metric.lastReset > METRICS_RESET_INTERVAL) {
    metric = {
      requestCount: 0,
      responseTime: [],
      errorCount: 0,
      lastReset: now,
    };
    metrics.set(clientId, metric);
  }

  return metric;
}

export function getPerformanceStats() {
  const stats = {
    totalClients: metrics.size,
    summary: {
      totalRequests: 0,
      averageResponseTime: 0,
      totalErrors: 0,
    },
    details: [] as Array<{
      clientId: string;
      requests: number;
      avgResponseTime: number;
      errors: number;
    }>,
  };

  for (const [clientId, metric] of metrics.entries()) {
    stats.summary.totalRequests += metric.requestCount;
    stats.summary.totalErrors += metric.errorCount;

    const avgResponseTime =
      metric.responseTime.length > 0
        ? metric.responseTime.reduce((a, b) => a + b, 0) / metric.responseTime.length
        : 0;

    stats.summary.averageResponseTime += avgResponseTime;

    stats.details.push({
      clientId: clientId.startsWith('guest:') ? 'guest:***' : clientId,
      requests: metric.requestCount,
      avgResponseTime: Math.round(avgResponseTime),
      errors: metric.errorCount,
    });
  }

  if (stats.details.length > 0) {
    stats.summary.averageResponseTime = Math.round(
      stats.summary.averageResponseTime / stats.details.length,
    );
  }

  // Sort by request count
  stats.details.sort((a, b) => b.requests - a.requests);

  return stats;
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip monitoring for OPTIONS requests
    if (request.method === 'OPTIONS') {
      return next.handle();
    }

    const startTime = Date.now();
    const clientId = getClientId(request);
    const metric = getOrCreateMetrics(clientId);

    // Rate limiting check
    if (metric.requestCount >= RATE_LIMIT_MAX_REQUESTS) {
      // Ensure CORS headers are still sent for rate limit responses
      const origin = request.headers.origin;
      const allowedOrigins = [
        'https://www.monamichef.com',
        'https://monamichef.com',
        'http://localhost:8080',
        'http://localhost:3000',
      ];

      if (origin && allowedOrigins.includes(origin)) {
        response.setHeader('Access-Control-Allow-Origin', origin);
        response.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      throw new HttpException(
        {
          error: 'Too many requests',
          retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (Date.now() - metric.lastReset)) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    metric.requestCount++;

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          metric.responseTime.push(responseTime);

          // Keep only last 100 response times for rolling average
          if (metric.responseTime.length > 100) {
            metric.responseTime.shift();
          }

          // Log slow requests (>1s)
          if (responseTime > 1000) {
            console.warn(
              `⚠️  Slow request: ${request.method} ${request.path} - ${responseTime}ms`,
            );
          }
        },
        error: () => {
          metric.errorCount++;
        },
      }),
    );
  }
}

// Cleanup old metrics every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [clientId, metric] of metrics.entries()) {
    if (now - metric.lastReset > 5 * METRICS_RESET_INTERVAL) {
      metrics.delete(clientId);
    }
  }
}, 5 * 60 * 1000);
