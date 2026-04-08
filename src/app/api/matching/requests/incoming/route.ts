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

    // Get incoming match requests (for buddies)
    const requests = await prisma.match.findMany({
      where: {
        buddyId: userId,
        status: 'PENDING',
      },
      include: {
        newcomer: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = requests.map(req => ({
      id: req.id,
      newcomerId: req.newcomer.id,
      newcomerName: req.newcomer.name,
      newcomerImage: req.newcomer.profile?.avatarUrl,
      personalMessage: req.personalMessage,
      createdAt: req.createdAt,
    }));

    return NextResponse.json(
      { requests: formatted },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching incoming requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
