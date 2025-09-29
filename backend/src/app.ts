// src/app.ts
import express, { json, urlencoded } from "express";
import { RegisterRoutes } from "../build/routes";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import { performanceMonitor } from "./middlewares/performanceMonitor";

dotenv.config();

export const prisma = new PrismaClient({ log: ["error"] });
export const app = express();

app.set("trust proxy", 1);
app.set("etag", false);

// ── CORS FIRST ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_ORIGIN,        // "https://www.monamichef.com"
  process.env.CORS_ORIGIN,            // keep as backup
  "https://www.monamichef.com",       // explicit production frontend
  "https://monamichef.com",           // allow apex too
  "http://localhost:8080",            // development frontend
  "http://localhost:3000",            // alternative dev port
].filter(Boolean) as string[];

console.log("[BOOT] Environment FRONTEND_ORIGIN:", process.env.FRONTEND_ORIGIN);
console.log("[BOOT] Environment CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("[BOOT] Allowed CORS origins:", ALLOWED_ORIGINS);

const corsCfg = cors({
  origin: (origin, cb) => {
    console.log("[CORS] Request from origin:", origin);
    // allow non-browser requests (curl/health) where origin is undefined
    if (!origin) {
      console.log("[CORS] Allowing request with no origin (server-to-server)");
      return cb(null, true);
    }
    const ok = ALLOWED_ORIGINS.includes(origin);
    if (ok) {
      console.log("[CORS] ✅ Allowed origin:", origin);
    } else {
      console.warn("[CORS] ❌ Blocked origin:", origin, "- Not in allowed list:", ALLOWED_ORIGINS);
    }
    cb(null, ok);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type", "Cookie"],
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

// ── COOKIES & PERFORMANCE MIDDLEWARE ────────────────────────────────────────
app.use(cookieParser());
app.use(performanceMonitor); // After CORS to avoid interference

app.use(
  "/chat",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, private, max-age=0, must-revalidate");
    res.setHeader("Vary", "Authorization, Cookie");
    if (req.method === "OPTIONS") return res.sendStatus(204); // preflight ends here
    next();
  }
);

// ── BODY PARSERS + ROUTES ────────────────────────────────────────────────────
app.use(urlencoded({ extended: true }));
app.use(json());

RegisterRoutes(app);

