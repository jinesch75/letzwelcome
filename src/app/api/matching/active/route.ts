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

    // Get active matches (ACCEPTED)
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { newcomerId: userId, status: 'ACCEPTED' },
          { buddyId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        newcomer: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        buddy: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        conversation: {
          select: {
            id: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                content: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { acceptedAt: 'desc' },
    });

    const formatted = matches.map(match => {
      // Determine the "other" user
      const isNewcomer = match.newcomerId === userId;
      const otherUser = isNewcomer ? match.buddy : match.newcomer;
      const lastMessage = match.conversation?.messages[0];

      return {
        id: match.id,
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        otherUserImage: otherUser.profile?.avatarUrl,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt || match.acceptedAt || new Date(),
        conversationId: match.conversation?.id || '',
      };
    });

    return NextResponse.json(
      { matches: formatted },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching active matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
