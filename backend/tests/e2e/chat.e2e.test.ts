import request from 'supertest';
import { app } from '../test-prisma';
import {
  createTestUser,
  cleanupTestUser,
} from './helpers/auth.helper';

describe('ChatController E2E Tests', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeAll(async () => {
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestUser(testUser.profile.id);
  });

  describe('GET /chat/health', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/chat/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        environment: expect.any(String),
      });
    });
  });

  describe('GET /chat/conversations', () => {
    it('should return empty array for new user', async () => {
      const newUser = await createTestUser({ email: `noconvos-${Date.now()}@example.com` });

      const response = await request(app)
        .get('/chat/conversations')
        .set('Authorization', newUser.authHeader)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);

      await cleanupTestUser(newUser.profile.id);
    });
  });

  describe('GET /chat/conversations/:id/messages', () => {
    it('should return 404 for non-existent conversation', async () => {
      await request(app)
        .get('/chat/conversations/00000000-0000-0000-0000-000000000000/messages')
        .set('Authorization', testUser.authHeader)
        .expect(404);
    });
  });

  describe('PATCH /chat/conversations/:id', () => {
    it('should return 404 for non-existent conversation', async () => {
      await request(app)
        .patch('/chat/conversations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .send({ newTitle: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /chat/conversations/:id', () => {
    it('should return 404 for non-existent conversation', async () => {
      await request(app)
        .delete('/chat/conversations/00000000-0000-0000-0000-000000000000')
        .set('Authorization', testUser.authHeader)
        .expect(404);
    });
  });

  // Note: POST /chat/conversations (conversation creation with AI)
  // Note: POST /chat/conversations/:id (send message with AI)
  // Note: POST /chat/generate-meal-recipe (AI recipe generation)
  // Note: POST /chat/transcribe (audio transcription)
  // These endpoints are not tested in e2e because they:
  // - Require Google Gemini API calls (expensive, slow)
  // - Are better suited for integration tests with mocked AI responses
  // - Would significantly increase test execution time
});
