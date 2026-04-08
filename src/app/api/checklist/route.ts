import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all checklist items with user's progress
    const items = await prisma.checklistItem.findMany({
      include: {
        progress: {
          where: { userId: userId },
          select: { completed: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Calculate totals
    const totalCount = items.length;
    const completedCount = items.filter(
      item => item.progress.length > 0 && item.progress[0].completed
    ).length;

    // Format response
    const formattedItems = items.map(item => ({
      id: item.id,
      titleKey: item.titleKey,
      descriptionKey: item.descriptionKey,
      category: item.category,
      region: item.region,
      externalLinks: item.externalLinks,
      isEuOnly: item.isEuOnly,
      isNonEuOnly: item.isNonEuOnly,
      isFamilyOnly: item.isFamilyOnly,
      stepsKey: item.stepsKey,
      completed: item.progress.length > 0 && item.progress[0].completed,
    }));

    return NextResponse.json({
      items: formattedItems,
      completedCount,
      totalCount,
    });
  } catch (error) {
    console.error('[CHECKLIST_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();
    const { checklistItemId, completed } = body;

    if (!checklistItemId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Verify item exists
    const item = await prisma.checklistItem.findUnique({
      where: { id: checklistItemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    // Upsert user progress
    const progress = await prisma.userChecklistProgress.upsert({
      where: {
        userId_checklistItemId: {
          userId: userId,
          checklistItemId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: userId,
        checklistItemId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({
      id: progress.id,
      completed: progress.completed,
    });
  } catch (error) {
    console.error('[CHECKLIST_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
