// Simple UUID mock for testing
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { prisma } from '../test-prisma';

export interface TestUser {
  id: string;
  email: string;
  profile?: any;
}

export interface TestGuest {
  id: string;
  conversionToken: string;
}

/**
 * Create a test user profile for authenticated tests
 */
export async function createTestUser(email?: string): Promise<TestUser> {
  const userId = uuidv4();
  const userEmail = email || `test-${Date.now()}@example.com`;

  const profile = await prisma.profile.create({
    data: {
      id: userId,
      email: userEmail,
      display_name: `Test User ${userId.slice(0, 8)}`,
    }
  });

  return {
    id: userId,
    email: userEmail,
    profile
  };
}

/**
 * Create a test guest for unauthenticated tests
 */
export async function createTestGuest(): Promise<TestGuest> {
  const guest = await prisma.guest.create({
    data: {}
  });

  return {
    id: guest.id,
    conversionToken: guest.conversion_token
  };
}

/**
 * Clean up test user and all related data
 */
export async function cleanupTestUser(userId: string): Promise<void> {
  // Delete in correct order due to foreign key constraints
  await prisma.mealPlanItem.deleteMany({
    where: {
      mealPlan: {
        userId: userId
      }
    }
  });

  await prisma.mealPlan.deleteMany({
    where: { userId: userId }
  });

  await prisma.savedRecipe.deleteMany({
    where: { owner_profile_id: userId }
  });


  await prisma.chatMessage.deleteMany({
    where: {
      Conversation: {
        owner_profile_id: userId
      }
    }
  });

  await prisma.conversation.deleteMany({
    where: { owner_profile_id: userId }
  });

  await prisma.profile.delete({
    where: { id: userId }
  });
}

/**
 * Clean up test guest and all related data
 */
export async function cleanupTestGuest(guestId: string): Promise<void> {
  await prisma.savedRecipe.deleteMany({
    where: { owner_guest_id: guestId }
  });


  await prisma.chatMessage.deleteMany({
    where: {
      Conversation: {
        owner_guest_id: guestId
      }
    }
  });

  await prisma.conversation.deleteMany({
    where: { owner_guest_id: guestId }
  });

  await prisma.guest.delete({
    where: { id: guestId }
  });
}

/**
 * Mock authenticated request user object
 */
export function mockAuthUser(user: TestUser) {
  return {
    sub: user.id,
    email: user.email,
    aud: 'authenticated',
    role: 'authenticated'
  };
}