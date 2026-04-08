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

    const { searchParams } = new URL(req.url);
    const actionType = searchParams.get('action');
    const adminId = searchParams.get('adminId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const logs = await prisma.adminLog.findMany({
      where: {
        ...(actionType && { action: { contains: actionType, mode: 'insensitive' } }),
        ...(adminId && { adminUserId: adminId }),
        ...(startDate && {
          createdAt: { gte: new Date(startDate) },
        }),
        ...(endDate && {
          createdAt: { lte: new Date(endDate) },
        }),
      },
      include: {
        admin: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json(
      logs.map((log) => ({
        id: log.id,
        admin: log.admin,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        details: log.details,
        timestamp: log.createdAt,
      }))
    );
  } catch (error) {
    console.error('Admin logs fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin logs' },
      { status: 500 }
    );
  }
}
