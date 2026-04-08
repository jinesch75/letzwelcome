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

    // Time windows
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User stats
    const totalUsers = await prisma.user.count({
      where: { deletedAt: null },
    });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: true,
    });

    const newRegistrationsWeek = await prisma.user.count({
      where: {
        createdAt: { gte: weekAgo },
        deletedAt: null,
      },
    });

    const newRegistrationsMonth = await prisma.user.count({
      where: {
        createdAt: { gte: monthAgo },
        deletedAt: null,
      },
    });

    const activeUsersMonth = await prisma.user.count({
      where: {
        lastActiveAt: { gte: thirtyDaysAgo },
        deletedAt: null,
      },
    });

    // Match stats
    const totalMatches = await prisma.match.count();

    const matchesByStatus = await prisma.match.groupBy({
      by: ['status'],
      _count: true,
    });

    const acceptedMatches = await prisma.match.count({
      where: { status: 'ACCEPTED' },
    });

    const completedMatches = await prisma.match.count({
      where: { status: 'COMPLETED' },
    });

    const pendingMatches = await prisma.match.count({
      where: { status: 'PENDING' },
    });

    const acceptanceRate =
      totalMatches > 0 ? ((acceptedMatches + completedMatches) / totalMatches * 100).toFixed(1) : '0';

    // Ratings
    const averageRating = await prisma.review.aggregate({
      _avg: { rating: true },
    });

    // Messages
    const totalMessages = await prisma.message.count();

    // Events and Clubs
    const totalEvents = await prisma.event.count();
    const upcomingEvents = await prisma.event.count({
      where: { date: { gte: now } },
    });

    const totalClubs = await prisma.club.count();

    // Checklist completion
    const totalChecklistItems = await prisma.userChecklistProgress.count();
    const completedChecklistItems = await prisma.userChecklistProgress.count({
      where: { completed: true },
    });

    const checklistCompletionRate =
      totalChecklistItems > 0
        ? ((completedChecklistItems / totalChecklistItems) * 100).toFixed(1)
        : '0';

    // Reports
    const openReports = await prisma.abuseReport.count({
      where: { status: 'OPEN' },
    });

    const totalReports = await prisma.abuseReport.count();

    // Registration trends (past 12 weeks)
    const registrationsByWeek = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd,
          },
          deletedAt: null,
        },
      });

      registrationsByWeek.push({
        week: weekStart.toISOString().split('T')[0],
        registrations: count,
      });
    }

    // Regional breakdown
    const regionStats = await prisma.profile.groupBy({
      by: ['currentRegion'],
      where: { user: { deletedAt: null } },
      _count: true,
    });

    const stats = {
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, r) => {
          acc[r.role] = r._count;
          return acc;
        }, {} as Record<string, number>),
        newThisWeek: newRegistrationsWeek,
        newThisMonth: newRegistrationsMonth,
        activeLastMonth: activeUsersMonth,
      },
      matches: {
        total: totalMatches,
        pending: pendingMatches,
        accepted: acceptedMatches,
        completed: completedMatches,
        acceptanceRate: parseFloat(acceptanceRate as string),
        byStatus: matchesByStatus.reduce((acc, s) => {
          acc[s.status] = s._count;
          return acc;
        }, {} as Record<string, number>),
      },
      ratings: {
        averageBuddyRating: averageRating._avg.rating || 0,
      },
      messaging: {
        totalMessages,
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
      },
      clubs: {
        total: totalClubs,
      },
      checklist: {
        completionRate: parseFloat(checklistCompletionRate as string),
      },
      reports: {
        open: openReports,
        total: totalReports,
      },
      regions: regionStats.map((r) => ({
        region: r.currentRegion || 'Unknown',
        count: r._count,
      })),
      trends: {
        registrationsByWeek,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
