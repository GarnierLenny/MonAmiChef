import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function applyGroceryListTables() {
  try {
    console.log('Reading migration SQL...');
    const migrationPath = path.join(
      __dirname,
      '../../prisma/migrations/add_grocery_list/migration.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying grocery list tables migration...');
    await prisma.$executeRawUnsafe(sql);

    console.log('Grocery list tables created successfully!');

    // Update the migration record
    await prisma.$executeRawUnsafe(`
      UPDATE _prisma_migrations
      SET applied_steps_count = 1
      WHERE migration_name = 'add_grocery_list'
        AND finished_at IS NOT NULL;
    `);

    console.log('Migration record updated');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyGroceryListTables()
  .then(() => {
    console.log('\nCompleted successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
