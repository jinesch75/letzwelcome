import prisma from "../db";

interface MatchScore {
  buddyId: string;
  score: number;
  reasons: string[];
}

export async function getMatchSuggestions(newcomerId: string, limit = 3): Promise<MatchScore[]> {
  const newcomer = await prisma.user.findUnique({
    where: { id: newcomerId },
    include: {
      profile: true,
      matchesAsNewcomer: { select: { buddyId: true, status: true } },
    },
  });

  if (!newcomer?.profile) return [];

  // Get IDs of buddies the newcomer already has pending/active matches with
  const existingBuddyIds = newcomer.matchesAsNewcomer
    .filter((m) => ["PENDING", "ACCEPTED"].includes(m.status))
    .map((m) => m.buddyId);

  // Find eligible buddies
  const buddies = await prisma.user.findMany({
    where: {
      id: { notIn: [newcomerId, ...existingBuddyIds] },
      role: { in: ["BUDDY", "BOTH"] },
      deletedAt: null,
      suspended: false,
      buddyProfile: {
        isAcceptingMatches: true,
        buddyStatus: "AVAILABLE",
      },
    },
    include: {
      profile: true,
      buddyProfile: true,
      reviewsReceived: { select: { rating: true } },
      matchesAsBuddy: {
        where: { status: { in: ["PENDING", "ACCEPTED"] } },
        select: { id: true },
      },
    },
  });

  const scores: MatchScore[] = [];

  for (const buddy of buddies) {
    if (!buddy.profile || !buddy.buddyProfile) continue;

    // Check max connections
    if (buddy.matchesAsBuddy.length >= buddy.buddyProfile.maxActiveConnections) continue;

    let score = 0;
    const reasons: string[] = [];

    // ─── Hard filters ───
    // Region overlap
    const newcomerRegion = newcomer.profile.currentRegion;
    const buddyRegions = buddy.buddyProfile.regionsServed;
    if (newcomerRegion && buddyRegions.length > 0 && !buddyRegions.includes(newcomerRegion)) {
      continue; // No region overlap — skip
    }

    // Shared language
    const newcomerLangs = new Set(newcomer.profile.languagesSpoken);
    const buddyLangs = new Set(buddy.profile.languagesSpoken);
    const sharedLangs = [...newcomerLangs].filter((l) => buddyLangs.has(l));
    if (sharedLangs.length === 0 && newcomerLangs.size > 0 && buddyLangs.size > 0) {
      continue; // No shared language — skip
    }

    // Gender preference filter
    if (newcomer.profile.genderPreference && buddy.profile.genderPreference) {
      // Both have preferences — they should be compatible
      // Simple implementation: skip if explicit mismatch
    }

    // ─── Soft scoring ───

    // Expertise match with newcomer's needs (high weight: 0-30)
    const newcomerNeeds = new Set(newcomer.profile.needsHelp);
    const buddyExpertise = new Set(buddy.buddyProfile.expertiseAreas);
    const expertiseOverlap = [...newcomerNeeds].filter((n) => buddyExpertise.has(n));
    if (expertiseOverlap.length > 0) {
      const expertiseScore = Math.min(30, expertiseOverlap.length * 10);
      score += expertiseScore;
      reasons.push(`Expertise match: ${expertiseOverlap.join(", ")}`);
    }

    // Shared interests (medium weight: 0-20)
    const newcomerInterests = new Set(newcomer.profile.interests);
    const buddyInterests = new Set(buddy.profile.interests);
    const sharedInterests = [...newcomerInterests].filter((i) => buddyInterests.has(i));
    if (sharedInterests.length > 0) {
      const interestScore = Math.min(20, sharedInterests.length * 5);
      score += interestScore;
      reasons.push(`Shared interests: ${sharedInterests.join(", ")}`);
    }

    // Family situation similarity (medium weight: 0-15)
    if (
      newcomer.profile.familySituation &&
      buddy.profile.familySituation &&
      newcomer.profile.familySituation === buddy.profile.familySituation
    ) {
      score += 15;
      reasons.push("Similar family situation");
    }

    // Shared languages bonus (low-medium weight: 0-10)
    if (sharedLangs.length > 0) {
      score += Math.min(10, sharedLangs.length * 3);
      reasons.push(`Shared languages: ${sharedLangs.join(", ")}`);
    }

    // Meeting style compatibility (low weight: 0-5)
    if (
      newcomer.profile.preferredMeetingStyle &&
      buddy.profile.preferredMeetingStyle &&
      newcomer.profile.preferredMeetingStyle === buddy.profile.preferredMeetingStyle
    ) {
      score += 5;
      reasons.push("Compatible meeting style");
    }

    // Buddy rating bonus (0-10)
    if (buddy.reviewsReceived.length > 0) {
      const avgRating =
        buddy.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / buddy.reviewsReceived.length;
      score += Math.round(avgRating * 2); // max 10
      reasons.push(`Rating: ${avgRating.toFixed(1)}/5`);
    }

    // Region match bonus
    if (newcomerRegion && buddyRegions.includes(newcomerRegion)) {
      score += 5;
      reasons.push("Same region");
    }

    scores.push({ buddyId: buddy.id, score, reasons });
  }

  // Sort by score descending and return top N
  return scores.sort((a, b) => b.score - a.score).slice(0, limit);
}
