// src/app.ts
import express, { json, urlencoded } from "express";
import { RegisterRoutes } from "../build/routes";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import { ensureGuest } from "./middlewares/ensureGuest";

dotenv.config();

export const prisma = new PrismaClient({ log: ["error"] });
export const app = express();

app.set("trust proxy", 1);
app.set("etag", false);

// ── CORS FIRST ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_ORIGIN,        // "https://www.monamichef.com"
  process.env.CORS_ORIGIN,            // keep as backup
  "https://monamichef.com",           // allow apex too
].filter(Boolean) as string[];

console.log("[BOOT] Allowed CORS origins:", ALLOWED_ORIGINS);

const corsCfg = cors({
  origin: (origin, cb) => {
    // allow non-browser requests (curl/health) where origin is undefined
    if (!origin) return cb(null, true);
    const ok = ALLOWED_ORIGINS.includes(origin);
    if (!ok) console.warn("[CORS] Blocked Origin:", origin);
    cb(null, ok);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
});

app.use((req, _res, next) => {
  // helpful log to confirm what browser is sending
  if (req.method === "OPTIONS") {
    console.log("[PRELIGHT]", req.method, req.originalUrl, "Origin:", req.headers.origin);
  }
  next();
});

app.use(corsCfg);
// ANSWER PREFLIGHTS EXPLICITLY
app.options("*", corsCfg);

// ── COOKIES / CHAT MIDDLEWARE ────────────────────────────────────────────────
app.use(cookieParser());

app.use(
  "/chat",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, private, max-age=0, must-revalidate");
    res.setHeader("Vary", "Authorization, Cookie");
    if (req.method === "OPTIONS") return res.sendStatus(204); // preflight ends here
    next();
  },
  ensureGuest
);

// ── BODY PARSERS + ROUTES ────────────────────────────────────────────────────
app.use(urlencoded({ extended: true }));
app.use(json());

RegisterRoutes(app);

