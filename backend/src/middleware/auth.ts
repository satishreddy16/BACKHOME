import { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../types";
import { unauthorized } from "../utils/errors";

export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(unauthorized("Missing or invalid authorization header"));
  }

  try {
    const token = header.slice(7);
    (req as AuthenticatedRequest).user = verifyToken(token);
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};
