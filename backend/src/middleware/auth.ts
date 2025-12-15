import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT Secret - must be set in production
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Warn if using default secret in production
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-secret")) {
  console.error("⚠️  CRITICAL: JWT_SECRET is not set or using default value in production!");
  console.error("⚠️  Set JWT_SECRET environment variable to a secure random string.");
}

interface TokenPayload {
  userId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth =
  (allowedRoles?: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
