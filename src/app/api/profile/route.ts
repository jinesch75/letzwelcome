import { NextRequest, NextResponse } from 'next/server';
import { profileSchema } from '@/lib/validators/profile';

/**
 * GET /api/profile
 * Returns the current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth context
    const userId = 'user-id-from-session';

    // TODO: Fetch from database
    // const profile = await db.profile.findUnique({
    //   where: { userId },
    //   include: { buddyProfile: true }
    // });

    // Mock response
    const profile = {
      id: '1',
      userId: userId,
      arrivalDate: '2025-09-15',
      countryOfOrigin: 'Portugal',
      currentRegion: 'Luxembourg City',
      languagesSpoken: ['English', 'French', 'Portuguese'],
      interests: ['Hiking', 'Cooking'],
      familySituation: 'Couple without children',
      professionalBackground: 'Software Engineer',
      needsHelp: ['Housing', 'Healthcare'],
      preferredMeetingStyle: 'Coffee/café',
      availability: 'Weekends',
      ageRangePreference: '26-35',
      genderPreference: 'any',
      bio: 'Recently moved from Portugal, excited to explore Luxembourg!',
      avatarUrl: '',
      role: 'NEWCOMER',
      buddyProfile: null,
    };

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
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
    const body = await request.json();

    // Validate input
    const validationResult = profileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // TODO: Get user ID from session/auth context
    const userId = 'user-id-from-session';

    // TODO: Update in database
    // const profile = await db.profile.update({
    //   where: { userId },
    //   data: validationResult.data,
    //   include: { buddyProfile: true }
    // });

    // Mock response
    const profile = {
      id: '1',
      userId: userId,
      ...validationResult.data,
      role: 'NEWCOMER',
    };

    return NextResponse.json(profile);
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
 * Deletes the current user's account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth context
    const userId = 'user-id-from-session';

    // TODO: Delete from database (cascade delete profile, buddyProfile, etc.)
    // await db.user.delete({
    //   where: { id: userId }
    // });

    // TODO: Optionally archive data for GDPR compliance before deletion

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
