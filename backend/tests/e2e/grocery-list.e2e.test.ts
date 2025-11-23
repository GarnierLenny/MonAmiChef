import request from 'supertest';
import { app, prisma } from '../test-prisma';
import { createTestUser, cleanupTestUser } from './helpers/auth.helper';

describe('GroceryListController E2E Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let mealPlanId: string;
  let mealPlanItemId: string;
  let recipeId: string;

  beforeAll(async () => {
    testUser = await createTestUser();

    // Create test recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: 'Test Recipe',
        content_json: {
          title: 'Test Recipe',
          ingredients: ['2 cups flour', '1 cup sugar', '3 eggs'],
          instructions: ['Mix ingredients', 'Bake'],
        },
        tags: ['test'],
      },
    });
    recipeId = recipe.id;

    // Create meal plan with item
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId: testUser.profile.id,
        weekStartDate: new Date(),
      },
    });
    mealPlanId = mealPlan.id;

    const mealPlanItem = await prisma.mealPlanItem.create({
      data: {
        mealPlanId: mealPlan.id,
        day: 0,
        mealSlot: 'breakfast',
        recipeId: recipe.id,
      },
    });
    mealPlanItemId = mealPlanItem.id;
  });

  afterAll(async () => {
    await prisma.mealPlanItem.deleteMany({ where: { mealPlanId } });
    await prisma.mealPlan.delete({ where: { id: mealPlanId } }).catch(() => {});
    await prisma.recipe.delete({ where: { id: recipeId } }).catch(() => {});
    await cleanupTestUser(testUser.profile.id);
  });

  describe('GET /grocery-list', () => {
    it('should get or create grocery list for user', async () => {
      const response = await request(app)
        .get('/grocery-list')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId: testUser.profile.id,
        meals: expect.any(Array),
        customItems: expect.any(Array),
      });
    });

    it('should return 401 for guest users', async () => {
      await request(app)
        .get('/grocery-list')
        .expect(401);
    });
  });

  describe('POST /grocery-list/meals', () => {
    it('should add meals to grocery list', async () => {
      const response = await request(app)
        .post('/grocery-list/meals')
        .set('Authorization', testUser.authHeader)
        .send({
          mealPlanItemIds: [mealPlanItemId],
        })
        .expect(200);

      expect(response.body.meals).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            mealPlanItemId,
            day: 0,
            mealSlot: 'breakfast',
          })
        ])
      );
    });

    it('should return 400 for empty meal list', async () => {
      await request(app)
        .post('/grocery-list/meals')
        .set('Authorization', testUser.authHeader)
        .send({
          mealPlanItemIds: [],
        })
        .expect(400);
    });
  });

  describe('DELETE /grocery-list/meals/:mealPlanItemId', () => {
    it('should remove meal from grocery list', async () => {
      // First add the meal
      await request(app)
        .post('/grocery-list/meals')
        .set('Authorization', testUser.authHeader)
        .send({
          mealPlanItemIds: [mealPlanItemId],
        });

      // Then remove it
      await request(app)
        .delete(`/grocery-list/meals/${mealPlanItemId}`)
        .set('Authorization', testUser.authHeader)
        .expect(204);
    });

    it('should return 204 for non-existent meal', async () => {
      await request(app)
        .delete('/grocery-list/meals/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .expect(204);
    });
  });

  describe('POST /grocery-list/items', () => {
    it('should add custom item to list', async () => {
      const response = await request(app)
        .post('/grocery-list/items')
        .set('Authorization', testUser.authHeader)
        .send({
          name: 'Milk',
          quantity: '1 gallon',
          category: 'Dairy',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Milk',
        quantity: '1 gallon',
        category: 'Dairy',
        checked: false,
      });
    });

    it('should add item without optional fields', async () => {
      const response = await request(app)
        .post('/grocery-list/items')
        .set('Authorization', testUser.authHeader)
        .send({
          name: 'Bread',
        })
        .expect(201);

      expect(response.body.name).toBe('Bread');
      expect(response.body.quantity).toBeFalsy();
    });
  });

  describe('PATCH /grocery-list/items/:itemId', () => {
    let itemId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/grocery-list/items')
        .set('Authorization', testUser.authHeader)
        .send({
          name: 'Eggs',
          quantity: '1 dozen',
        });

      itemId = response.body.id;
    });

    it('should update custom item', async () => {
      const response = await request(app)
        .patch(`/grocery-list/items/${itemId}`)
        .set('Authorization', testUser.authHeader)
        .send({
          quantity: '2 dozen',
          checked: true,
        })
        .expect(200);

      expect(response.body.quantity).toBe('2 dozen');
      expect(response.body.checked).toBe(true);
    });

    it('should return 500 for non-existent item', async () => {
      await request(app)
        .patch('/grocery-list/items/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .send({ checked: true })
        .expect(500);
    });
  });

  describe('DELETE /grocery-list/items/:itemId', () => {
    let itemId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/grocery-list/items')
        .set('Authorization', testUser.authHeader)
        .send({
          name: 'Butter',
        });

      itemId = response.body.id;
    });

    it('should delete custom item', async () => {
      await request(app)
        .delete(`/grocery-list/items/${itemId}`)
        .set('Authorization', testUser.authHeader)
        .expect(204);
    });

    it('should return 204 for non-existent item', async () => {
      await request(app)
        .delete('/grocery-list/items/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .expect(204);
    });
  });

  describe('DELETE /grocery-list', () => {
    beforeEach(async () => {
      // Add some items to clear
      await request(app)
        .post('/grocery-list/meals')
        .set('Authorization', testUser.authHeader)
        .send({ mealPlanItemIds: [mealPlanItemId] });

      await request(app)
        .post('/grocery-list/items')
        .set('Authorization', testUser.authHeader)
        .send({ name: 'Test Item' });
    });

    it('should clear entire grocery list', async () => {
      await request(app)
        .delete('/grocery-list')
        .set('Authorization', testUser.authHeader)
        .expect(204);
    });
  });
});
