import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getMatchSuggestions } from '@/lib/matching/algorithm';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get match scores
    const scores = await getMatchSuggestions(userId, 9);

    // Fetch full buddy profiles
    const buddyIds = scores.map(s => s.buddyId);
    const buddies = await prisma.user.findMany({
      where: { id: { in: buddyIds } },
      include: {
        profile: true,
        buddyProfile: true,
        reviewsReceived: { select: { rating: true } },
      },
    });

    // Map to response format with scores
    const suggestions = buddies.map(buddy => {
      const score = scores.find(s => s.buddyId === buddy.id);
      const avgRating =
        buddy.reviewsReceived.length > 0
          ? buddy.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
            buddy.reviewsReceived.length
          : 0;

      return {
        id: buddy.id,
        name: buddy.name,
        image: buddy.profile?.avatarUrl,
        region: buddy.profile?.currentRegion || '',
        languages: buddy.profile?.languagesSpoken || [],
        expertise: buddy.buddyProfile?.expertiseAreas || [],
        interests: buddy.profile?.interests || [],
        rating: avgRating,
        reviewCount: buddy.reviewsReceived.length,
        isVerified: buddy.emailVerified !== null,
        bio: buddy.profile?.bio || '',
        score: score?.score || 0,
      };
    });

    // Sort by score
    suggestions.sort((a, b) => (b.score || 0) - (a.score || 0));

    return NextResponse.json(
      { suggestions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
