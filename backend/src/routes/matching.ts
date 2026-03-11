import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import { findMatches } from "../services/matching";
import { generateIntroduction } from "../services/introductions";

const router = Router();
const asAuth = (req: Request) => req as AuthenticatedRequest;

// ─── GET MATCHES ─────────────────────────────────────────────

router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const matches = await findMatches(asAuth(req).user!.userId, limit);

    // Hydrate user data for each match
    const userIds = matches.map((m) => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        hometown: true,
        currentCity: true,
        university: true,
        profession: true,
        verifiedBadge: true,
      },
    });

    const userMap = new Map(users.map((u: typeof users[number]) => [u.id, u]));

    const results = matches.map((m: { userId: string; score: number; reasons: string[] }) => {
      const user = userMap.get(m.userId);
      return {
        ...user,
        matchScore: m.score,
        matchReasons: m.reasons,
      };
    });

    res.json({ matches: results });
  } catch (err) {
    next(err);
  }
});

// ─── GENERATE AI INTRO ──────────────────────────────────────

router.post("/introduce/:targetUserId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await generateIntroduction(asAuth(req).user!.userId, req.params.targetUserId);
    res.json({ message });
  } catch (err) {
    next(err);
  }
});

// ─── CONNECTIONS ─────────────────────────────────────────────

router.post("/connect/:targetUserId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.connection.upsert({
      where: {
        userAId_userBId: { userAId: asAuth(req).user!.userId, userBId: req.params.targetUserId },
      },
      update: {},
      create: {
        userAId: asAuth(req).user!.userId,
        userBId: req.params.targetUserId,
        status: "PENDING",
      },
    });
    res.json(connection);
  } catch (err) {
    next(err);
  }
});

router.put("/connect/:connectionId/accept", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const connection = await prisma.connection.update({
      where: { id: req.params.connectionId, userBId: asAuth(req).user!.userId },
      data: { status: "ACCEPTED" },
    });
    res.json(connection);
  } catch (err) {
    next(err);
  }
});

// ─── ENDORSEMENTS ────────────────────────────────────────────

router.post("/endorse/:targetUserId", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, message } = req.body;
    const endorsement = await prisma.endorsement.create({
      data: {
        endorserId: asAuth(req).user!.userId,
        endorsedId: req.params.targetUserId,
        category,
        message,
      },
    });
    res.status(201).json(endorsement);
  } catch (err) {
    next(err);
  }
});

export default router;
