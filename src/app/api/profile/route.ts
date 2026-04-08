import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { profileSchema } from '@/lib/validators/profile';

/**
 * GET /api/profile
 * Returns the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        profile: true,
        buddyProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.profile.id,
      userId: user.id,
      arrivalDate: user.profile.arrivalDate,
      countryOfOrigin: user.profile.countryOfOrigin,
      currentRegion: user.profile.currentRegion,
      languagesSpoken: user.profile.languagesSpoken,
      interests: user.profile.interests,
      familySituation: user.profile.familySituation,
      professionalBackground: user.profile.professionalBackground,
      needsHelp: user.profile.needsHelp,
      preferredMeetingStyle: user.profile.preferredMeetingStyle,
      availability: user.profile.availability,
      ageRangePreference: user.profile.ageRangePreference,
      genderPreference: user.profile.genderPreference,
      bio: user.profile.bio,
      avatarUrl: user.profile.avatarUrl,
      role: user.role,
      buddyProfile: user.buddyProfile,
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Updates the current user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate input
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
        countryOfOrigin: data.countryOfOrigin,
        currentRegion: data.currentRegion,
        languagesSpoken: data.languagesSpoken,
        interests: data.interests,
        familySituation: data.familySituation,
        professionalBackground: data.professionalBackground,
        needsHelp: data.needsHelp,
        preferredMeetingStyle: data.preferredMeetingStyle,
        availability: data.availability,
        ageRangePreference: data.ageRangePreference,
        genderPreference: data.genderPreference,
        bio: data.bio,
        avatarUrl: data.avatarUrl || null,
      },
      create: {
        userId,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
        countryOfOrigin: data.countryOfOrigin,
        currentRegion: data.currentRegion,
        languagesSpoken: data.languagesSpoken,
        interests: data.interests,
        familySituation: data.familySituation,
        professionalBackground: data.professionalBackground,
        needsHelp: data.needsHelp,
        preferredMeetingStyle: data.preferredMeetingStyle,
        availability: data.availability,
        ageRangePreference: data.ageRangePreference,
        genderPreference: data.genderPreference,
        bio: data.bio,
        avatarUrl: data.avatarUrl || null,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return NextResponse.json({
      ...profile,
      role: user?.role,
    });
  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile
 * Soft-deletes the current user's account (GDPR compliant)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Soft-delete: mark the user as deleted
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        suspended: true,
        suspendReason: 'Account deleted by user',
      },
    });

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
