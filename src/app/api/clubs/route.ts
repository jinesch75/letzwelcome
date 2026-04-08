import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region') || '';
    const activityType = searchParams.get('activityType') || '';
    const language = searchParams.get('language') || '';

    const where: any = {};

    if (region) where.region = region;
    if (activityType) where.activityType = activityType;
    if (language) {
      where.languages = {
        has: language,
      };
    }

    const clubs = await prisma.club.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      clubs,
      total: clubs.length,
    });
  } catch (error) {
    console.error('[CLUBS_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
