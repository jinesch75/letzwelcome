import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { buddyId, personalMessage } = await request.json();

    if (!buddyId) {
      return NextResponse.json({ error: 'Missing buddyId' }, { status: 400 });
    }

    // Create match request
    const match = await prisma.match.create({
      data: {
        newcomerId: userId,
        buddyId,
        personalMessage: personalMessage || null,
        status: 'PENDING',
      },
      include: {
        newcomer: { select: { id: true, name: true } },
        buddy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        match: {
          id: match.id,
          status: match.status,
          createdAt: match.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
