import type { Request, Response, NextFunction } from "express";
import { prisma } from "../app";

export async function ensureGuest(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS" || req.method === "HEAD") return next();
  // never cache these (prevents 304 swallowing Set-Cookie)
  res.setHeader("Cache-Control", "no-store, private, max-age=0, must-revalidate");
  res.setHeader("Vary", "Authorization, Cookie");

  const user = (req as any).user as { sub?: string } | null | undefined;
  if (user?.sub) return next();

  if (req.cookies?.guestId) return next();

  const guest = await prisma.guest.create({ data: {} });

  const reqOrigin = req.get("origin") || ""; // e.g. https://www.monamichef.com
  const apiOrigin = `${req.protocol}://${req.get("host")}`; // e.g. https://meal-planner-back-production.up.railway.app
  const crossSite = reqOrigin && reqOrigin !== apiOrigin;

  // IMPORTANT: set your apex domain for subdomains
  const cookieDomain = process.env.COOKIE_DOMAIN || ".monamichef.com";

  const parts = [
    `guestId=${guest.id}`,
    "Path=/",
    "HttpOnly",
    "Max-Age=31536000",
    crossSite ? "SameSite=None" : "SameSite=Lax",
    (process.env.NODE_ENV === "production" || crossSite) ? "Secure" : null,
    cookieDomain ? `Domain=${cookieDomain}` : null,
  ].filter(Boolean);

  res.setHeader("Set-Cookie", parts.join("; "));
  next();
}
