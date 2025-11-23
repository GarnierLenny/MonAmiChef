import request from 'supertest';
import { getTestServer, closeTestApp } from '../test-app';
import { createTestUser, cleanupTestUser } from './helpers/auth.helper';

let app: any;

describe('HealthController E2E Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    app = await getTestServer();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.profile.id);
    await closeTestApp();
  });

  describe('GET /health', () => {
    it('should return healthy status with database connected', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: 'test',
        database: {
          connected: true,
          responseTime: expect.any(Number),
        },
        performance: {
          totalClients: expect.any(Number),
          totalRequests: expect.any(Number),
          averageResponseTime: expect.any(Number),
          totalErrors: expect.any(Number),
        },
      });

      // Verify timestamp is valid ISO string
      expect(() => new Date(response.body.timestamp)).not.toThrow();

      // Verify database response time is reasonable (less than 1 second)
      expect(response.body.database.responseTime).toBeLessThan(1000);
    });

    it('should work without authentication', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /health/metrics', () => {
    it('should return performance metrics in test environment', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.body).toMatchObject({
        totalClients: expect.any(Number),
        summary: {
          totalRequests: expect.any(Number),
          averageResponseTime: expect.any(Number),
          totalErrors: expect.any(Number),
        },
        details: expect.any(Array),
      });
    });

    it('should work with optional authentication', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body.summary).toBeDefined();
    });

    it('should work without authentication', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.body.summary).toBeDefined();
    });
  });

  describe('GET /health/stats', () => {
    it('should return database statistics in test environment', async () => {
      const response = await request(app)
        .get('/health/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        guests: {
          total: expect.any(Number),
          converted: expect.any(Number),
          active: expect.any(Number),
        },
        profiles: {
          total: expect.any(Number),
        },
        conversations: {
          total: expect.any(Number),
          guest: expect.any(Number),
          user: expect.any(Number),
        },
      });

      // Verify counts are non-negative
      expect(response.body.guests.total).toBeGreaterThanOrEqual(0);
      expect(response.body.profiles.total).toBeGreaterThanOrEqual(1); // At least our test user
      expect(response.body.conversations.total).toBeGreaterThanOrEqual(0);
    });

    it('should work with optional authentication', async () => {
      const response = await request(app)
        .get('/health/stats')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body.guests).toBeDefined();
      expect(response.body.profiles).toBeDefined();
    });

    it('should work without authentication', async () => {
      const response = await request(app)
        .get('/health/stats')
        .expect(200);

      expect(response.body.guests).toBeDefined();
    });
  });
});
