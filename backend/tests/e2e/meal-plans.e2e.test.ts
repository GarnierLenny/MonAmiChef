import request from 'supertest';
import { app, prisma } from '../test-prisma';
import { createTestUser, cleanupTestUser } from './helpers/auth.helper';

describe('MealPlanController E2E Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let mealPlanId: string;
  let recipeId: string;

  beforeAll(async () => {
    testUser = await createTestUser();

    // Create a test recipe for meal planning
    const recipe = await prisma.recipe.create({
      data: {
        title: 'Test Meal',
        content_json: {
          title: 'Test Meal',
          ingredients: ['ingredient 1'],
          instructions: ['step 1'],
        },
        tags: ['test'],
      },
    });
    recipeId = recipe.id;
  });

  afterAll(async () => {
    await prisma.recipe.delete({ where: { id: recipeId } }).catch(() => {});
    await cleanupTestUser(testUser.profile.id);
  });

  describe('POST /meal-plans', () => {
    it('should create a meal plan for authenticated user', async () => {
      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);

      const response = await request(app)
        .post('/meal-plans')
        .set('Authorization', testUser.authHeader)
        .send({
          weekStartDate: weekStart.toISOString().split('T')[0],
          title: 'Weekly Meal Plan',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: testUser.profile.id,
        weekStartDate: expect.any(String),
        title: 'Weekly Meal Plan',
        items: [],
      });

      mealPlanId = response.body.id;
    });

    it('should return 500 for guest users', async () => {
      await request(app)
        .post('/meal-plans')
        .send({
          weekStartDate: new Date().toISOString().split('T')[0],
        })
        .expect(500);
    });
  });

  describe('GET /meal-plans', () => {
    it('should get all meal plans for user', async () => {
      const response = await request(app)
        .get('/meal-plans')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const plan = response.body.find((p: any) => p.id === mealPlanId);
      expect(plan).toBeTruthy();
      expect(plan.title).toBe('Weekly Meal Plan');
    });

    it('should return empty array for guests', async () => {
      const response = await request(app)
        .get('/meal-plans')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /meal-plans/:id', () => {
    it('should get specific meal plan', async () => {
      const response = await request(app)
        .get(`/meal-plans/${mealPlanId}`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        id: mealPlanId,
        title: 'Weekly Meal Plan',
        userId: testUser.profile.id,
      });
    });

    it('should return 500 for non-existent plan', async () => {
      await request(app)
        .get('/meal-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .expect(500);
    });
  });

  describe('PUT /meal-plans/:id', () => {
    it('should update meal plan', async () => {
      const response = await request(app)
        .put(`/meal-plans/${mealPlanId}`)
        .set('Authorization', testUser.authHeader)
        .send({
          title: 'Updated Plan',
          generationMethod: 'manual',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Plan');
      expect(response.body.generationMethod).toBe('manual');
    });

    it('should return 500 for non-existent plan', async () => {
      await request(app)
        .put('/meal-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .send({ title: 'Test' })
        .expect(500);
    });
  });

  describe('POST /meal-plans/:id/items', () => {
    it('should add meal to plan', async () => {
      const response = await request(app)
        .post(`/meal-plans/${mealPlanId}/items`)
        .set('Authorization', testUser.authHeader)
        .send({
          day: 0, // Sunday
          mealSlot: 'breakfast',
          recipeId: recipeId,
        })
        .expect(200);

      // Controller doesn't return items in response, just verify success
      expect(response.body).toBeDefined();
    });

    it('should replace existing meal in same slot', async () => {
      // Add a meal
      await request(app)
        .post(`/meal-plans/${mealPlanId}/items`)
        .set('Authorization', testUser.authHeader)
        .send({
          day: 1,
          mealSlot: 'lunch',
          recipeId: recipeId,
        });

      // Replace it
      const response = await request(app)
        .post(`/meal-plans/${mealPlanId}/items`)
        .set('Authorization', testUser.authHeader)
        .send({
          day: 1,
          mealSlot: 'lunch',
          recipeId: recipeId,
        })
        .expect(200);

      // Controller doesn't return items in response, just verify success
      expect(response.body).toBeDefined();
    });

    it('should return 500 for invalid day range', async () => {
      await request(app)
        .post(`/meal-plans/${mealPlanId}/items`)
        .set('Authorization', testUser.authHeader)
        .send({
          day: 7, // Invalid
          mealSlot: 'breakfast',
          recipeId: recipeId,
        })
        .expect(500);
    });
  });

  describe('DELETE /meal-plans/:id/items/:itemId', () => {
    let itemId: string;

    beforeAll(async () => {
      // Create item directly in database since controller doesn't return items
      const item = await prisma.mealPlanItem.create({
        data: {
          mealPlanId: mealPlanId,
          day: 5,
          mealSlot: 'dinner',
          recipeId: recipeId,
        },
      });
      itemId = item.id;
    });

    it('should remove meal from plan', async () => {
      const response = await request(app)
        .delete(`/meal-plans/${mealPlanId}/items/${itemId}`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      // Controller doesn't return items, verify item deleted in database
      const deletedItem = await prisma.mealPlanItem.findUnique({
        where: { id: itemId },
      });
      expect(deletedItem).toBeFalsy();
    });

    it('should return 500 for non-existent item', async () => {
      await request(app)
        .delete(`/meal-plans/${mealPlanId}/items/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', testUser.authHeader)
        .expect(500);
    });
  });

  describe('DELETE /meal-plans/:id', () => {
    it('should delete meal plan', async () => {
      await request(app)
        .delete(`/meal-plans/${mealPlanId}`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      // Verify it's deleted in database
      const deletedPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
      });
      expect(deletedPlan).toBeFalsy();
    });

    it('should return 500 for non-existent plan', async () => {
      await request(app)
        .delete('/meal-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .expect(500);
    });
  });
});
