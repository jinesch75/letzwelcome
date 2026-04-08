import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import StarRating from '@/components/ui/StarRating';

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  region?: string;
  languages?: string[];
  interests?: string[];
  verified?: boolean;
  role?: 'NEWCOMER' | 'BUDDY' | 'BOTH';
  createdAt: Date;
}

interface BuddyProfile {
  expertiseAreas?: string[];
  regionsServed?: string[];
  rating?: number;
  reviewCount?: number;
  isAcceptingMatches?: boolean;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  createdAt: Date;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ProfileData extends User {
  buddyProfile?: BuddyProfile;
  reviews?: Review[];
  badges?: Badge[];
  isOwnProfile?: boolean;
}

// Mock function - replace with actual DB call
async function getProfile(id: string): Promise<ProfileData> {
  // This would fetch from your database
  return {
    id,
    name: 'Sample User',
    avatarUrl: '',
    bio: 'New to Luxembourg, excited to explore!',
    region: 'Luxembourg City',
    languages: ['English', 'French'],
    interests: ['Hiking', 'Cooking', 'Music'],
    verified: true,
    role: 'NEWCOMER',
    createdAt: new Date('2026-01-15'),
    isOwnProfile: false,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('profile');
  const profile = await getProfile(id);

  const memberSince = profile.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const isBuddy = ['BUDDY', 'BOTH'].includes(profile.role || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-blue-light to-lw-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <Card className="mb-8 p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex flex-col items-center flex-shrink-0">
              <Avatar
                size="xl"
                src={profile.avatarUrl}
                alt={profile.name}
              />
              {profile.verified && (
                <div className="mt-2 flex items-center gap-1 text-lw-blue-deep text-xs">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Verified
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep">
                    {profile.name}
                  </h1>
                  <p className="text-lw-warm-gray text-sm mt-1">
                    Member since {memberSince}
                  </p>
                </div>
                {profile.isOwnProfile && (
                  <Link href="/profile/edit">
                    <Button variant="secondary">Edit Profile</Button>
                  </Link>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {profile.region && (
                  <div>
                    <p className="text-xs text-lw-warm-gray font-medium mb-1">
                      REGION
                    </p>
                    <p className="text-lw-charcoal font-medium">
                      {profile.region}
                    </p>
                  </div>
                )}
                {profile.role && (
                  <div>
                    <p className="text-xs text-lw-warm-gray font-medium mb-1">
                      ROLE
                    </p>
                    <Badge variant="blue">{profile.role}</Badge>
                  </div>
                )}
                {isBuddy && profile.buddyProfile?.rating && (
                  <div>
                    <p className="text-xs text-lw-warm-gray font-medium mb-1">
                      RATING
                    </p>
                    <div className="flex items-center gap-2">
                      <StarRating
                        rating={profile.buddyProfile.rating}
                        readonly
                      />
                      <span className="text-xs text-lw-warm-gray">
                        ({profile.buddyProfile.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div>
                  <p className="text-xs text-lw-warm-gray font-medium mb-2">
                    LANGUAGES
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang) => (
                      <Badge key={lang} variant="green">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Bio Section */}
        {profile.bio && (
          <Card className="mb-8 p-8 animate-slide-up">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              About
            </h2>
            <p className="text-lw-charcoal leading-relaxed">{profile.bio}</p>
          </Card>
        )}

        {/* Interests Section */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="mb-8 p-8 animate-slide-up">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <Badge key={interest} variant="gold">
                  {interest}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Buddy Info Section */}
        {isBuddy && profile.buddyProfile && (
          <Card className="mb-8 p-8 animate-slide-up">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              As a Buddy
            </h2>

            {profile.buddyProfile.expertiseAreas &&
              profile.buddyProfile.expertiseAreas.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-lw-warm-gray mb-3">
                    AREAS OF EXPERTISE
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.buddyProfile.expertiseAreas.map((area) => (
                      <Badge key={area} variant="blue">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {profile.buddyProfile.regionsServed &&
              profile.buddyProfile.regionsServed.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-lw-warm-gray mb-3">
                    REGIONS SERVED
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.buddyProfile.regionsServed.map((region) => (
                      <Badge key={region} variant="green">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  profile.buddyProfile.isAcceptingMatches
                    ? 'bg-lw-green'
                    : 'bg-lw-warm-gray'
                }`}
              />
              <span className="text-sm text-lw-charcoal">
                {profile.buddyProfile.isAcceptingMatches
                  ? 'Accepting matches'
                  : 'Not accepting matches at this time'}
              </span>
            </div>
          </Card>
        )}

        {/* Badges Section */}
        {profile.badges && profile.badges.length > 0 && (
          <Card className="mb-8 p-8 animate-slide-up">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              Badges & Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.badges.map((badge) => (
                <Card
                  key={badge.id}
                  className="p-4 text-center border-lw-border border-2"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-lw-warm-gray">
                    {badge.description}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews Section */}
        {isBuddy && profile.reviews && profile.reviews.length > 0 && (
          <Card className="mb-8 p-8 animate-slide-up">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              Reviews ({profile.reviews.length})
            </h2>
            <div className="space-y-4">
              {profile.reviews.map((review) => (
                <Card key={review.id} className="p-4 border-lw-border border-2">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-lw-charcoal">
                      {review.author}
                    </p>
                    <StarRating
                      rating={review.rating}
                      readonly
                      size="sm"
                    />
                  </div>
                  <p className="text-lw-charcoal text-sm">{review.text}</p>
                  <p className="text-xs text-lw-warm-gray mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Call to Action */}
        {!profile.isOwnProfile && isBuddy && (
          <Card className="p-8 text-center bg-gradient-to-r from-lw-gold-light to-lw-blue-light">
            <h3 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              Connect with {profile.name}
            </h3>
            <p className="text-lw-charcoal mb-6">
              Start your buddy journey today
            </p>
            <Button variant="gold" size="lg">
              Send a Message
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
