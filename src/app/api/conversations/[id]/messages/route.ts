import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
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

    const conversationId = id;

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        match: {
          select: {
            newcomerId: true,
            buddyId: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this conversation
    if (conversation.match) {
      const isParticipant =
        conversation.match.newcomerId === userId ||
        conversation.match.buddyId === userId;

      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }
    } else if (conversation.eventId) {
      // For event group conversations, verify user is a participant or creator
      const eventParticipant = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: conversation.eventId,
            userId,
          },
        },
      });
      const isCreator = await prisma.event.findFirst({
        where: { id: conversation.eventId, creatorId: userId },
      });
      if (!eventParticipant && !isCreator) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = messages.map(msg => ({
      id: msg.id,
      senderId: msg.sender.id,
      senderName: msg.sender.name,
      content: msg.content,
      createdAt: msg.createdAt,
      readAt: msg.readAt,
    }));

    return NextResponse.json(
      { messages: formatted },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
