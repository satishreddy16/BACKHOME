import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "arjun@example.com" },
      update: {},
      create: {
        email: "arjun@example.com",
        passwordHash,
        emailVerified: true,
        verifiedBadge: true,
        firstName: "Arjun",
        lastName: "Reddy",
        hometown: "Hyderabad, India",
        currentCity: "San Francisco, USA",
        university: "BITS Pilani",
        company: "Stripe",
        profession: "Software Engineer",
        languages: ["Telugu", "Hindi", "English"],
        interests: ["cricket", "startups", "hiking", "cooking"],
        willingToHelp: ["referrals", "housing", "cultural_events"],
        bio: "Moved to SF 3 years ago. Always happy to help fellow Hyderabadis settle in!",
      },
    }),
    prisma.user.upsert({
      where: { email: "priya@example.com" },
      update: {},
      create: {
        email: "priya@example.com",
        passwordHash,
        emailVerified: true,
        firstName: "Priya",
        lastName: "Sharma",
        hometown: "Hyderabad, India",
        currentCity: "San Francisco, USA",
        university: "IIT Bombay",
        company: "Google",
        profession: "Product Manager",
        languages: ["Telugu", "Hindi", "English"],
        interests: ["startups", "design", "yoga", "biryani"],
        willingToHelp: ["mentorship", "referrals"],
        bio: "PM at Google, originally from Hyderabad. Love connecting with the community here.",
      },
    }),
    prisma.user.upsert({
      where: { email: "rahul@example.com" },
      update: {},
      create: {
        email: "rahul@example.com",
        passwordHash,
        emailVerified: true,
        firstName: "Rahul",
        lastName: "Mehta",
        hometown: "Mumbai, India",
        currentCity: "New York, USA",
        university: "NYU Stern",
        company: "Goldman Sachs",
        profession: "Investment Banking",
        languages: ["Hindi", "Marathi", "English"],
        interests: ["finance", "bollywood", "running"],
        willingToHelp: ["housing", "career_advice"],
        bio: "NYC-based banker from Mumbai. Happy to help new arrivals navigate the city.",
      },
    }),
    prisma.user.upsert({
      where: { email: "mei@example.com" },
      update: {},
      create: {
        email: "mei@example.com",
        passwordHash,
        emailVerified: true,
        firstName: "Mei",
        lastName: "Chen",
        hometown: "Shanghai, China",
        currentCity: "San Francisco, USA",
        university: "Stanford",
        profession: "Data Scientist",
        languages: ["Mandarin", "English"],
        interests: ["AI", "cooking", "photography"],
        willingToHelp: ["mentorship", "cultural_events"],
        bio: "Stanford PhD, now working in AI. Love organizing dim sum meetups!",
      },
    }),
  ]);

  // Create some posts
  await prisma.post.createMany({
    data: [
      {
        authorId: users[0].id,
        type: "UPDATE",
        title: "Welcome to SF, fellow Hyderabadis!",
        body: "Just created this community. If you're from Hyderabad and living in SF, let's connect! 🏠",
        city: "San Francisco, USA",
        tags: ["welcome", "hyderabad", "sf"],
      },
      {
        authorId: users[1].id,
        type: "EVENT_ANNOUNCEMENT",
        title: "Telugu Food Festival this Saturday",
        body: "Organizing a Telugu food potluck in Mission District. Bring your best biryani! DM for details.",
        city: "San Francisco, USA",
        tags: ["food", "telugu", "event"],
      },
      {
        authorId: users[2].id,
        type: "HOUSING",
        title: "Room available in East Village",
        body: "Looking for a roommate in my 2BR apartment in East Village. Preferably someone from India. Rent is $1800/month.",
        city: "New York, USA",
        tags: ["housing", "roommate", "eastvillage"],
      },
    ],
  });

  // Create an event
  await prisma.event.create({
    data: {
      creatorId: users[1].id,
      title: "Hyderabad Meetup - SF Edition",
      description: "Monthly meetup for Hyderabadis in San Francisco. Chai, snacks, and great conversations!",
      location: "Dolores Park, San Francisco",
      city: "San Francisco, USA",
      startsAt: new Date("2026-04-15T14:00:00Z"),
      endsAt: new Date("2026-04-15T17:00:00Z"),
      maxCapacity: 50,
      tags: ["meetup", "hyderabad", "monthly"],
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
