import { NextRequest, NextResponse } from 'next/server';
import { onboardingSchema } from '@/lib/validators/profile';

/**
 * POST /api/profile/onboarding
 * Creates/updates profile and buddy profile, sets user role, marks onboarding as complete
 */
export async function POST(request: NextRequest) {
  try {
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

    // TODO: Get user ID from session/auth context
    const userId = 'user-id-from-session';

    // TODO: Implement database transactions
    // await db.$transaction(async (tx) => {
    //   // Create or update profile
    //   const createdProfile = await tx.profile.upsert({
    //     where: { userId },
    //     update: profile,
    //     create: {
    //       userId,
    //       ...profile,
    //     },
    //   });
    //
    //   // Create buddy profile if needed
    //   if (buddyProfile && ['BUDDY', 'BOTH'].includes(role)) {
    //     await tx.buddyProfile.upsert({
    //       where: { userId },
    //       update: buddyProfile,
    //       create: {
    //         userId,
    //         ...buddyProfile,
    //       },
    //     });
    //   }
    //
    //   // Update user role
    //   await tx.user.update({
    //     where: { id: userId },
    //     data: {
    //       role,
    //       onboardingCompleted: true,
    //       onboardingCompletedAt: new Date(),
    //     },
    //   });
    // });

    // Mock response
    const response = {
      success: true,
      message: 'Onboarding completed successfully',
      profile: {
        id: '1',
        userId,
        role,
        ...profile,
      },
      buddyProfile: buddyProfile || null,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('POST /api/profile/onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
