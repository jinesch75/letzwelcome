import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

    const body = await request.json();
    const { status } = body;

    if (!['INTERESTED', 'CONFIRMED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id },
      select: { maxParticipants: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check capacity if updating to CONFIRMED
    if (status === 'CONFIRMED' && event.maxParticipants) {
      const confirmedCount = await prisma.eventParticipant.count({
        where: {
          eventId: id,
          status: 'CONFIRMED',
        },
      });

      if (confirmedCount >= event.maxParticipants) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        );
      }
    }

    // Upsert participation
    const participant = await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId: userId,
        },
      },
      update: { status },
      create: {
        eventId: id,
        userId: userId,
        status,
      },
    });

    return NextResponse.json(participant);
  } catch (error) {
    console.error('[RSVP_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete RSVP
    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId: id,
          userId: userId,
        },
      },
    });

    return NextResponse.json({ message: 'RSVP cancelled' });
  } catch (error) {
    console.error('[RSVP_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
