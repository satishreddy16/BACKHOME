import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { badRequest } from "../utils/errors";

const router = Router();

// ─── REGISTER ────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  hometown: z.string().min(1),
  currentCity: z.string().min(1),
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw badRequest("Email already registered");

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        hometown: data.hometown,
        currentCity: data.currentCity,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// ─── LOGIN ───────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw badRequest("Invalid credentials");

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw badRequest("Invalid credentials");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GOOGLE OAUTH CALLBACK ──────────────────────────────────

router.post("/google", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { googleId, email, firstName, lastName, avatarUrl } = req.body;

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      user = await prisma.user.upsert({
        where: { email },
        update: { googleId, avatarUrl },
        create: {
          email,
          googleId,
          firstName,
          lastName,
          avatarUrl,
          emailVerified: true,
          hometown: "",
          currentCity: "",
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({ user: { id: user.id, email: user.email, firstName: user.firstName }, token });
  } catch (err) {
    next(err);
  }
});

export default router;
