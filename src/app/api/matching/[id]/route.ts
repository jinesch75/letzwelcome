import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
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

    const { action } = await request.json();
    const matchId = id;

    // Get the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Check authorization: only buddy can accept/decline, both can complete
    if (action === 'accept' || action === 'decline') {
      if (match.buddyId !== userId) {
        return NextResponse.json(
          { error: 'Only buddy can accept/decline' },
          { status: 403 }
        );
      }
    }

    if (action === 'accept') {
      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          type: 'MATCH',
          matchId: match.id,
        },
      });

      // Update match
      const updated = await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          match: updated,
          conversationId: conversation.id,
        },
        { status: 200 }
      );
    } else if (action === 'decline') {
      // Update match
      const updated = await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'DECLINED',
        },
      });

      return NextResponse.json(
        { success: true, match: updated },
        { status: 200 }
      );
    } else if (action === 'complete') {
      // Update match
      const updated = await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return NextResponse.json(
        { success: true, match: updated },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
