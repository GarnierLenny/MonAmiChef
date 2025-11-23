import request from 'supertest';

// Simple UUID mock for testing
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { app } from '../test-prisma';
import { prisma } from '../test-prisma';
import {
  createTestUser,
  createTestGuest,
  cleanupTestUser,
  cleanupTestGuest,
  mockAuthUser,
  TestUser,
  TestGuest
} from '../helpers/auth';

describe('MealPlanController', () => {
  let testUser: TestUser;
  let testGuest: TestGuest;
  let testMealPlanId: string;

  beforeAll(async () => {
    testUser = await createTestUser();
    testGuest = await createTestGuest();
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.id);
    await cleanupTestGuest(testGuest.id);
  });

  beforeEach(async () => {
    // Clean up any existing meal plans from previous tests
    await prisma.mealPlanItem.deleteMany({
      where: {
        mealPlan: {
          userId: testUser.id
        }
      }
    });
    await prisma.mealPlan.deleteMany({
      where: { userId: testUser.id }
    });
  });

  describe('GET /meal-plans', () => {
    it('should return empty array for authenticated user with no meal plans', async () => {
      // Mock authenticated request
      const mockUser = mockAuthUser(testUser);

      const response = await request(app)
        .get('/meal-plans')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/meal-plans')
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return meal plans for authenticated user', async () => {
      // Create a test meal plan
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date('2025-01-01'),
          title: 'Test Meal Plan',
          generationMethod: 'manual'
        }
      });

      const response = await request(app)
        .get('/meal-plans')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: mealPlan.id,
        userId: testUser.id,
        title: 'Test Meal Plan',
        generationMethod: 'manual',
        items: []
      });
    });
  });

  describe('POST /meal-plans', () => {
    it('should create a new meal plan for authenticated user', async () => {
      const mealPlanData = {
        weekStartDate: '2025-01-06T00:00:00.000Z',
        title: 'New Week Plan',
        generationMethod: 'manual'
      };

      const response = await request(app)
        .post('/meal-plans')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send(mealPlanData)
        .expect(201);

      expect(response.body).toMatchObject({
        userId: testUser.id,
        title: 'New Week Plan',
        generationMethod: 'manual',
        items: []
      });

      testMealPlanId = response.body.id;

      // Verify in database
      const dbMealPlan = await prisma.mealPlan.findUnique({
        where: { id: response.body.id }
      });
      expect(dbMealPlan).toBeTruthy();
      expect(dbMealPlan?.title).toBe('New Week Plan');
    });

    it('should return 401 for unauthenticated request', async () => {
      const mealPlanData = {
        weekStartDate: '2025-01-06T00:00:00.000Z',
        title: 'Unauthorized Plan'
      };

      const response = await request(app)
        .post('/meal-plans')
        .send(mealPlanData)
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return 400 for invalid date format', async () => {
      const mealPlanData = {
        weekStartDate: 'invalid-date',
        title: 'Invalid Date Plan'
      };

      const response = await request(app)
        .post('/meal-plans')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send(mealPlanData)
        .expect(400);

      expect(response.body.message).toContain('Invalid date format');
    });

    it('should return 409 for duplicate week meal plan', async () => {
      const weekStart = '2025-01-13T00:00:00.000Z';

      // Create first meal plan
      await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date(weekStart),
          title: 'First Plan'
        }
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/meal-plans')
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          weekStartDate: weekStart,
          title: 'Duplicate Plan'
        })
        .expect(409);

      expect(response.body.message).toContain('A meal plan already exists for this week');
    });
  });

  describe('GET /meal-plans/:id', () => {
    beforeEach(async () => {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date('2025-01-20'),
          title: 'Get Test Plan'
        }
      });
      testMealPlanId = mealPlan.id;
    });

    it('should return specific meal plan for owner', async () => {
      const response = await request(app)
        .get(`/meal-plans/${testMealPlanId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testMealPlanId,
        userId: testUser.id,
        title: 'Get Test Plan',
        items: []
      });
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/meal-plans/${testMealPlanId}`)
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return 404 for non-existent meal plan', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .get(`/meal-plans/${nonExistentId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(404);

      expect(response.body.message).toContain('Meal plan not found');
    });
  });

  describe('PUT /meal-plans/:id', () => {
    beforeEach(async () => {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date('2025-01-27'),
          title: 'Update Test Plan',
          generationMethod: 'manual'
        }
      });
      testMealPlanId = mealPlan.id;
    });

    it('should update meal plan for owner', async () => {
      const updateData = {
        title: 'Updated Plan Title',
        generationMethod: 'ai_assisted'
      };

      const response = await request(app)
        .put(`/meal-plans/${testMealPlanId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testMealPlanId,
        title: 'Updated Plan Title',
        generationMethod: 'ai_assisted'
      });

      // Verify in database
      const dbMealPlan = await prisma.mealPlan.findUnique({
        where: { id: testMealPlanId }
      });
      expect(dbMealPlan?.title).toBe('Updated Plan Title');
      expect(dbMealPlan?.generationMethod).toBe('ai_assisted');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .put(`/meal-plans/${testMealPlanId}`)
        .send({ title: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return 404 for non-existent meal plan', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .put(`/meal-plans/${nonExistentId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({ title: 'Non-existent Update' })
        .expect(404);

      expect(response.body.message).toContain('Meal plan not found');
    });
  });

  describe('DELETE /meal-plans/:id', () => {
    beforeEach(async () => {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date('2025-02-03'),
          title: 'Delete Test Plan'
        }
      });
      testMealPlanId = mealPlan.id;
    });

    it('should delete meal plan for owner', async () => {
      const response = await request(app)
        .delete(`/meal-plans/${testMealPlanId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify deletion in database
      const dbMealPlan = await prisma.mealPlan.findUnique({
        where: { id: testMealPlanId }
      });
      expect(dbMealPlan).toBeNull();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/meal-plans/${testMealPlanId}`)
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return 404 for non-existent meal plan', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .delete(`/meal-plans/${nonExistentId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(404);

      expect(response.body.message).toContain('Meal plan not found');
    });
  });

  describe('POST /meal-plans/:id/items', () => {
    beforeEach(async () => {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date('2025-02-10'),
          title: 'Items Test Plan'
        }
      });
      testMealPlanId = mealPlan.id;
    });

    it('should add meal plan item for owner', async () => {
      const itemData = {
        day: 1, // Monday
        mealSlot: 'breakfast',
        recipeId: uuidv4()
      };

      const response = await request(app)
        .post(`/meal-plans/${testMealPlanId}/items`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send(itemData)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify in database
      const dbItem = await prisma.mealPlanItem.findFirst({
        where: {
          mealPlanId: testMealPlanId,
          day: 1,
          mealSlot: 'breakfast'
        }
      });
      expect(dbItem).toBeTruthy();
      expect(dbItem?.recipeId).toBe(itemData.recipeId);
    });

    it('should update existing meal plan item', async () => {
      const originalRecipeId = uuidv4();
      const newRecipeId = uuidv4();

      // Create initial item
      await prisma.mealPlanItem.create({
        data: {
          mealPlanId: testMealPlanId,
          day: 2,
          mealSlot: 'lunch',
          recipeId: originalRecipeId
        }
      });

      // Update with new recipe
      const response = await request(app)
        .post(`/meal-plans/${testMealPlanId}/items`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          day: 2,
          mealSlot: 'lunch',
          recipeId: newRecipeId
        })
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify update in database
      const dbItem = await prisma.mealPlanItem.findFirst({
        where: {
          mealPlanId: testMealPlanId,
          day: 2,
          mealSlot: 'lunch'
        }
      });
      expect(dbItem?.recipeId).toBe(newRecipeId);
    });

    it('should return 400 for invalid day', async () => {
      const response = await request(app)
        .post(`/meal-plans/${testMealPlanId}/items`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          day: 7, // Invalid (should be 0-6)
          mealSlot: 'breakfast'
        })
        .expect(400);

      expect(response.body.message).toContain('Day must be between 0 (Sunday) and 6 (Saturday)');
    });

    it('should return 400 for invalid meal slot', async () => {
      const response = await request(app)
        .post(`/meal-plans/${testMealPlanId}/items`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          day: 3,
          mealSlot: 'invalid-slot'
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid meal slot');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post(`/meal-plans/${testMealPlanId}/items`)
        .send({
          day: 1,
          mealSlot: 'breakfast'
        })
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return 404 for non-existent meal plan', async () => {
      const nonExistentId = uuidv4();

      const response = await request(app)
        .post(`/meal-plans/${nonExistentId}/items`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .send({
          day: 1,
          mealSlot: 'breakfast'
        })
        .expect(404);

      expect(response.body.message).toContain('Meal plan not found');
    });
  });

  describe('DELETE /meal-plans/:id/items/:itemId', () => {
    let testItemId: string;

    beforeEach(async () => {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId: testUser.id,
          weekStartDate: new Date('2025-02-17'),
          title: 'Item Delete Test Plan'
        }
      });
      testMealPlanId = mealPlan.id;

      const item = await prisma.mealPlanItem.create({
        data: {
          mealPlanId: testMealPlanId,
          day: 3,
          mealSlot: 'dinner',
          recipeId: uuidv4()
        }
      });
      testItemId = item.id;
    });

    it('should delete meal plan item for owner', async () => {
      const response = await request(app)
        .delete(`/meal-plans/${testMealPlanId}/items/${testItemId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify deletion in database
      const dbItem = await prisma.mealPlanItem.findUnique({
        where: { id: testItemId }
      });
      expect(dbItem).toBeNull();
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/meal-plans/${testMealPlanId}/items/${testItemId}`)
        .expect(401);

      expect(response.body.message).toContain('Meal plans are only available for registered users');
    });

    it('should return 404 for non-existent meal plan', async () => {
      const nonExistentPlanId = uuidv4();

      const response = await request(app)
        .delete(`/meal-plans/${nonExistentPlanId}/items/${testItemId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(404);

      expect(response.body.message).toContain('Meal plan not found');
    });

    it('should return 404 for non-existent item', async () => {
      const nonExistentItemId = uuidv4();

      const response = await request(app)
        .delete(`/meal-plans/${testMealPlanId}/items/${nonExistentItemId}`)
        .set('Authorization', `Bearer mock-token-${testUser.id}`)
        .expect(404);

      expect(response.body.message).toContain('Meal plan item not found');
    });
  });
});