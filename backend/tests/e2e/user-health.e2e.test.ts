import request from 'supertest';
import { app } from '../test-prisma';
import { createTestUser, cleanupTestUser } from './helpers/auth.helper';

describe('UserHealthController E2E Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.profile.id);
  });

  describe('POST /user-health/metrics', () => {
    it('should log a health metric', async () => {
      const response = await request(app)
        .post('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .send({
          weight: 70.5,
          body_fat: 18.5,
          recorded_at: new Date().toISOString().split('T')[0],
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        profile_id: testUser.profile.id,
        weight: 70.5,
        body_fat: 18.5,
      });
    });

    it('should log metric with only weight', async () => {
      const response = await request(app)
        .post('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .send({
          weight: 71.0,
          recorded_at: new Date().toISOString().split('T')[0],
        })
        .expect(200);

      expect(response.body.weight).toBe(71.0);
      expect(response.body.body_fat).toBeFalsy();
    });

    it('should return 401 for guest users', async () => {
      await request(app)
        .post('/user-health/metrics')
        .send({
          weight: 70.0,
          recorded_at: new Date().toISOString().split('T')[0],
        })
        .expect(401);
    });
  });

  describe('GET /user-health/metrics', () => {
    beforeAll(async () => {
      // Add some test metrics
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await request(app)
        .post('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .send({
          weight: 70.0,
          recorded_at: yesterday.toISOString().split('T')[0],
        });

      await request(app)
        .post('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .send({
          weight: 69.5,
          recorded_at: today.toISOString().split('T')[0],
        });
    });

    it('should get all health metrics', async () => {
      const response = await request(app)
        .get('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body[0]).toMatchObject({
        profile_id: testUser.profile.id,
        weight: expect.any(Number),
      });
    });

    it('should filter metrics by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      const endDate = new Date();

      const response = await request(app)
        .get('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .query({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((metric: any) => {
        const recordedDate = new Date(metric.recorded_at);
        expect(recordedDate >= startDate && recordedDate <= endDate).toBe(true);
      });
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/user-health/metrics')
        .set('Authorization', testUser.authHeader)
        .query({ limit: 1 })
        .expect(200);

      expect(response.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('PUT /user-health/goals', () => {
    it('should create or update health goals', async () => {
      const response = await request(app)
        .put('/user-health/goals')
        .set('Authorization', testUser.authHeader)
        .send({
          target_weight: 68.0,
          target_body_fat: 15.0,
          daily_protein_goal: 150,
          daily_carbs_goal: 200,
          daily_fat_goal: 60,
          daily_calories_goal: 2000,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        profile_id: testUser.profile.id,
        target_weight: 68.0,
        target_body_fat: 15.0,
        daily_protein_goal: 150,
        daily_carbs_goal: 200,
        daily_fat_goal: 60,
        daily_calories_goal: 2000,
      });
    });

    it('should update existing goals', async () => {
      // First create
      await request(app)
        .put('/user-health/goals')
        .set('Authorization', testUser.authHeader)
        .send({
          target_weight: 70.0,
        });

      // Then update
      const response = await request(app)
        .put('/user-health/goals')
        .set('Authorization', testUser.authHeader)
        .send({
          target_weight: 65.0,
          daily_calories_goal: 1800,
        })
        .expect(200);

      expect(response.body.target_weight).toBe(65.0);
      expect(response.body.daily_calories_goal).toBe(1800);
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put('/user-health/goals')
        .set('Authorization', testUser.authHeader)
        .send({
          daily_protein_goal: 160,
        })
        .expect(200);

      expect(response.body.daily_protein_goal).toBe(160);
    });
  });

  describe('GET /user-health/goals', () => {
    it('should get user goals', async () => {
      const response = await request(app)
        .get('/user-health/goals')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        profile_id: testUser.profile.id,
      });
    });

    it('should return null when goals not set', async () => {
      const newUser = await createTestUser({ email: `nogoals-${Date.now()}@example.com` });

      const response = await request(app)
        .get('/user-health/goals')
        .set('Authorization', newUser.authHeader)
        .expect(200);

      expect(response.body).toBeNull();

      await cleanupTestUser(newUser.profile.id);
    });
  });

  describe('GET /user-health/dashboard', () => {
    it('should get complete dashboard data', async () => {
      const response = await request(app)
        .get('/user-health/dashboard')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        currentStats: expect.any(Object),
        todayMacros: expect.any(Object),
        chartData: expect.any(Object),
      });

      expect(response.body.currentStats).toBeDefined();
      expect(response.body.todayMacros).toMatchObject({
        protein: expect.any(Object),
        carbs: expect.any(Object),
        fat: expect.any(Object),
        calories: expect.any(Object),
      });
    });

    it('should handle users with no data', async () => {
      const newUser = await createTestUser({ email: `nodata-${Date.now()}@example.com` });

      const response = await request(app)
        .get('/user-health/dashboard')
        .set('Authorization', newUser.authHeader)
        .expect(200);

      expect(response.body.currentStats).toEqual({});
      expect(response.body.chartData.weightProgress).toHaveLength(0);

      await cleanupTestUser(newUser.profile.id);
    });
  });
});
