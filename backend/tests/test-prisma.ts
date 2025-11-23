import { PrismaClient } from '@prisma/client';

// Create a shared Prisma client for all tests
export const prisma = new PrismaClient({ log: ['error'] });

// Helper to get initialized app from global scope
// App is initialized in tests/e2e/setup.ts beforeAll
export function getAppInstance() {
  const appFromGlobal = (global as any).app;
  if (!appFromGlobal) {
    throw new Error('Test app not initialized. Make sure setup.ts has run.');
  }
  return appFromGlobal;
}

// Re-export app as a getter property
Object.defineProperty(exports, 'app', {
  get() {
    return getAppInstance();
  },
  enumerable: true,
  configurable: true
});
