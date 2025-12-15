import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

// JWT Secret - must be set in production
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Warn if using default secret in production
if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-secret")) {
  console.error("⚠️  CRITICAL: JWT_SECRET is not set or using default value in production!");
}

// Role constants (SQLite uses strings)
const ROLES = ["USER", "BROKER", "ADMIN"] as const;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).substring(2, 6);
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["USER", "BROKER"]),
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  // Agency creation fields
  createAgency: z.boolean().optional(),
  agencyName: z.string().min(2).optional(),
  agencyBio: z.string().optional(),
  agencyReraLicense: z.string().optional(),
  agencyWebsite: z.string().url().optional().or(z.literal("")),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const router = Router();

router.post("/signup", async (req, res) => {
  const parse = signupSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  const { email, password, role, name, phone, createAgency, agencyName, agencyBio, agencyReraLicense, agencyWebsite } = parse.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // Validate agency creation
  if (createAgency && role === "BROKER") {
    if (!agencyName || agencyName.length < 2) {
      return res.status(400).json({ error: "Agency name is required" });
    }
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with simsar profile
  const user = await prisma.user.create({
    data: {
      email,
      phone: phone ?? null,
      passwordHash,
      role,
      simsar:
        role === "BROKER"
          ? {
              create: {
                name: name || "New Simsar",
                languages: JSON.stringify([]),
                verificationStatus: "PENDING",
                simsarType: "INDIVIDUAL",
              },
            }
          : undefined,
    },
    include: { simsar: true, ownedAgency: true },
  });

  // If creating an agency, create it now
  let agency = null;
  if (createAgency && role === "BROKER" && agencyName) {
    const slug = generateSlug(agencyName);
    agency = await prisma.agency.create({
      data: {
        ownerId: user.id,
        name: agencyName,
        slug,
        bio: agencyBio || null,
        reraLicenseNumber: agencyReraLicense || null,
        website: agencyWebsite || null,
        verificationStatus: "PENDING",
      },
    });

    // Update simsar's company name to match agency
    if (user.simsar) {
      await prisma.simsar.update({
        where: { id: user.simsar.id },
        data: { companyName: agencyName },
      });
    }
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  return res.status(201).json({ 
    token, 
    user: { 
      id: user.id, 
      role: user.role, 
      email: user.email, 
      name: user.simsar?.name,
      simsarId: user.simsar?.id,
      agencyId: agency?.id || null,
    } 
  });
});

router.post("/login", async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ 
    where: { email }, 
    include: { 
      simsar: true, 
      ownedAgency: true 
    } 
  });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  
  return res.json({ 
    token, 
    user: { 
      id: user.id, 
      role: user.role, 
      email: user.email, 
      name: user.simsar?.name,
      simsarId: user.simsar?.id,
      simsarType: user.simsar?.simsarType,
      agencyId: user.ownedAgency?.id || user.simsar?.agencyId || null,
      isAgencyOwner: !!user.ownedAgency,
      mustChangePassword: user.mustChangePassword,
    } 
  });
});

/* ─── PASSWORD CHANGE ─────────────────────────────────────── */

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// Change password (protected)
router.post("/change-password", requireAuth(["USER", "BROKER", "ADMIN"]), async (req, res) => {
  const parse = changePasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const { currentPassword, newPassword } = parse.data;
  
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  // Hash new password and update
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false, // Clear the flag
    },
  });

  return res.json({ success: true, message: "Password changed successfully" });
});

// Force password change (for first login of agency-created brokers)
const forceChangePasswordSchema = z.object({
  newPassword: z.string().min(8),
});

router.post("/force-change-password", requireAuth(["USER", "BROKER", "ADMIN"]), async (req, res) => {
  const parse = forceChangePasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const { newPassword } = parse.data;
  
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (!user.mustChangePassword) {
    return res.status(400).json({ error: "Password change not required" });
  }

  // Hash new password and update
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    },
  });

  return res.json({ success: true, message: "Password set successfully" });
});

/* ─── PASSWORD RESET FLOW ─────────────────────────────────── */

// In-memory store for reset tokens (in production, use Redis or database)
const resetTokens = new Map<string, { userId: string; expiresAt: Date }>();

const requestResetSchema = z.object({
  email: z.string().email(),
});

// Request password reset - generates a token
router.post("/request-reset", async (req, res) => {
  const parse = requestResetSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const { email } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
  }

  // Generate reset token
  const resetToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  resetTokens.set(resetToken, { userId: user.id, expiresAt });

  // In production, send email with reset link
  // For now, log the token (in dev mode)
  console.log(`[DEV] Password reset token for ${email}: ${resetToken}`);

  return res.json({ 
    success: true, 
    message: "If the email exists, a reset link has been sent",
    // Only include token in development for testing
    ...(process.env.NODE_ENV !== "production" && { resetToken }),
  });
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  const parse = resetPasswordSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Invalid payload", details: parse.error.flatten() });
  }

  const { token, newPassword } = parse.data;
  const resetData = resetTokens.get(token);

  if (!resetData) {
    return res.status(400).json({ error: "Invalid or expired reset token" });
  }

  if (new Date() > resetData.expiresAt) {
    resetTokens.delete(token);
    return res.status(400).json({ error: "Reset token has expired" });
  }

  // Hash new password and update
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: resetData.userId },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    },
  });

  // Remove used token
  resetTokens.delete(token);

  return res.json({ success: true, message: "Password has been reset successfully" });
});

// Verify reset token is valid
router.get("/verify-reset-token/:token", async (req, res) => {
  const { token } = req.params;
  const resetData = resetTokens.get(token);

  if (!resetData || new Date() > resetData.expiresAt) {
    return res.status(400).json({ valid: false, error: "Invalid or expired token" });
  }

  return res.json({ valid: true });
});

export default router;
