import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            match: {
              OR: [
                { newcomerId: userId },
                { buddyId: userId },
              ],
            },
          },
          {
            event: {
              participants: {
                some: { userId: session.user.id },
              },
            },
          },
        ],
      },
      include: {
        match: {
          select: {
            newcomerId: true,
            buddyId: true,
            newcomer: {
              select: { id: true, name: true, profile: { select: { avatarUrl: true } } },
            },
            buddy: {
              select: { id: true, name: true, profile: { select: { avatarUrl: true } } },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc', // most recent first
        },
      },
    });

    // Format response
    const formattedConversations = conversations.map(conv => {
      let participantId = '';
      let participantName = '';
      let participantImage = '';

      if (conv.match) {
        if (conv.match.newcomerId === userId) {
          participantId = conv.match.buddy.id;
          participantName = conv.match.buddy.name;
          participantImage = conv.match.buddy.profile?.avatarUrl || '';
        } else {
          participantId = conv.match.newcomer.id;
          participantName = conv.match.newcomer.name;
          participantImage = conv.match.newcomer.profile?.avatarUrl || '';
        }
      }

      const lastMessage = conv.messages[0];

      return {
        id: conv.id,
        participantId,
        participantName,
        participantImage,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt || new Date(),
        unreadCount: 0, // Will implement read status tracking separately
      };
    });

    return NextResponse.json(
      {
        conversations: formattedConversations,
        currentUserId: userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
