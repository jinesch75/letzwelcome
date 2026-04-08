import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        events: {
          where: {
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
          take: 10,
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error('[CLUB_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
