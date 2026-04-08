import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const { action } = body;

    if (action === 'export') {
      // Create export request
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          buddyProfile: true,
          matchesAsNewcomer: true,
          matchesAsBuddy: true,
          messagesSent: true,
          eventsCreated: true,
          badges: { include: { badge: true } },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Prepare export data (sanitized)
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          profile: user.profile,
          buddyProfile: user.buddyProfile,
        },
        matches: {
          asNewcomer: user.matchesAsNewcomer.length,
          asBuddy: user.matchesAsBuddy.length,
        },
        messages: user.messagesSent.length,
        events: user.eventsCreated.length,
        badges: user.badges.map((b) => b.badge.name),
      };

      // In production, save export request and send email
      return NextResponse.json(
        {
          status: 'export_initiated',
          message: 'Your data export has been initiated. Check your email for a download link.',
        },
        { status: 200 }
      );
    } else if (action === 'delete') {
      // Initiate deletion with 30-day cooloff
      const cooloffDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // In production, mark for deletion and send confirmation email
      return NextResponse.json(
        {
          status: 'deletion_initiated',
          cooloffDate,
          message: 'Your account deletion request has been registered. You have 30 days to cancel.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('GDPR request error:', error);
    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    let data: any = {};

    if (!type || type === 'exports') {
      // Fetch export requests from your GDPR tracking system
      data.exportRequests = [];
    }

    if (!type || type === 'deletions') {
      // Fetch deletion requests with cooloff countdown
      data.deletionRequests = [];
    }

    if (!type || type === 'inactive') {
      const twoYearsAgo = new Date(Date.now() - 24 * 30 * 12 * 60 * 60 * 1000);
      const inactiveUsers = await prisma.user.findMany({
        where: {
          lastActiveAt: { lte: twoYearsAgo },
          deletedAt: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          lastActiveAt: true,
        },
        take: 100,
      });

      data.inactiveUsers = inactiveUsers;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('GDPR data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GDPR requests' },
      { status: 500 }
    );
  }
}
