import type { Request } from 'express';
import { AuthUser } from '../../src/authentication';

/**
 * Mock authentication for testing
 * Extracts user ID from mock Bearer token format: "Bearer mock-token-{userId}"
 */
export async function mockExpressAuthentication(
  request: Request,
  securityName: string,
): Promise<AuthUser | null> {
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
      return null; // treat as guest
    }
  }

  throw new Error(`Unknown security: ${securityName}`);
}

function extractMockUser(token: string): AuthUser {
  // Extract user ID from mock token format: "mock-token-{userId}"
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

/**
 * Setup mock authentication for tests
 * This replaces the real authentication with our mock version
 */
export function setupMockAuth() {
  // Mock the authentication module
  jest.mock('../../src/authentication', () => ({
    expressAuthentication: mockExpressAuthentication
  }));
}