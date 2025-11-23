import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConstraints() {
  try {
    // Query to check existing foreign keys on GroceryMeal table
    const constraints = await prisma.$queryRaw<any[]>`
      SELECT
        con.conname AS constraint_name,
        con.contype AS constraint_type,
        att.attname AS column_name,
        cl.relname AS table_name,
        fcl.relname AS foreign_table_name
      FROM pg_constraint con
      JOIN pg_class cl ON con.conrelid = cl.oid
      JOIN pg_namespace ns ON cl.relnamespace = ns.oid
      LEFT JOIN pg_attribute att ON att.attrelid = cl.oid AND att.attnum = ANY(con.conkey)
      LEFT JOIN pg_class fcl ON con.confrelid = fcl.oid
      WHERE ns.nspname = 'public'
        AND cl.relname = 'GroceryMeal'
      ORDER BY con.conname;
    `;

    console.log('Constraints on GroceryMeal table:');
    console.log(JSON.stringify(constraints, null, 2));

    // Check if the foreign key already exists
    const fkExists = constraints.some(
      (c) => c.constraint_name === 'GroceryMeal_meal_plan_item_id_fkey'
    );

    console.log('\nForeign key to MealPlanItem exists:', fkExists);
  } catch (error) {
    console.error('Error checking constraints:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkConstraints()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
