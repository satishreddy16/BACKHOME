import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import { notFound } from "../utils/errors";

const router = Router();
const asAuth = (req: Request) => req as AuthenticatedRequest;

const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  bio: true,
  hometown: true,
  currentCity: true,
  university: true,
  company: true,
  profession: true,
  languages: true,
  interests: true,
  willingToHelp: true,
  verifiedBadge: true,
  createdAt: true,
};

// ─── GET MY PROFILE ──────────────────────────────────────────

router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: asAuth(req).user!.userId },
      select: { ...profileSelect, email: true, emailVerified: true },
    });
    if (!user) throw notFound("User");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ─── UPDATE MY PROFILE ──────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  hometown: z.string().optional(),
  currentCity: z.string().optional(),
  university: z.string().optional(),
  company: z.string().optional(),
  profession: z.string().optional(),
  languages: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  willingToHelp: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional(),
});

router.put("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: asAuth(req).user!.userId },
      data,
      select: profileSelect,
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ─── GET USER BY ID ──────────────────────────────────────────

router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        ...profileSelect,
        _count: { select: { endorsementsReceived: true } },
      },
    });
    if (!user) throw notFound("User");

    // Check mutual connections
    const mutualConnections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [
          { userAId: asAuth(req).user!.userId, userBId: req.params.id },
          { userAId: req.params.id, userBId: asAuth(req).user!.userId },
        ],
      },
    });

    res.json({ ...user, isConnected: mutualConnections.length > 0 });
  } catch (err) {
    next(err);
  }
});

// ─── SEARCH USERS ────────────────────────────────────────────

router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { hometown, city, profession, university, q, page = "1", limit = "20" } = req.query;

    const where: Record<string, unknown> = {};
    if (hometown) where.hometown = { contains: hometown as string, mode: "insensitive" };
    if (city) where.currentCity = { contains: city as string, mode: "insensitive" };
    if (profession) where.profession = { contains: profession as string, mode: "insensitive" };
    if (university) where.university = { contains: university as string, mode: "insensitive" };
    if (q) {
      where.OR = [
        { firstName: { contains: q as string, mode: "insensitive" } },
        { lastName: { contains: q as string, mode: "insensitive" } },
        { hometown: { contains: q as string, mode: "insensitive" } },
        { currentCity: { contains: q as string, mode: "insensitive" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: profileSelect, skip, take: Number(limit), orderBy: { lastActiveAt: "desc" } }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

export default router;
