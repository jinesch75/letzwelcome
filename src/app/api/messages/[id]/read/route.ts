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

    const messageId = id;

    // Get message and verify user has access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            match: {
              select: {
                newcomerId: true,
                buddyId: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if user is the recipient
    if (message.senderId === userId) {
      return NextResponse.json(
        { error: 'Cannot mark own message as read' },
        { status: 400 }
      );
    }

    // Verify user is part of the conversation
    if (message.conversation.match) {
      const isParticipant =
        message.conversation.match.newcomerId === userId ||
        message.conversation.match.buddyId === userId;

      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }
    }

    // Mark as read
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        message: {
          id: updated.id,
          readAt: updated.readAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}
