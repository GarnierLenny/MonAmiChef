import { prisma } from '../../test-prisma';

/**
 * Clean up all test data from the database
 * Use this in afterAll() hooks for comprehensive cleanup
 */
export async function cleanupAllTestData() {
  // Delete all data in reverse dependency order
  await prisma.$transaction([
    // Health metrics
    prisma.healthMetric.deleteMany({}),
    prisma.userGoals.deleteMany({}),

    // Grocery lists
    prisma.customGroceryItem.deleteMany({}),
    prisma.groceryMeal.deleteMany({}),
    prisma.groceryList.deleteMany({}),

    // Meal plans
    prisma.mealPlanItem.deleteMany({}),
    prisma.mealPlan.deleteMany({}),

    // Recipes
    prisma.savedRecipe.deleteMany({}),
    prisma.recipe.deleteMany({}),

    // Conversations
    prisma.chatMessage.deleteMany({}),
    prisma.conversation.deleteMany({}),

    // Guest conversions
    prisma.guestConversion.deleteMany({}),

    // Users and guests (if they exist)
    // Note: In production, profiles come from Supabase auth
    // In tests, we create them directly
  ]);
}

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Get counts of all main entities (useful for debugging tests)
 */
export async function getDatabaseCounts() {
  const [
    profiles,
    guests,
    conversations,
    messages,
    recipes,
    mealPlans,
    groceryLists,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.guest.count(),
    prisma.conversation.count(),
    prisma.chatMessage.count(),
    prisma.recipe.count(),
    prisma.mealPlan.count(),
    prisma.groceryList.count(),
  ]);

  return {
    profiles,
    guests,
    conversations,
    messages,
    recipes,
    mealPlans,
    groceryLists,
  };
}
