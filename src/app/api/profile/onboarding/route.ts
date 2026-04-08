import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { onboardingSchema } from '@/lib/validators/profile';

/**
 * POST /api/profile/onboarding
 * Creates/updates profile and buddy profile, sets user role, marks onboarding as complete
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate input
    const validationResult = onboardingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid onboarding data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { role, profile, buddyProfile } = validationResult.data;

    // Use a transaction to ensure all updates succeed or none do
    const result = await prisma.$transaction(async (tx) => {
      // Create or update profile
      const createdProfile = await tx.profile.upsert({
        where: { userId },
        update: {
          ...profile,
          arrivalDate: profile.arrivalDate ? new Date(profile.arrivalDate) : null,
          avatarUrl: profile.avatarUrl || null,
          onboardingCompleted: true,
        },
        create: {
          userId,
          ...profile,
          arrivalDate: profile.arrivalDate ? new Date(profile.arrivalDate) : null,
          avatarUrl: profile.avatarUrl || null,
          onboardingCompleted: true,
        },
      });

      // Create buddy profile if needed
      let createdBuddyProfile = null;
      if (buddyProfile && ['BUDDY', 'BOTH'].includes(role)) {
        createdBuddyProfile = await tx.buddyProfile.upsert({
          where: { userId },
          update: buddyProfile,
          create: {
            userId,
            ...buddyProfile,
          },
        });
      }

      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role },
      });

      return { profile: createdProfile, buddyProfile: createdBuddyProfile };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Onboarding completed successfully',
        profile: result.profile,
        buddyProfile: result.buddyProfile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/profile/onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
