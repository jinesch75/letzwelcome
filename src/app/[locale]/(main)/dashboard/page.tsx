import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProgressBar from '@/components/ui/ProgressBar';

interface DashboardUser {
  id: string;
  name: string;
  avatarUrl?: string;
  role: 'NEWCOMER' | 'BUDDY' | 'BOTH';
  region?: string;
  onboardingCompleted: boolean;
}

interface BuddySuggestion {
  id: string;
  name: string;
  avatarUrl?: string;
  region: string;
  expertise: string[];
  rating?: number;
}

interface Activity {
  id: string;
  type: 'match' | 'message' | 'event' | 'review';
  description: string;
  timestamp: Date;
}

// Mock function - replace with actual DB call
async function getDashboardData(userId: string): Promise<{
  user: DashboardUser;
  buddySuggestions: BuddySuggestion[];
  incomingRequests: number;
  activeConnections: number;
  checklistProgress: number;
  recentActivity: Activity[];
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: Date;
    location: string;
  }>;
}> {
  // This would fetch from your database
  return {
    user: {
      id: '1',
      name: 'John Doe',
      avatarUrl: '',
      role: 'NEWCOMER',
      region: 'Luxembourg City',
      onboardingCompleted: true,
    },
    buddySuggestions: [
      {
        id: '2',
        name: 'Emma Smith',
        avatarUrl: '',
        region: 'Luxembourg City',
        expertise: ['Housing', 'Healthcare'],
        rating: 4.8,
      },
      {
        id: '3',
        name: 'Marco Rossi',
        avatarUrl: '',
        region: 'Esch-sur-Alzette',
        expertise: ['Employment', 'Finance & taxes'],
        rating: 4.9,
      },
    ],
    incomingRequests: 2,
    activeConnections: 1,
    checklistProgress: 45,
    recentActivity: [
      {
        id: '1',
        type: 'message',
        description: 'Emma sent you a message',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'match',
        description: 'You matched with Marco',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Welcome to Luxembourg Networking',
        date: new Date('2026-04-15'),
        location: 'Luxembourg City',
      },
      {
        id: '2',
        title: 'Hiking Meetup',
        date: new Date('2026-04-20'),
        location: 'Müllerthal',
      },
    ],
  };
}

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  // TODO: Get userId from session/auth context
  const userId = 'user-id-from-session';

  const {
    user,
    buddySuggestions,
    incomingRequests,
    activeConnections,
    checklistProgress,
    recentActivity,
    upcomingEvents,
  } = await getDashboardData(userId);

  const isNewcomer = ['NEWCOMER', 'BOTH'].includes(user.role);
  const isBuddy = ['BUDDY', 'BOTH'].includes(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-blue-light to-lw-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Avatar size="lg" src={user.avatarUrl} alt={user.name} />
            <div>
              <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep">
                Welcome back, {user.name}!
              </h1>
              <p className="text-lw-warm-gray">
                {user.region} • Member since 2026
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/matching">
            <Button variant="primary" size="lg" className="w-full">
              Find a Buddy
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="secondary" size="lg" className="w-full">
              Browse Events
            </Button>
          </Link>
          <Link href="/checklist">
            <Button variant="gold" size="lg" className="w-full">
              Continue Checklist
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Newcomer Section */}
            {isNewcomer && (
              <>
                {/* Buddy Suggestions */}
                <Card className="p-8 animate-slide-up">
                  <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                    Suggested Buddies
                  </h2>
                  <p className="text-lw-warm-gray mb-6">
                    We've matched you with {buddySuggestions.length} buddies based on your interests
                  </p>
                  <div className="space-y-4">
                    {buddySuggestions.map((buddy) => (
                      <Card
                        key={buddy.id}
                        variant="interactive"
                        className="p-4 flex items-start gap-4"
                      >
                        <Avatar size="md" src={buddy.avatarUrl} alt={buddy.name} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-lw-charcoal">
                              {buddy.name}
                            </h3>
                            {buddy.rating && (
                              <span className="text-xs text-lw-gold">
                                ★ {buddy.rating}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-lw-warm-gray mb-2">
                            {buddy.region}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {buddy.expertise.slice(0, 2).map((exp) => (
                              <Badge key={exp} variant="blue">
                                {exp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Link href={`/profile/${buddy.id}`}>
                          <Button variant="primary" size="sm">
                            View
                          </Button>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Checklist Progress */}
                <Card className="p-8 animate-slide-up">
                  <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                    Settlement Checklist
                  </h2>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-lw-charcoal">
                        Your progress
                      </p>
                      <p className="text-sm text-lw-warm-gray">
                        {checklistProgress}%
                      </p>
                    </div>
                    <ProgressBar
                      progress={checklistProgress}
                      color="blue"
                    />
                  </div>
                  <Link href="/checklist">
                    <Button variant="secondary" className="w-full">
                      Continue Checklist
                    </Button>
                  </Link>
                </Card>
              </>
            )}

            {/* Buddy Section */}
            {isBuddy && (
              <Card className="p-8 animate-slide-up">
                <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                  Your Buddy Activity
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-lw-blue-light rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-lw-blue-deep">
                      {incomingRequests}
                    </p>
                    <p className="text-xs text-lw-warm-gray mt-1">
                      Incoming Requests
                    </p>
                  </div>
                  <div className="bg-lw-green-light rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-lw-green">
                      {activeConnections}
                    </p>
                    <p className="text-xs text-lw-warm-gray mt-1">
                      Active Connections
                    </p>
                  </div>
                </div>
                <Link href="/matching">
                  <Button variant="primary" className="w-full">
                    View Match Requests
                  </Button>
                </Link>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card className="p-8 animate-slide-up">
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                Upcoming Events
              </h2>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card
                      key={event.id}
                      variant="interactive"
                      className="p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lw-charcoal">
                            {event.title}
                          </h3>
                          <p className="text-sm text-lw-warm-gray mt-1">
                            {event.date.toLocaleDateString()} •{' '}
                            {event.location}
                          </p>
                        </div>
                        <Link href={`/events/${event.id}`}>
                          <Button variant="secondary" size="sm">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-lw-warm-gray">No upcoming events</p>
              )}
              <Link href="/events" className="block mt-4">
                <Button variant="secondary" className="w-full">
                  Browse All Events
                </Button>
              </Link>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <Card className="p-6 animate-slide-up">
              <h3 className="text-lg font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
                Recent Activity
              </h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="pb-3 border-b border-lw-border last:border-b-0"
                    >
                      <p className="text-sm text-lw-charcoal">
                        {activity.description}
                      </p>
                      <p className="text-xs text-lw-warm-gray mt-1">
                        {Math.round(
                          (Date.now() - activity.timestamp.getTime()) /
                            (1000 * 60)
                        )}{' '}
                        minutes ago
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-lw-warm-gray">No recent activity</p>
              )}
            </Card>

            {/* Profile Completion */}
            <Card className="p-6 bg-lw-gold-light border-2 border-lw-gold animate-slide-up">
              <h3 className="text-lg font-[family-name:var(--font-accent)] text-lw-charcoal mb-3">
                Complete Your Profile
              </h3>
              <p className="text-sm text-lw-charcoal mb-4">
                Add a photo and more details to increase match quality
              </p>
              <Link href="/profile/edit">
                <Button variant="gold" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 animate-slide-up">
              <h3 className="text-lg font-[family-name:var(--font-accent)] text-lw-blue-deep mb-4">
                Quick Links
              </h3>
              <nav className="space-y-2">
                <Link href="/guide" className="block">
                  <p className="text-sm text-lw-blue-deep hover:text-lw-blue-light transition-colors">
                    → Settlement Guide
                  </p>
                </Link>
                <Link href="/clubs" className="block">
                  <p className="text-sm text-lw-blue-deep hover:text-lw-blue-light transition-colors">
                    → Clubs & Groups
                  </p>
                </Link>
                <Link href="/messages" className="block">
                  <p className="text-sm text-lw-blue-deep hover:text-lw-blue-light transition-colors">
                    → Messages
                  </p>
                </Link>
              </nav>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
