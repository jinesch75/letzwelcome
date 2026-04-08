import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region') || '';
    const category = searchParams.get('category') || '';
    const language = searchParams.get('language') || '';
    const tab = searchParams.get('tab') || 'upcoming';

    const now = new Date();
    const where: any = {
      date: tab === 'upcoming' ? { gte: now } : { lt: now },
    };

    if (region) where.region = region;
    if (category) where.category = category;
    if (language) where.language = language;

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, image: true },
        },
        participants: {
          select: { userId: true, status: true },
        },
        route: true,
      },
      orderBy: { date: tab === 'upcoming' ? 'asc' : 'desc' },
      take: 100,
    });

    const formatted = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date.toISOString(),
      region: event.region,
      language: event.language,
      category: event.category,
      participantCount: event.participants.length,
      organizer: {
        name: event.creator.name,
        image: event.creator.image,
      },
      type: event.type,
      route: event.route ? {
        name: event.route.name,
        difficulty: event.route.difficulty,
      } : undefined,
    }));

    return NextResponse.json({
      events: formatted,
      total: events.length,
    });
  } catch (error) {
    console.error('[EVENTS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      title,
      description,
      type,
      region,
      date,
      meetingPoint,
      language,
      category,
      maxParticipants,
      autopedestreRouteId,
    } = body;

    // Validate required fields
    if (!title || !description || !region || !date || !language || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify route exists if specified
    if (autopedestreRouteId) {
      const route = await prisma.autopedestreRoute.findUnique({
        where: { id: autopedestreRouteId },
      });
      if (!route) {
        return NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        );
      }
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        region,
        date: new Date(date),
        meetingPoint,
        language,
        category,
        maxParticipants,
        autopedestreRouteId,
        creatorId: userId,
      },
      include: {
        creator: { select: { name: true } },
      },
    });

    // Create conversation for event group chat
    await prisma.conversation.create({
      data: {
        type: 'EVENT_GROUP',
        eventId: event.id,
      },
    });

    return NextResponse.json({
      id: event.id,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('[EVENTS_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
