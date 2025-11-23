import request from 'supertest';
import { app, prisma } from '../test-prisma';
import {
  createTestUser,
  createTestGuest,
  cleanupTestUser,
  cleanupTestGuest,
} from './helpers/auth.helper';

describe('AuthController E2E Tests', () => {
  describe('GET /auth/status', () => {
    describe('Authenticated User', () => {
      let testUser: Awaited<ReturnType<typeof createTestUser>>;

      beforeAll(async () => {
        testUser = await createTestUser();
      });

      afterAll(async () => {
        await cleanupTestUser(testUser.profile.id);
      });

      it('should return authenticated status for valid JWT token', async () => {
        const response = await request(app)
          .get('/auth/status')
          .set('Authorization', testUser.authHeader)
          .expect(200);

        expect(response.body).toEqual({
          isGuest: false,
        });
      });
    });

    describe('Guest User', () => {
      let testGuest: Awaited<ReturnType<typeof createTestGuest>>;

      beforeAll(async () => {
        testGuest = await createTestGuest();
      });

      afterAll(async () => {
        await cleanupTestGuest(testGuest.guestId);
      });

      it('should return guest status with no conversations', async () => {
        const response = await request(app)
          .get('/auth/status')
          .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
          .expect(200);

        expect(response.body).toEqual({
          isGuest: true,
          guestId: testGuest.guestId,
          conversationCount: 0,
          canConvert: false,
        });
      });

      it('should return canConvert=true when guest has conversations', async () => {
        // Create a conversation for the guest
        const conversation = await prisma.conversation.create({
          data: {
            owner_guest_id: testGuest.guestId,
            title: 'Test Conversation',
          },
        });

        const response = await request(app)
          .get('/auth/status')
          .set('Cookie', [`guestSession=${testGuest.cookieValue}`])
          .expect(200);

        expect(response.body).toEqual({
          isGuest: true,
          guestId: testGuest.guestId,
          conversationCount: 1,
          canConvert: true,
        });

        // Cleanup
        await prisma.conversation.delete({ where: { id: conversation.id } });
      });
    });

    describe('No Authentication', () => {
      it('should return default guest status when no session exists', async () => {
        const response = await request(app)
          .get('/auth/status')
          .expect(200);

        expect(response.body).toEqual({
          isGuest: true,
          conversationCount: 0,
          canConvert: false,
        });
      });
    });
  });

  describe('POST /auth/convert-guest', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;
    let testGuest: Awaited<ReturnType<typeof createTestGuest>>;

    beforeEach(async () => {
      testUser = await createTestUser();
      testGuest = await createTestGuest();
    });

    afterEach(async () => {
      await cleanupTestUser(testUser.profile.id);
      await cleanupTestGuest(testGuest.guestId).catch(() => {
        // Guest might already be deleted by conversion
      });
    });

    it('should successfully convert guest with valid credentials', async () => {
      // Create a conversation for the guest
      const conversation = await prisma.conversation.create({
        data: {
          owner_guest_id: testGuest.guestId,
          title: 'Guest Conversation',
        },
      });

      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: testGuest.guestId,
          conversion_token: testGuest.conversionToken,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('Successfully converted'),
        data: {
          conversationsTransferred: 1,
          profile: {
            id: testUser.profile.id,
            email: testUser.profile.email,
          },
        },
      });

      // Verify conversation ownership was transferred
      const updatedConversation = await prisma.conversation.findUnique({
        where: { id: conversation.id },
      });

      expect(updatedConversation?.owner_profile_id).toBe(testUser.profile.id);
      expect(updatedConversation?.owner_guest_id).toBeNull();

      // Verify guest is marked as converted
      const updatedGuest = await prisma.guest.findUnique({
        where: { id: testGuest.guestId },
      });

      expect(updatedGuest?.converted_to_profile).toBe(true);
      expect(updatedGuest?.converted_user_id).toBe(testUser.profile.id);

      // Verify audit record was created
      const conversion = await prisma.guestConversion.findFirst({
        where: {
          guest_id: testGuest.guestId,
          converted_user_id: testUser.profile.id,
        },
      });

      expect(conversion).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/auth/convert-guest')
        .send({
          guest_id: testGuest.guestId,
          conversion_token: testGuest.conversionToken,
        })
        .expect(401);

      // TSOA should reject unauthenticated requests
      expect(response.body || response.text).toBeDefined();
    });

    it('should return 400 with missing guest_id', async () => {
      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          conversion_token: testGuest.conversionToken,
        })
        .expect(400);

      // TSOA validation returns empty body for missing required fields
      expect(response.body).toBeDefined();
    });

    it('should return 400 with missing conversion_token', async () => {
      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: testGuest.guestId,
        })
        .expect(400);

      // TSOA validation returns empty body for missing required fields
      expect(response.body).toBeDefined();
    });

    it('should return 404 for non-existent guest', async () => {
      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: '00000000-0000-0000-0000-000000000000',
          conversion_token: 'fake-token',
        })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Guest not found',
      });
    });

    it('should return 403 for invalid conversion token', async () => {
      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: testGuest.guestId,
          conversion_token: 'wrong-token',
        })
        .expect(403);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid conversion token',
      });
    });

    it('should be idempotent - allow re-conversion to same user', async () => {
      // First conversion
      await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: testGuest.guestId,
          conversion_token: testGuest.conversionToken,
        })
        .expect(200);

      // Second conversion to same user should succeed
      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: testGuest.guestId,
          conversion_token: testGuest.conversionToken,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('already converted'),
      });
    });

    it('should return 409 when guest already converted to different user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });

      // Convert guest to first user
      await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', testUser.authHeader)
        .send({
          guest_id: testGuest.guestId,
          conversion_token: testGuest.conversionToken,
        })
        .expect(200);

      // Try to convert same guest to different user
      const response = await request(app)
        .post('/auth/convert-guest')
        .set('Authorization', `Bearer ${createMockToken(otherUser.profile.id)}`)
        .send({
          guest_id: testGuest.guestId,
          conversion_token: testGuest.conversionToken,
        })
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('already converted to different user'),
      });

      // Cleanup
      await cleanupTestUser(otherUser.profile.id);
    });
  });
});

// Import createMockToken for the last test
function createMockToken(userId: string): string {
  return `mock-token-${userId}`;
}
