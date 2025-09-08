import type { Request } from 'express';
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export interface AuthUser { sub: string; email?: string; groups?: string[] }

export async function expressAuthentication(
  request: Request,
  securityName: string,
): Promise<AuthUser | null> {
  const h = request.header('authorization');
  const token = h?.startsWith('Bearer ') ? h.slice(7) : undefined;

  if (securityName === 'bearerAuth') {
    if (!token) throw new Error('No token provided');
    return jwt.verify(token, SUPABASE_JWT_SECRET) as AuthUser;
  }
  if (securityName === 'optionalAuth') {
    if (!token) return null;
    try { return jwt.verify(token, SUPABASE_JWT_SECRET) as AuthUser; }
    catch { return null; } // treat as guest
  }
  throw new Error(`Unknown security: ${securityName}`);
}

