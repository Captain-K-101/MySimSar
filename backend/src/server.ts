import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./prisma";
import authRoutes from "./routes/auth";
import simsarRoutes from "./routes/simsars";
import adminRoutes from "./routes/admin";
import agencyRoutes from "./routes/agencies";
import messageRoutes from "./routes/messages";
import analyticsRoutes from "./routes/analytics";
import propertiesRoutes from "./routes/properties";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Simple in-memory rate limiting for auth routes
const authRateLimits = new Map<string, { count: number; resetAt: number }>();
const AUTH_RATE_LIMIT = 10; // requests
const AUTH_RATE_WINDOW = 60 * 1000; // 1 minute

function rateLimitAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = authRateLimits.get(ip);

  if (!record || record.resetAt < now) {
    authRateLimits.set(ip, { count: 1, resetAt: now + AUTH_RATE_WINDOW });
    return next();
  }

  if (record.count >= AUTH_RATE_LIMIT) {
    return res.status(429).json({ 
      error: "Too many requests", 
      retryAfter: Math.ceil((record.resetAt - now) / 1000) 
    });
  }

  record.count++;
  return next();
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of authRateLimits) {
    if (value.resetAt < now) {
      authRateLimits.delete(key);
    }
  }
}, 60000);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Apply rate limiting to auth routes
app.use("/auth", rateLimitAuth, authRoutes);
app.use("/simsars", simsarRoutes);
app.use("/admin", adminRoutes);
app.use("/agencies", agencyRoutes);
app.use("/messages", messageRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/properties", propertiesRoutes);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();

