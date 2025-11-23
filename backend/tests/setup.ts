import { prisma } from './test-prisma';

// Mock authentication before importing anything else
jest.mock('../src/authentication', () => {
  const originalModule = jest.requireActual('../src/authentication');
  return {
    ...originalModule,
    expressAuthentication: async (request: any, securityName: string) => {
      const h = request.header('authorization');
      const token = h?.startsWith('Bearer ') ? h.slice(7) : undefined;

      if (securityName === 'bearerAuth') {
        if (!token) throw new Error('No token provided');
        return extractMockUser(token);
      }

      if (securityName === 'optionalAuth') {
        if (!token) return null;
        try {
          return extractMockUser(token);
        } catch {
          return null;
        }
      }

      throw new Error(`Unknown security: ${securityName}`);
    }
  };
});

function extractMockUser(token: string) {
  if (!token.startsWith('mock-token-')) {
    throw new Error('Invalid mock token format');
  }

  const userId = token.replace('mock-token-', '');
  return {
    sub: userId,
    email: `test-${userId.slice(0, 8)}@example.com`,
    groups: []
  };
}

// Setup for tests
beforeAll(async () => {
  // Clean up test data if needed
  process.env.NODE_ENV = 'test';

  // Disable CORS logging in tests
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(async () => {
  // Cleanup after all tests
  await prisma.$disconnect();
});

// Global test timeout
jest.setTimeout(30000);