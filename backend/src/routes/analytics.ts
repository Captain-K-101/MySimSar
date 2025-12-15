import { Router } from "express";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Record a profile view (authenticated or anonymous if viewerId null)
router.post("/profile-view/:simsarId", async (req, res) => {
  const simsarId = req.params.simsarId;
  const viewerId = req.user?.userId || null;

  const simsar = await prisma.simsar.findUnique({ where: { id: simsarId } });
  if (!simsar) return res.status(404).json({ error: "Simsar not found" });

  await prisma.profileView.create({
    data: {
      simsarId,
      viewerId,
    },
  });

  return res.json({ success: true });
});

// Get profile view summary
router.get("/profile-view/:simsarId/summary", requireAuth(["USER", "BROKER", "ADMIN"]), async (req, res) => {
  const simsarId = req.params.simsarId;
  const range = (req.query.range as string) || "today";

  const simsar = await prisma.simsar.findUnique({ where: { id: simsarId }, select: { userId: true } });
  if (!simsar) return res.status(404).json({ error: "Simsar not found" });

  // Brokers can only view their own profile stats unless admin
  if (req.user!.role !== "ADMIN" && simsar.userId !== req.user!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const whereBase = { simsarId };
  const whereToday = { ...whereBase, viewedAt: { gte: startToday } };
  const where7d = { ...whereBase, viewedAt: { gte: start7d } };

  const [todayCount, weekCount, totalCount] = await Promise.all([
    prisma.profileView.count({ where: whereToday }),
    prisma.profileView.count({ where: where7d }),
    prisma.profileView.count({ where: whereBase }),
  ]);

  const response = {
    total: totalCount,
    today: todayCount,
    last7d: weekCount,
  };

  if (range === "today") return res.json({ today: todayCount });
  if (range === "7d") return res.json({ last7d: weekCount });
  return res.json(response);
});

export default router;


