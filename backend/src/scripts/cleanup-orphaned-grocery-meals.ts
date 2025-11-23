import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedGroceryMeals() {
  console.log('Starting cleanup of orphaned GroceryMeal records...');

  try {
    // Find all GroceryMeal records
    const allGroceryMeals = await prisma.groceryMeal.findMany({
      select: {
        id: true,
        mealPlanItemId: true,
      },
    });

    console.log(`Found ${allGroceryMeals.length} GroceryMeal records`);

    // Find all existing MealPlanItem IDs
    const existingMealPlanItemIds = new Set(
      (
        await prisma.mealPlanItem.findMany({
          select: { id: true },
        })
      ).map((item) => item.id)
    );

    console.log(`Found ${existingMealPlanItemIds.size} MealPlanItem records`);

    // Find orphaned GroceryMeal records
    const orphanedGroceryMeals = allGroceryMeals.filter(
      (meal) => !existingMealPlanItemIds.has(meal.mealPlanItemId)
    );

    if (orphanedGroceryMeals.length === 0) {
      console.log('No orphaned GroceryMeal records found.');
      return;
    }

    console.log(
      `Found ${orphanedGroceryMeals.length} orphaned GroceryMeal records`
    );
    console.log(
      'Orphaned meal IDs:',
      orphanedGroceryMeals.map((m) => m.id)
    );

    // Delete orphaned records
    const deleteResult = await prisma.groceryMeal.deleteMany({
      where: {
        id: {
          in: orphanedGroceryMeals.map((m) => m.id),
        },
      },
    });

    console.log(`Deleted ${deleteResult.count} orphaned GroceryMeal records`);
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupOrphanedGroceryMeals()
    .then(() => {
      console.log('Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

export default cleanupOrphanedGroceryMeals;
