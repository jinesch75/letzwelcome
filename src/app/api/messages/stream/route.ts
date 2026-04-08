import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

async function getNewMessages(
  conversationId: string,
  lastMessageTime: Date
): Promise<any[]> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        createdAt: { gt: lastMessageTime },
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map(msg => ({
      id: msg.id,
      senderId: msg.sender.id,
      senderName: msg.sender.name,
      content: msg.content,
      createdAt: msg.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversationId' },
        { status: 400 }
      );
    }

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
    }

    // Set up SSE response
    const encoder = new TextEncoder();
    let lastMessageTime = new Date();
    let isClosed = false;

    const customReadable = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode('data: {"status":"connected"}\n\n'));

        // Poll for new messages every 2 seconds
        const pollInterval = setInterval(async () => {
          if (isClosed) {
            clearInterval(pollInterval);
            controller.close();
            return;
          }

          try {
            const newMessages = await getNewMessages(
              conversationId,
              lastMessageTime
            );

            if (newMessages.length > 0) {
              // Update lastMessageTime
              lastMessageTime = new Date(
                newMessages[newMessages.length - 1].createdAt
              );

              // Send each new message
              for (const msg of newMessages) {
                const data = JSON.stringify(msg);
                controller.enqueue(
                  encoder.encode(`data: ${data}\n\n`)
                );
              }
            }
          } catch (error) {
            console.error('Error in poll interval:', error);
          }
        }, 2000);
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in message stream:', error);
    return NextResponse.json(
      { error: 'Failed to establish stream' },
      { status: 500 }
    );
  }
}
