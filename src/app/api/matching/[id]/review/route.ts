import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { rating, text } = await request.json();
    const matchId = id;

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Can only review completed matches' },
        { status: 400 }
      );
    }

    // Only newcomer can review buddy (not vice versa)
    if (match.newcomerId !== userId) {
      return NextResponse.json(
        { error: 'Only newcomer can review' },
        { status: 403 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        matchId,
        reviewerId: userId,
        buddyId: match.buddyId,
        rating,
        text: text || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        review: {
          id: review.id,
          rating: review.rating,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
