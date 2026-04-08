import { NextRequest, NextResponse } from 'next/server';
import { reportSchema } from '@/lib/validators/events';
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
    const validated = reportSchema.parse(body);

    // Ensure at least one target is specified
    if (!validated.reportedUserId && !validated.matchId) {
      return NextResponse.json(
        { error: 'Either reportedUserId or matchId must be provided' },
        { status: 400 }
      );
    }

    // If matchId is provided but no reportedUserId, resolve it from the match
    let reportedUserId = validated.reportedUserId;
    if (!reportedUserId && validated.matchId) {
      const match = await prisma.match.findUnique({
        where: { id: validated.matchId },
        select: { newcomerId: true, buddyId: true },
      });
      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      // Report the other party in the match
      reportedUserId = match.newcomerId === userId ? match.buddyId : match.newcomerId;
    }

    const report = await prisma.abuseReport.create({
      data: {
        reporterId: userId,
        reportedUserId: reportedUserId!,
        matchId: validated.matchId,
        category: validated.category,
        description: validated.description,
        status: 'OPEN',
      },
      include: {
        reporter: { select: { id: true, email: true, name: true } },
        reportedUser: { select: { id: true, email: true, name: true } },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const reports = await prisma.abuseReport.findMany({
      where: status ? { status: status as any } : {},
      include: {
        reporter: { select: { id: true, email: true, name: true } },
        reportedUser: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
