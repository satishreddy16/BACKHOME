import OpenAI from "openai";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { notFound, badRequest } from "../utils/errors";

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

interface UserContext {
  firstName: string;
  hometown: string;
  currentCity: string;
  university: string | null;
  profession: string | null;
  languages: string[];
  interests: string[];
  willingToHelp: string[];
}

/**
 * AI Introduction Assistant
 *
 * Generates a warm, contextual intro message between two matched users.
 * Falls back to template-based intros if OpenAI is unavailable.
 */
export async function generateIntroduction(fromUserId: string, toUserId: string): Promise<string> {
  if (fromUserId === toUserId) throw badRequest("Cannot introduce yourself to yourself");

  const [fromUser, toUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: fromUserId } }),
    prisma.user.findUnique({ where: { id: toUserId } }),
  ]);

  if (!fromUser) throw notFound("Sender");
  if (!toUser) throw notFound("Recipient");

  const from: UserContext = pick(fromUser);
  const to: UserContext = pick(toUser);

  let message: string;

  if (openai) {
    message = await generateWithAI(from, to);
  } else {
    message = generateTemplate(from, to);
  }

  // Persist the introduction
  await prisma.introduction.create({
    data: { fromUserId, toUserId, message },
  });

  return message;
}

async function generateWithAI(from: UserContext, to: UserContext): Promise<string> {
  const prompt = `You are a warm, professional community connector for "Back Home", a diaspora networking app.

Generate a brief, personalized introduction message from ${from.firstName} to ${to.firstName}.

About ${from.firstName}:
- From: ${from.hometown}
- Now in: ${from.currentCity}
${from.university ? `- University: ${from.university}` : ""}
${from.profession ? `- Works in: ${from.profession}` : ""}
- Languages: ${from.languages.join(", ") || "Not specified"}
- Interests: ${from.interests.join(", ") || "Not specified"}

About ${to.firstName}:
- From: ${to.hometown}
- Now in: ${to.currentCity}
${to.university ? `- University: ${to.university}` : ""}
${to.profession ? `- Works in: ${to.profession}` : ""}
- Languages: ${to.languages.join(", ") || "Not specified"}
- Interests: ${to.interests.join(", ") || "Not specified"}
- Willing to help with: ${to.willingToHelp.join(", ") || "Not specified"}

Rules:
- Keep it under 3 sentences
- Highlight the strongest connection (hometown > university > profession > interests)
- Be warm but not overly casual
- End with a natural conversation starter
- Do NOT use generic phrases like "I hope this message finds you well"`;

  const completion = await openai!.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || generateTemplate(from, to);
}

function generateTemplate(from: UserContext, to: UserContext): string {
  const shared: string[] = [];

  if (normalize(from.hometown) === normalize(to.hometown)) {
    shared.push(`you're both from ${from.hometown}`);
  }
  if (from.university && to.university && normalize(from.university) === normalize(to.university)) {
    shared.push(`you both went to ${from.university}`);
  }
  if (from.profession && to.profession && normalize(from.profession) === normalize(to.profession)) {
    shared.push(`you both work in ${from.profession}`);
  }

  const connection = shared.length > 0 ? shared.join(" and ") : `you're both living in ${to.currentCity}`;

  return `Hey ${to.firstName}! I'm ${from.firstName}, and I noticed ${connection}. Would love to connect and share experiences — always great to meet someone from the community here!`;
}

function pick(user: Record<string, unknown>): UserContext {
  return {
    firstName: user.firstName as string,
    hometown: user.hometown as string,
    currentCity: user.currentCity as string,
    university: user.university as string | null,
    profession: user.profession as string | null,
    languages: (user.languages as string[]) || [],
    interests: (user.interests as string[]) || [],
    willingToHelp: (user.willingToHelp as string[]) || [],
  };
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}
