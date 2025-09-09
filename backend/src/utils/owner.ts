// src/utils/owner.ts
import type { Request, Response } from "express";
import type { AuthUser } from "../authentication";
import { prisma } from "../app";

export type Owner = { userId: string | null; guestId: string | null; conversionToken?: string | null };

function setGuestCookie(res: Response | undefined, guestId: string, ctrl?: { setHeader: (k: string, v: string) => void }) {
  const isDev = process.env.NODE_ENV === 'development';
  const cookieDomain = process.env.COOKIE_DOMAIN || ".monamichef.com";
  
  const cookieOptions = [
    `guestId=${guestId}`,
    "HttpOnly",
    "Path=/",
    "Max-Age=31536000",
  ];
  
  if (isDev) {
    // Development settings for localhost
    cookieOptions.push("SameSite=Lax");
    // Don't set Domain for localhost
    // Don't set Secure for HTTP localhost
  } else {
    // Production settings
    cookieOptions.push("SameSite=None");
    cookieOptions.push("Secure");
    cookieOptions.push(`Domain=${cookieDomain}`);
  }
  
  const cookie = cookieOptions.join("; ");
  if (ctrl) {
    ctrl.setHeader("Set-Cookie", cookie);
  } else if (res) {
    res.setHeader("Set-Cookie", cookie);
  } else {
    console.warn('⚠️  Unable to set guest cookie - no response object available');
  }
}

export async function resolveOwner(
  req: Request,
  res?: Response,
  ctrl?: { setHeader: (k: string, v: string) => void }
): Promise<Owner> {
  const user = (req as any).user as AuthUser | null | undefined;

  // AUTHENTICATED USER (auth.users.id === public.Profile.id)
  if (user?.sub) {
    const id = user.sub; // Supabase auth user id (UUID)

    // IMPORTANT: Profile.id MUST equal auth.users.id
    // Use upsert to avoid race on unique(id)
    await prisma.profile.upsert({
      where: { id },
      update: {
        // Only update if values are present to avoid clobbering
        email: user.email ?? undefined,
        updated_at: new Date(), // matches your schema field name
      },
      create: {
        id, // MUST match auth.users.id
        email: user.email ?? null,
        // created_at is default(now())
      },
    });

    return { userId: id, guestId: null, conversionToken: null };
  }

  // GUEST FLOW
  let guestId = req.cookies?.guestId as string | undefined;
  let conversionToken: string | null = null;
  
  console.log('🍪 Guest cookie from request:', guestId);
  
  if (!guestId) {
    const guest = await prisma.guest.create({ data: {} }); // public.Guest
    guestId = guest.id;
    conversionToken = guest.conversion_token;
    console.log('👤 Created new guest:', guestId.slice(0, 8) + '...');
    setGuestCookie(res, guestId, ctrl);
  } else {
    // Fetch the conversion token for existing guest
    const existingGuest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { conversion_token: true },
    });
    conversionToken = existingGuest?.conversion_token || null;
    console.log('👤 Found existing guest:', guestId.slice(0, 8) + '...', existingGuest ? '✅' : '❌');
  }
  
  return { userId: null, guestId, conversionToken };
}

export function ownerWhere(owner: Owner) {
  // public.Conversation.owner_profile_id references auth.users.id
  return owner.userId
    ? { owner_profile_id: owner.userId }
    : { owner_guest_id: owner.guestId! };
}

