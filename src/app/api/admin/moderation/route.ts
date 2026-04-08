import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

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

    const [reports, flags] = await Promise.all([
      prisma.abuseReport.findMany({
        include: {
          reporter: { select: { id: true, email: true, name: true } },
          reportedUser: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contentFlag.findMany({
        include: {
          reporter: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const queue = {
      reports: reports.map((r) => ({
        id: r.id,
        type: 'report' as const,
        reporter: r.reporter,
        category: r.category,
        description: r.description,
        targetUser: r.reportedUser,
        status: r.status,
        createdAt: r.createdAt,
        adminNotes: r.adminNotes,
      })),
      flags: flags.map((f) => ({
        id: f.id,
        type: 'flag' as const,
        reporter: f.reporter,
        contentType: f.contentType,
        contentId: f.contentId,
        reason: f.reason,
        status: f.status,
        createdAt: f.createdAt,
      })),
    };

    return NextResponse.json(queue);
  } catch (error) {
    console.error('Moderation queue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation queue' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { id, type, action, notes } = body;

    let result;

    if (type === 'report') {
      result = await prisma.abuseReport.update({
        where: { id },
        data: {
          status:
            action === 'resolve'
              ? 'RESOLVED'
              : action === 'investigate'
              ? 'INVESTIGATING'
              : 'DISMISSED',
          adminNotes: notes,
          resolvedAt: ['resolve', 'dismiss'].includes(action) ? new Date() : undefined,
          resolvedById: ['resolve', 'dismiss'].includes(action) ? userId : undefined,
        },
      });
    } else if (type === 'flag') {
      result = await prisma.contentFlag.update({
        where: { id },
        data: {
          status:
            action === 'approve'
              ? 'RESOLVED'
              : action === 'reject'
              ? 'DISMISSED'
              : 'OPEN',
        },
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminUserId: userId,
        action: `moderation_${type}_${action}`,
        targetType: type,
        targetId: id,
        details: notes,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Moderation update error:', error);
    return NextResponse.json(
      { error: 'Failed to update moderation item' },
      { status: 500 }
    );
  }
}
