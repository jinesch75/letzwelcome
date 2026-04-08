import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Badge auto-award cron job
// Run daily via Railway cron or Next.js cron
// GET /api/cron/badges?secret=CRON_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const awarded: string[] = [];

  try {
    // ─── Verified Buddy: 5+ connections, rating ≥ 4.0 ───
    const verifiedBuddyBadge = await prisma.badge.findUnique({ where: { name: "Verified Buddy" } });
    if (verifiedBuddyBadge) {
      const eligibleBuddies = await prisma.user.findMany({
        where: {
          role: { in: ["BUDDY", "BOTH"] },
          deletedAt: null,
          badges: { none: { badgeId: verifiedBuddyBadge.id } },
        },
        include: {
          matchesAsBuddy: { where: { status: "COMPLETED" } },
          reviewsReceived: true,
        },
      });

      for (const buddy of eligibleBuddies) {
        if (buddy.matchesAsBuddy.length >= 5) {
          const avgRating = buddy.reviewsReceived.length > 0
            ? buddy.reviewsReceived.reduce((s, r) => s + r.rating, 0) / buddy.reviewsReceived.length
            : 0;
          if (avgRating >= 4.0) {
            await prisma.userBadge.create({ data: { userId: buddy.id, badgeId: verifiedBuddyBadge.id } });
            awarded.push(`Verified Buddy → ${buddy.name}`);
          }
        }
      }
    }

    // ─── Trail Companion: 5+ walking tour participations ───
    const trailBadge = await prisma.badge.findUnique({ where: { name: "Trail Companion" } });
    if (trailBadge) {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          badges: { none: { badgeId: trailBadge.id } },
        },
        include: {
          eventParticipation: {
            where: { event: { type: "WALK" } },
          },
          eventsCreated: {
            where: { type: "WALK" },
          },
        },
      });

      for (const user of users) {
        const walkCount = user.eventParticipation.length + user.eventsCreated.length;
        if (walkCount >= 5) {
          await prisma.userBadge.create({ data: { userId: user.id, badgeId: trailBadge.id } });
          awarded.push(`Trail Companion → ${user.name}`);
        }
      }
    }

    // ─── First Steps: Profile complete + buddy connection within 30 days ───
    const firstStepsBadge = await prisma.badge.findUnique({ where: { name: "First Steps" } });
    if (firstStepsBadge) {
      const newcomers = await prisma.user.findMany({
        where: {
          role: { in: ["NEWCOMER", "BOTH"] },
          deletedAt: null,
          badges: { none: { badgeId: firstStepsBadge.id } },
          profile: { onboardingCompleted: true },
        },
        include: {
          matchesAsNewcomer: { where: { status: { in: ["ACCEPTED", "COMPLETED"] } } },
        },
      });

      for (const newcomer of newcomers) {
        if (newcomer.matchesAsNewcomer.length > 0) {
          const firstMatch = newcomer.matchesAsNewcomer[0];
          const daysSinceJoin = Math.floor(
            (firstMatch.createdAt.getTime() - newcomer.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceJoin <= 30) {
            await prisma.userBadge.create({ data: { userId: newcomer.id, badgeId: firstStepsBadge.id } });
            awarded.push(`First Steps → ${newcomer.name}`);
          }
        }
      }
    }

    // ─── Explorer: 3+ event participations ───
    const explorerBadge = await prisma.badge.findUnique({ where: { name: "Explorer" } });
    if (explorerBadge) {
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          badges: { none: { badgeId: explorerBadge.id } },
        },
        include: {
          eventParticipation: true,
        },
      });

      for (const user of users) {
        if (user.eventParticipation.length >= 3) {
          await prisma.userBadge.create({ data: { userId: user.id, badgeId: explorerBadge.id } });
          awarded.push(`Explorer → ${user.name}`);
        }
      }
    }

    // ─── Paying it Forward: Changed to buddy + completed 1 match ───
    const payingBadge = await prisma.badge.findUnique({ where: { name: "Paying it Forward" } });
    if (payingBadge) {
      const users = await prisma.user.findMany({
        where: {
          role: { in: ["BUDDY", "BOTH"] },
          deletedAt: null,
          badges: { none: { badgeId: payingBadge.id } },
          // Users who were originally newcomers (have newcomer matches)
          matchesAsNewcomer: { some: {} },
        },
        include: {
          matchesAsBuddy: { where: { status: "COMPLETED" } },
        },
      });

      for (const user of users) {
        if (user.matchesAsBuddy.length >= 1) {
          await prisma.userBadge.create({ data: { userId: user.id, badgeId: payingBadge.id } });
          awarded.push(`Paying it Forward → ${user.name}`);
        }
      }
    }

    // ─── Trusted Guide: 10+ connections, rating ≥ 4.5, 12+ months active ───
    const trustedBadge = await prisma.badge.findUnique({ where: { name: "Trusted Guide" } });
    if (trustedBadge) {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const buddies = await prisma.user.findMany({
        where: {
          role: { in: ["BUDDY", "BOTH"] },
          deletedAt: null,
          createdAt: { lte: twelveMonthsAgo },
          badges: { none: { badgeId: trustedBadge.id } },
        },
        include: {
          matchesAsBuddy: { where: { status: "COMPLETED" } },
          reviewsReceived: true,
        },
      });

      for (const buddy of buddies) {
        if (buddy.matchesAsBuddy.length >= 10) {
          const avgRating = buddy.reviewsReceived.length > 0
            ? buddy.reviewsReceived.reduce((s, r) => s + r.rating, 0) / buddy.reviewsReceived.length
            : 0;
          if (avgRating >= 4.5) {
            await prisma.userBadge.create({ data: { userId: buddy.id, badgeId: trustedBadge.id } });
            awarded.push(`Trusted Guide → ${buddy.name}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      awarded,
      message: `${awarded.length} badges awarded`,
    });
  } catch (error) {
    console.error("Badge cron error:", error);
    return NextResponse.json({ error: "Failed to process badges" }, { status: 500 });
  }
}
