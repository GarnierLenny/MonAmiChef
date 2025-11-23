import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Query to list all tables in public schema
    const tables = await prisma.$queryRaw<any[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('Tables in public schema:');
    tables.forEach((t) => console.log(`  - ${t.tablename}`));

    // Check if GroceryMeal and GroceryList exist
    const groceryListExists = tables.some((t) => t.tablename === 'GroceryList');
    const groceryMealExists = tables.some((t) => t.tablename === 'GroceryMeal');

    console.log('\nGroceryList table exists:', groceryListExists);
    console.log('GroceryMeal table exists:', groceryMealExists);
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkTables()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
