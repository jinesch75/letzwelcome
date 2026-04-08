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
    const type = searchParams.get('type');

    const data: any = {};

    if (!type || type === 'checklist') {
      data.checklistItems = await prisma.checklistItem.findMany({
        orderBy: { order: 'asc' },
      });
    }

    if (!type || type === 'guidance') {
      data.articles = await prisma.guidanceArticle.findMany({
        orderBy: { order: 'asc' },
      });
    }

    if (!type || type === 'routes') {
      data.routes = await prisma.autopedestreRoute.findMany();
    }

    if (!type || type === 'badges') {
      data.badges = await prisma.badge.findMany();
    }

    if (!type || type === 'announcements') {
      data.announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const { type, ...data } = body;

    let result;

    if (type === 'checklist') {
      result = await prisma.checklistItem.create({ data });
    } else if (type === 'guidance') {
      result = await prisma.guidanceArticle.create({ data });
    } else if (type === 'routes') {
      result = await prisma.autopedestreRoute.create({ data });
    } else if (type === 'badges') {
      result = await prisma.badge.create({ data });
    } else if (type === 'announcements') {
      result = await prisma.announcement.create({ data });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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
    const { id, type, ...data } = body;

    let result;

    if (type === 'checklist') {
      result = await prisma.checklistItem.update({
        where: { id },
        data,
      });
    } else if (type === 'guidance') {
      result = await prisma.guidanceArticle.update({
        where: { id },
        data,
      });
    } else if (type === 'routes') {
      result = await prisma.autopedestreRoute.update({
        where: { id },
        data,
      });
    } else if (type === 'badges') {
      result = await prisma.badge.update({
        where: { id },
        data,
      });
    } else if (type === 'announcements') {
      result = await prisma.announcement.update({
        where: { id },
        data,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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
    const { id, type } = body;

    let result;

    if (type === 'checklist') {
      result = await prisma.checklistItem.delete({ where: { id } });
    } else if (type === 'guidance') {
      result = await prisma.guidanceArticle.delete({ where: { id } });
    } else if (type === 'routes') {
      result = await prisma.autopedestreRoute.delete({ where: { id } });
    } else if (type === 'badges') {
      result = await prisma.badge.delete({ where: { id } });
    } else if (type === 'announcements') {
      result = await prisma.announcement.delete({ where: { id } });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Content deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
