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
    const search = searchParams.get('search')?.toLowerCase();
    const role = searchParams.get('role');
    const region = searchParams.get('region');
    const verified = searchParams.get('verified');
    const suspended = searchParams.get('suspended');

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(role && { role: role as any }),
        ...(verified === 'true' && { emailVerified: { not: null } }),
        ...(verified === 'false' && { emailVerified: null }),
        ...(suspended !== null && { suspended: suspended === 'true' }),
        ...(region && {
          profile: { currentRegion: region },
        }),
      },
      include: {
        profile: { select: { currentRegion: true } },
        badges: { include: { badge: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        region: u.profile?.currentRegion,
        verified: !!u.emailVerified,
        suspended: u.suspended,
        createdAt: u.createdAt,
        badges: u.badges.length,
      }))
    );
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
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

    const adminId = session.user.id;

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (admin?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, reason, badgeId, newRole } = body;

    let result;

    if (action === 'suspend') {
      result = await prisma.user.update({
        where: { id: userId },
        data: {
          suspended: true,
          suspendedAt: new Date(),
          suspendReason: reason,
        },
      });
    } else if (action === 'unsuspend') {
      result = await prisma.user.update({
        where: { id: userId },
        data: {
          suspended: false,
          suspendedAt: null,
          suspendReason: null,
        },
      });
    } else if (action === 'deactivate') {
      result = await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });
    } else if (action === 'change_role') {
      result = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
    } else if (action === 'award_badge') {
      result = await prisma.userBadge.create({
        data: {
          userId,
          badgeId,
        },
      });
    }

    // Log action
    await prisma.adminLog.create({
      data: {
        adminUserId: adminId,
        action: `user_${action}`,
        targetType: 'user',
        targetId: userId,
        details: reason || newRole || badgeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('User admin action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform admin action' },
      { status: 500 }
    );
  }
}
