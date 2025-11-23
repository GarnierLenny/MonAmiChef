import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
  try {
    // Query to list all tables in all schemas
    const tables = await prisma.$queryRaw<any[]>`
      SELECT schemaname, tablename
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename;
    `;

    console.log('All tables in database:');
    let currentSchema = '';
    tables.forEach((t) => {
      if (t.schemaname !== currentSchema) {
        currentSchema = t.schemaname;
        console.log(`\n${currentSchema}:`);
      }
      console.log(`  - ${t.tablename}`);
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables()
  .then(() => {
    console.log('\nCheck completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
