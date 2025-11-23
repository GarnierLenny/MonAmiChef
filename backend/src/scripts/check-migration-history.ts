import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMigrationHistory() {
  try {
    const migrations = await prisma.$queryRaw<any[]>`
      SELECT migration_name, finished_at, started_at, applied_steps_count
      FROM _prisma_migrations
      ORDER BY started_at DESC
      LIMIT 15;
    `;

    console.log('Recent migrations:');
    migrations.forEach((m) => {
      console.log(`  - ${m.migration_name}`);
      console.log(`    Started: ${m.started_at}`);
      console.log(`    Finished: ${m.finished_at || 'NOT FINISHED'}`);
      console.log(`    Steps applied: ${m.applied_steps_count}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error checking migration history:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationHistory()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
