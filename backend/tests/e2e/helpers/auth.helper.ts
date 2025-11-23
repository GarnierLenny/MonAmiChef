import { prisma } from '../../test-prisma';
import { randomUUID } from 'crypto';

/**
 * Create a mock JWT token for testing authenticated requests
 * Format: mock-token-{userId}
 */
export function createMockToken(userId: string): string {
  return `mock-token-${userId}`;
}

/**
 * Create a test user profile in the database
 */
export async function createTestUser(options: {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
} = {}) {
  const userId = options.id || randomUUID();
  const email = options.email || `test-${userId.slice(0, 8)}@example.com`;

  const profile = await prisma.profile.create({
    data: {
      id: userId,
      email,
      display_name: `${options.firstName || 'Test'} ${options.lastName || 'User'}`,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return {
    profile,
    token: createMockToken(userId),
    authHeader: `Bearer ${createMockToken(userId)}`,
  };
}

/**
 * Create a test guest user in the database
 */
export async function createTestGuest() {
  const guestId = randomUUID();
  const conversionToken = randomUUID();

  const guest = await prisma.guest.create({
    data: {
      id: guestId,
      conversion_token: conversionToken,
      created_at: new Date(),
    },
  });

  return {
    guest,
    guestId,
    conversionToken,
    cookieValue: `${guestId}:${conversionToken}`,
  };
}

/**
 * Clean up test user and all related data
 */
export async function cleanupTestUser(userId: string) {
  // Delete in order respecting foreign key constraints
  await prisma.$transaction([
    // Delete health data
    prisma.healthMetric.deleteMany({ where: { profile_id: userId } }),
    prisma.userGoals.deleteMany({ where: { profile_id: userId } }),

    // Delete grocery list data (cascade will handle customItems and meals)
    prisma.groceryList.deleteMany({ where: { userId } }),

    // Delete meal plans (cascade will handle items)
    prisma.mealPlan.deleteMany({ where: { userId } }),

    // Delete saved recipes (recipes are shared, don't delete them)
    prisma.savedRecipe.deleteMany({ where: { owner_profile_id: userId } }),

    // Delete conversations and messages
    prisma.chatMessage.deleteMany({
      where: { Conversation: { owner_profile_id: userId } },
    }),
    prisma.conversation.deleteMany({ where: { owner_profile_id: userId } }),

    // Delete guest conversions
    prisma.guestConversion.deleteMany({ where: { converted_user_id: userId } }),

    // Finally delete the profile
    prisma.profile.delete({ where: { id: userId } }),
  ]);
}

/**
 * Clean up test guest and all related data
 */
export async function cleanupTestGuest(guestId: string) {
  await prisma.$transaction([
    // Delete saved recipes (recipes are shared, don't delete them)
    prisma.savedRecipe.deleteMany({ where: { owner_guest_id: guestId } }),

    // Delete conversations and messages
    prisma.chatMessage.deleteMany({
      where: { Conversation: { owner_guest_id: guestId } },
    }),
    prisma.conversation.deleteMany({ where: { owner_guest_id: guestId } }),

    // Delete guest conversions
    prisma.guestConversion.deleteMany({ where: { guest_id: guestId } }),

    // Finally delete the guest
    prisma.guest.delete({ where: { id: guestId } }),
  ]);
}
