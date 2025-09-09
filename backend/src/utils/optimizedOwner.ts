// src/utils/optimizedOwner.ts - Optimized guest/auth flow
import type { Request, Response } from "express";
import type { AuthUser } from "../authentication";
import { prisma } from "../app";

export type Owner = { 
  userId: string | null; 
  guestId: string | null; 
  conversionToken?: string | null;
  isGuest: boolean;
};

// In-memory cache for guest tokens to avoid DB calls
const guestTokenCache = new Map<string, string>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

interface SessionData {
  guestId: string;
  conversionToken: string;
  created: boolean;
}

function setOptimizedGuestCookie(
  res: Response | undefined, 
  sessionData: SessionData, 
  ctrl?: { setHeader: (k: string, v: string) => void }
) {
  const isDev = process.env.NODE_ENV === 'development';
  const cookieDomain = process.env.COOKIE_DOMAIN || ".monamichef.com";
  
  // Create composite cookie with both guestId and conversion token
  const sessionPayload = `${sessionData.guestId}:${sessionData.conversionToken}`;
  
  const cookieOptions = [
    `guestSession=${sessionPayload}`,
    "HttpOnly",
    "Path=/",
    "Max-Age=31536000", // 1 year
  ];
  
  if (isDev) {
    cookieOptions.push("SameSite=Lax");
  } else {
    cookieOptions.push("SameSite=None");
    cookieOptions.push("Secure");
    cookieOptions.push(`Domain=${cookieDomain}`);
  }
  
  const cookie = cookieOptions.join("; ");
  if (ctrl?.setHeader) {
    ctrl.setHeader("Set-Cookie", cookie);
  } else if (res?.setHeader) {
    res.setHeader("Set-Cookie", cookie);
  } else {
    console.warn('⚠️  Unable to set optimized guest cookie');
  }
}

function parseGuestSession(sessionCookie: string): { guestId: string; conversionToken: string } | null {
  try {
    const [guestId, conversionToken] = sessionCookie.split(':');
    if (guestId && conversionToken) {
      return { guestId, conversionToken };
    }
  } catch (error) {
    console.warn('Failed to parse guest session cookie:', error);
  }
  return null;
}

async function createOptimizedGuest(): Promise<SessionData> {
  const guest = await prisma.guest.create({ 
    data: {},
    select: { id: true, conversion_token: true }
  });
  
  // Cache the token
  guestTokenCache.set(guest.id, guest.conversion_token);
  cacheTimestamps.set(guest.id, Date.now());
  
  console.log('👤 Created optimized guest:', guest.id.slice(0, 8) + '...');
  
  return {
    guestId: guest.id,
    conversionToken: guest.conversion_token,
    created: true
  };
}

async function getGuestToken(guestId: string): Promise<string | null> {
  // Check cache first
  const cached = guestTokenCache.get(guestId);
  const cacheTime = cacheTimestamps.get(guestId);
  
  if (cached && cacheTime && (Date.now() - cacheTime < CACHE_TTL)) {
    return cached;
  }
  
  // Fetch from database if not in cache or expired
  const existingGuest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { conversion_token: true, converted_to_profile: true },
  });
  
  if (existingGuest && !existingGuest.converted_to_profile) {
    // Update cache
    guestTokenCache.set(guestId, existingGuest.conversion_token);
    cacheTimestamps.set(guestId, Date.now());
    return existingGuest.conversion_token;
  }
  
  // Clean up cache if guest not found or converted
  guestTokenCache.delete(guestId);
  cacheTimestamps.delete(guestId);
  return null;
}

export async function resolveOptimizedOwner(
  req: Request,
  res?: Response,
  ctrl?: { setHeader: (k: string, v: string) => void }
): Promise<Owner> {
  const user = (req as any).user as AuthUser | null | undefined;

  // AUTHENTICATED USER - Optimized profile management
  if (user?.sub) {
    const id = user.sub;
    
    // Lazy profile creation - only create if doesn't exist
    const profile = await prisma.profile.findUnique({ where: { id } });
    
    if (!profile) {
      await prisma.profile.create({
        data: {
          id,
          email: user.email ?? null,
        },
      });
      console.log('👤 Created profile for authenticated user:', id.slice(0, 8) + '...');
    } else if (user.email && profile.email !== user.email) {
      // Only update if email has changed
      await prisma.profile.update({
        where: { id },
        data: { 
          email: user.email,
          updated_at: new Date(),
        },
      });
    }

    return { userId: id, guestId: null, conversionToken: null, isGuest: false };
  }

  // GUEST FLOW - Optimized session handling
  const sessionCookie = req.cookies?.guestSession as string | undefined;
  
  // Try to parse existing session
  if (sessionCookie) {
    const session = parseGuestSession(sessionCookie);
    if (session) {
      // Verify token is still valid (use cache)
      const token = await getGuestToken(session.guestId);
      if (token && token === session.conversionToken) {
        console.log('🔄 Reusing guest session:', session.guestId.slice(0, 8) + '...');
        return { 
          userId: null, 
          guestId: session.guestId, 
          conversionToken: token,
          isGuest: true 
        };
      }
    }
  }
  
  // Create new guest session
  const sessionData = await createOptimizedGuest();
  setOptimizedGuestCookie(res, sessionData, ctrl);
  
  return { 
    userId: null, 
    guestId: sessionData.guestId, 
    conversionToken: sessionData.conversionToken,
    isGuest: true 
  };
}

export function ownerWhereOptimized(owner: Owner) {
  return owner.userId
    ? { owner_profile_id: owner.userId }
    : { owner_guest_id: owner.guestId! };
}

// Cache cleanup utility
export function cleanupGuestCache() {
  const now = Date.now();
  for (const [guestId, timestamp] of cacheTimestamps.entries()) {
    if (now - timestamp > CACHE_TTL) {
      guestTokenCache.delete(guestId);
      cacheTimestamps.delete(guestId);
    }
  }
}

// Clean cache every 10 minutes
setInterval(cleanupGuestCache, 10 * 60 * 1000);