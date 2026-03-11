import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { MatchScore } from "../types";

const CACHE_TTL = 60 * 15; // 15 minutes

interface UserProfile {
  id: string;
  hometown: string;
  currentCity: string;
  university: string | null;
  profession: string | null;
  languages: string[];
  interests: string[];
}

/**
 * Smart Matching Engine
 *
 * Scores users based on weighted criteria:
 *   - Same hometown:      +40 points (core identity match)
 *   - Same current city:  +20 points (proximity)
 *   - Same university:    +15 points (alumni network)
 *   - Same profession:    +10 points (career alignment)
 *   - Shared languages:   +5 each  (cultural bond)
 *   - Shared interests:   +3 each  (social compatibility)
 */
export async function findMatches(userId: string, limit = 20): Promise<MatchScore[]> {
  // Check cache
  const cacheKey = `matches:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      hometown: true,
      currentCity: true,
      university: true,
      profession: true,
      languages: true,
      interests: true,
    },
  });

  if (!currentUser) return [];

  // Fetch candidate users — prioritize same hometown or city
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { hometown: { equals: currentUser.hometown, mode: "insensitive" } },
        { currentCity: { equals: currentUser.currentCity, mode: "insensitive" } },
        { university: currentUser.university ? { equals: currentUser.university, mode: "insensitive" } : undefined },
      ],
    },
    select: {
      id: true,
      hometown: true,
      currentCity: true,
      university: true,
      profession: true,
      languages: true,
      interests: true,
    },
    take: 200, // cap candidates for performance
  });

  const scores: MatchScore[] = candidates
    .map((candidate) => scoreMatch(currentUser, candidate))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Cache results
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(scores)).catch(() => {});

  return scores;
}

function scoreMatch(user: UserProfile, candidate: UserProfile): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  // Same hometown — strongest signal
  if (normalize(user.hometown) === normalize(candidate.hometown)) {
    score += 40;
    reasons.push(`Same hometown: ${candidate.hometown}`);
  }

  // Same current city
  if (normalize(user.currentCity) === normalize(candidate.currentCity)) {
    score += 20;
    reasons.push(`Same city: ${candidate.currentCity}`);
  }

  // Same university
  if (user.university && candidate.university && normalize(user.university) === normalize(candidate.university)) {
    score += 15;
    reasons.push(`Same university: ${candidate.university}`);
  }

  // Same profession
  if (user.profession && candidate.profession && normalize(user.profession) === normalize(candidate.profession)) {
    score += 10;
    reasons.push(`Same profession: ${candidate.profession}`);
  }

  // Shared languages
  const sharedLangs = intersect(user.languages, candidate.languages);
  if (sharedLangs.length > 0) {
    score += sharedLangs.length * 5;
    reasons.push(`Shared languages: ${sharedLangs.join(", ")}`);
  }

  // Shared interests
  const sharedInterests = intersect(user.interests, candidate.interests);
  if (sharedInterests.length > 0) {
    score += sharedInterests.length * 3;
    reasons.push(`Shared interests: ${sharedInterests.join(", ")}`);
  }

  return { userId: candidate.id, score, reasons };
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function intersect(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(normalize));
  return a.filter((item) => setB.has(normalize(item)));
}
