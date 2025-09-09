// src/utils/owner.ts
import type { Request, Response } from "express";
import type { AuthUser } from "../authentication";
import { prisma } from "../app";

export type Owner = { userId: string | null; guestId: string | null; conversionToken?: string | null };

function setGuestCookie(res: Response, guestId: string, ctrl?: { setHeader: (k: string, v: string) => void }) {
  const cookieDomain = process.env.COOKIE_DOMAIN || ".monamichef.com";
  const cookie = [
    `guestId=${guestId}`,
    "HttpOnly",
    "Path=/",
    "Max-Age=31536000",
    "SameSite=None", // force cross-site safe in prod
    "Secure",
    `Domain=${cookieDomain}`,
  ].join("; ");
  if (ctrl) ctrl.setHeader("Set-Cookie", cookie);
  else res.setHeader("Set-Cookie", cookie);
}

export async function resolveOwner(
  req: Request,
  res: Response,
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
  
  if (!guestId) {
    const guest = await prisma.guest.create({ data: {} }); // public.Guest
    guestId = guest.id;
    conversionToken = guest.conversion_token;
    setGuestCookie(res, guestId, ctrl);
  } else {
    // Fetch the conversion token for existing guest
    const existingGuest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { conversion_token: true },
    });
    conversionToken = existingGuest?.conversion_token || null;
  }
  
  return { userId: null, guestId, conversionToken };
}

export function ownerWhere(owner: Owner) {
  // public.Conversation.owner_profile_id references auth.users.id
  return owner.userId
    ? { owner_profile_id: owner.userId }
    : { owner_guest_id: owner.guestId! };
}

