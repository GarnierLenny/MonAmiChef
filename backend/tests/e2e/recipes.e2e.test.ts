import request from 'supertest';
import { app, prisma } from '../test-prisma';
import {
  createTestUser,
  createTestGuest,
  cleanupTestUser,
  cleanupTestGuest,
} from './helpers/auth.helper';

describe('RecipeController E2E Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testGuest: Awaited<ReturnType<typeof createTestGuest>>;
  let testRecipeId: string;

  const sampleRecipe = {
    title: 'Chocolate Chip Cookies',
    content_json: {
      title: 'Chocolate Chip Cookies',
      ingredients: [
        '2 cups all-purpose flour',
        '1 cup butter',
        '3/4 cup sugar',
        '2 eggs',
        '2 cups chocolate chips',
      ],
      instructions: [
        'Preheat oven to 375°F',
        'Mix butter and sugar',
        'Add eggs and flour',
        'Fold in chocolate chips',
        'Bake for 10-12 minutes',
      ],
      tips: ['Do not overbake', 'Let cool for 5 minutes'],
      servings: 24,
      prepTime: '15 minutes',
      cookTime: '12 minutes',
      totalTime: '27 minutes',
    },
    nutrition: {
      calories: 150,
      protein: 2,
      carbs: 20,
      fat: 7,
      fiber: 1,
      sugar: 12,
      rating: 'B' as const,
    },
    tags: ['dessert', 'baking', 'cookies'],
  };

  beforeAll(async () => {
    testUser = await createTestUser();
    testGuest = await createTestGuest();
  });

  afterAll(async () => {
    // Clean up test recipes
    if (testRecipeId) {
      await prisma.savedRecipe.deleteMany({ where: { recipe_id: testRecipeId } });
      await prisma.recipe.delete({ where: { id: testRecipeId } }).catch(() => {});
    }

    await cleanupTestUser(testUser.profile.id);
    await cleanupTestGuest(testGuest.guestId);
  });

  describe('POST /recipes', () => {
    it('should create a recipe as authenticated user', async () => {
      const response = await request(app)
        .post('/recipes')
        .set('Authorization', testUser.authHeader)
        .send(sampleRecipe)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: sampleRecipe.title,
        content_json: sampleRecipe.content_json,
        nutrition: sampleRecipe.nutrition,
        tags: sampleRecipe.tags,
        created_at: expect.any(String),
      });

      // Save recipe ID for other tests
      testRecipeId = response.body.id;

      // Verify in database
      const dbRecipe = await prisma.recipe.findUnique({
        where: { id: testRecipeId },
      });
      expect(dbRecipe).toBeTruthy();
      expect(dbRecipe?.title).toBe(sampleRecipe.title);
    });

    it('should create a recipe as guest', async () => {
      const response = await request(app)
        .post('/recipes')
        .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
        .send({
          ...sampleRecipe,
          title: 'Guest Recipe',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: 'Guest Recipe',
        tags: sampleRecipe.tags,
      });

      // Cleanup
      await prisma.recipe.delete({ where: { id: response.body.id } });
    });

    it('should create a recipe without optional fields', async () => {
      const minimalRecipe = {
        title: 'Minimal Recipe',
        content_json: {
          title: 'Minimal Recipe',
          ingredients: ['ingredient 1'],
          instructions: ['step 1'],
        },
        tags: [],
      };

      const response = await request(app)
        .post('/recipes')
        .set('Authorization', testUser.authHeader)
        .send(minimalRecipe)
        .expect(200);

      expect(response.body.nutrition).toBeFalsy();

      // Cleanup
      await prisma.recipe.delete({ where: { id: response.body.id } });
    });
  });

  describe('GET /recipes/saved', () => {
    let savedRecipeId: string;

    beforeAll(async () => {
      // Create a recipe and save it
      const recipe = await prisma.recipe.create({
        data: sampleRecipe,
      });
      savedRecipeId = recipe.id;

      await prisma.savedRecipe.create({
        data: {
          owner_profile_id: testUser.profile.id,
          recipe_id: savedRecipeId,
        },
      });
    });

    afterAll(async () => {
      await prisma.savedRecipe.deleteMany({ where: { recipe_id: savedRecipeId } });
      await prisma.recipe.delete({ where: { id: savedRecipeId } }).catch(() => {});
    });

    it('should get saved recipes for authenticated user', async () => {
      const response = await request(app)
        .get('/recipes/saved')
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      const savedRecipe = response.body.find((r: any) => r.recipe.id === savedRecipeId);
      expect(savedRecipe).toBeTruthy();
      expect(savedRecipe.recipe).toMatchObject({
        id: savedRecipeId,
        title: sampleRecipe.title,
        is_saved: true,
      });
    });

    it('should return 500 for guest users', async () => {
      await request(app)
        .get('/recipes/saved')
        .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
        .expect(500);
    });

    it('should return empty array when user has no saved recipes', async () => {
      const newUser = await createTestUser({ email: `nosaved-${Date.now()}@example.com` });

      const response = await request(app)
        .get('/recipes/saved')
        .set('Authorization', newUser.authHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      await cleanupTestUser(newUser.profile.id);
    });
  });

  describe('GET /recipes/:recipeId', () => {
    let recipeId: string;

    beforeAll(async () => {
      const recipe = await prisma.recipe.create({
        data: sampleRecipe,
      });
      recipeId = recipe.id;
    });

    afterAll(async () => {
      await prisma.savedRecipe.deleteMany({ where: { recipe_id: recipeId } });
      await prisma.recipe.delete({ where: { id: recipeId } }).catch(() => {});
    });

    it('should get a recipe by ID', async () => {
      const response = await request(app)
        .get(`/recipes/${recipeId}`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toMatchObject({
        id: recipeId,
        title: sampleRecipe.title,
        content_json: sampleRecipe.content_json,
        nutrition: sampleRecipe.nutrition,
        tags: sampleRecipe.tags,
        is_saved: false,
      });
    });

    it('should show is_saved=true when recipe is saved', async () => {
      // Save the recipe
      await prisma.savedRecipe.create({
        data: {
          owner_profile_id: testUser.profile.id,
          recipe_id: recipeId,
        },
      });

      const response = await request(app)
        .get(`/recipes/${recipeId}`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body.is_saved).toBe(true);

      // Cleanup
      await prisma.savedRecipe.deleteMany({
        where: { recipe_id: recipeId, owner_profile_id: testUser.profile.id },
      });
    });

    it('should return 500 for non-existent recipe', async () => {
      await request(app)
        .get('/recipes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .expect(500);
    });

    it('should work for guest users', async () => {
      const response = await request(app)
        .get(`/recipes/${recipeId}`)
        .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
        .expect(200);

      expect(response.body.id).toBe(recipeId);
      expect(response.body.is_saved).toBe(false);
    });
  });

  describe('POST /recipes/:recipeId/save', () => {
    let recipeId: string;

    beforeAll(async () => {
      const recipe = await prisma.recipe.create({
        data: sampleRecipe,
      });
      recipeId = recipe.id;
    });

    afterAll(async () => {
      await prisma.savedRecipe.deleteMany({ where: { recipe_id: recipeId } });
      await prisma.recipe.delete({ where: { id: recipeId } }).catch(() => {});
    });

    it('should save a recipe for authenticated user', async () => {
      const response = await request(app)
        .post(`/recipes/${recipeId}/save`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        is_saved: true,
      });

      // Verify in database
      const savedRecipe = await prisma.savedRecipe.findFirst({
        where: { recipe_id: recipeId, owner_profile_id: testUser.profile.id },
      });
      expect(savedRecipe).toBeTruthy();
    });

    it('should keep save state when already saved', async () => {
      // First save
      await request(app)
        .post(`/recipes/${recipeId}/save`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      // Save again (should remain saved, not toggle)
      const response = await request(app)
        .post(`/recipes/${recipeId}/save`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        is_saved: true,
      });

      // Verify still in database
      const savedRecipe = await prisma.savedRecipe.findFirst({
        where: { recipe_id: recipeId, owner_profile_id: testUser.profile.id },
      });
      expect(savedRecipe).toBeTruthy();

      // Cleanup
      await prisma.savedRecipe.deleteMany({
        where: { recipe_id: recipeId, owner_profile_id: testUser.profile.id },
      });
    });

    it('should return 500 for guest users', async () => {
      await request(app)
        .post(`/recipes/${recipeId}/save`)
        .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
        .expect(500);
    });

    it('should return 500 for non-existent recipe', async () => {
      await request(app)
        .post('/recipes/00000000-0000-0000-0000-000000000000/save')
        .set('Authorization', testUser.authHeader)
        .expect(500);
    });
  });

  describe('DELETE /recipes/:recipeId/save', () => {
    let recipeId: string;

    beforeAll(async () => {
      const recipe = await prisma.recipe.create({
        data: sampleRecipe,
      });
      recipeId = recipe.id;
    });

    afterAll(async () => {
      await prisma.savedRecipe.deleteMany({ where: { recipe_id: recipeId } });
      await prisma.recipe.delete({ where: { id: recipeId } }).catch(() => {});
    });

    it('should unsave a saved recipe', async () => {
      // First save it
      await prisma.savedRecipe.create({
        data: {
          owner_profile_id: testUser.profile.id,
          recipe_id: recipeId,
        },
      });

      const response = await request(app)
        .delete(`/recipes/${recipeId}/save`)
        .set('Authorization', testUser.authHeader)
        .expect(200);

      expect(response.body).toEqual({ success: true });

      // Verify removed from database
      const savedRecipe = await prisma.savedRecipe.findFirst({
        where: { recipe_id: recipeId, owner_profile_id: testUser.profile.id },
      });
      expect(savedRecipe).toBeFalsy();
    });

    it('should return 500 when recipe not saved', async () => {
      await request(app)
        .delete(`/recipes/${recipeId}/save`)
        .set('Authorization', testUser.authHeader)
        .expect(500);
    });

    it('should return 500 for guest users', async () => {
      await request(app)
        .delete(`/recipes/${recipeId}/save`)
        .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
        .expect(500);
    });
  });
});
