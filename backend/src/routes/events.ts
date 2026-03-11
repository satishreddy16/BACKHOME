import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import { notFound, badRequest } from "../utils/errors";

const router = Router();
const asAuth = (req: Request) => req as AuthenticatedRequest;

// ─── CREATE EVENT ────────────────────────────────────────────

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
  location: z.string().min(1),
  city: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startsAt: z.string().transform((s) => new Date(s)),
  endsAt: z.string().transform((s) => new Date(s)).optional(),
  maxCapacity: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
});

router.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await prisma.event.create({
      data: { ...data, creatorId: asAuth(req).user!.userId },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { rsvps: true } },
      },
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// ─── LIST EVENTS ─────────────────────────────────────────────

router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, upcoming, page = "1", limit = "20" } = req.query;

    const where: Record<string, unknown> = {};
    if (city) where.city = { contains: city as string, mode: "insensitive" };
    if (upcoming === "true") where.startsAt = { gte: new Date() };

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { rsvps: true } },
        },
        orderBy: { startsAt: "asc" },
        skip,
        take: Number(limit),
      }),
      prisma.event.count({ where }),
    ]);

    res.json({ events, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ─── RSVP ────────────────────────────────────────────────────

const rsvpSchema = z.object({
  status: z.enum(["GOING", "INTERESTED", "NOT_GOING"]),
});

router.post("/:id/rsvp", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = rsvpSchema.parse(req.body);
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { rsvps: { where: { status: "GOING" } } } } },
    });
    if (!event) throw notFound("Event");

    if (status === "GOING" && event.maxCapacity && event._count.rsvps >= event.maxCapacity) {
      throw badRequest("Event is at full capacity");
    }

    const rsvp = await prisma.eventRsvp.upsert({
      where: { eventId_userId: { eventId: req.params.id, userId: asAuth(req).user!.userId } },
      update: { status },
      create: { eventId: req.params.id, userId: asAuth(req).user!.userId, status },
    });

    res.json(rsvp);
  } catch (err) {
    next(err);
  }
});

export default router;
