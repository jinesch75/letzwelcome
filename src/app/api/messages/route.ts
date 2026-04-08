import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { messageSchema } from '@/lib/validators/events';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();

    // Validate with schema
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid message data', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { conversationId, content } = validation.data;

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { match: true },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is part of this match conversation
    if (conversation.match) {
      const isParticipant =
        conversation.match.newcomerId === userId ||
        conversation.match.buddyId === userId;

      if (!isParticipant) {
        return NextResponse.json(
          { error: 'Not authorized to send message' },
          { status: 403 }
        );
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: message.sender.name,
          content: message.content,
          createdAt: message.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
