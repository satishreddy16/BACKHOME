import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";
import { notFound, forbidden } from "../utils/errors";

const router = Router();
const asAuth = (req: Request) => req as AuthenticatedRequest;

// ─── CREATE POST ─────────────────────────────────────────────

const createPostSchema = z.object({
  type: z.enum(["UPDATE", "HELP_REQUEST", "JOB_REFERRAL", "EVENT_ANNOUNCEMENT", "HOUSING"]).default("UPDATE"),
  title: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  imageUrl: z.string().url().optional(),
  city: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

router.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPostSchema.parse(req.body);
    const post = await prisma.post.create({
      data: { ...data, authorId: asAuth(req).user!.userId },
      include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// ─── GET FEED (by city) ─────────────────────────────────────

router.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { city, type, page = "1", limit = "20" } = req.query;

    const where: Record<string, unknown> = {};
    if (city) where.city = { contains: city as string, mode: "insensitive" };
    if (type) where.type = type as string;

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, verifiedBadge: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    next(err);
  }
});

// ─── GET SINGLE POST ────────────────────────────────────────

router.get("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, verifiedBadge: true } },
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!post) throw notFound("Post");
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE POST ─────────────────────────────────────────────

router.delete("/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw notFound("Post");
    if (post.authorId !== asAuth(req).user!.userId) throw forbidden("You can only delete your own posts");

    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ─── ADD COMMENT ─────────────────────────────────────────────

const commentSchema = z.object({ body: z.string().min(1).max(2000) });

router.post("/:id/comments", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = commentSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw notFound("Post");

    const comment = await prisma.comment.create({
      data: { body, postId: req.params.id, authorId: asAuth(req).user!.userId },
      include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

export default router;
