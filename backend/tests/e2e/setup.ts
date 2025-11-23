import { prisma } from '../test-prisma';
import { getTestServer } from '../test-app';
import { checkDatabaseConnection } from './helpers/database.helper';

// This setup runs before ALL e2e tests

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Disable console logs in tests (optional - comment out for debugging)
  console.log = jest.fn();
  console.warn = jest.fn();

  // Initialize the NestJS app for all e2e tests
  const testApp = await getTestServer();
  // Make app available globally
  (global as any).app = testApp;

  // Verify database connection
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    throw new Error('Cannot connect to test database. Make sure Supabase is running.');
  }
});

afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});

// Increase timeout for e2e tests (they involve real database calls and AI)
jest.setTimeout(30000);
