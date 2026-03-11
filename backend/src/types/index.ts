import { Request } from "express";

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export interface MatchScore {
  userId: string;
  score: number;
  reasons: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
}
