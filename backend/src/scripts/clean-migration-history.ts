import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanMigrationHistory() {
  try {
    console.log('Cleaning up broken migration records...');

    // Delete the failed migration attempts
    await prisma.$executeRawUnsafe(`
      DELETE FROM _prisma_migrations
      WHERE migration_name IN ('add_grocery_list', '20251123205656_add_grocery_meal_foreign_key');
    `);

    console.log('Migration history cleaned');
  } catch (error) {
    console.error('Error cleaning migration history:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanMigrationHistory()
  .then(() => {
    console.log('\nCompleted successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
