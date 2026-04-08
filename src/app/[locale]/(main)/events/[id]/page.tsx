import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

interface EventDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations('eventDetail');
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      route: true,
    },
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-lw-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-xl text-lw-warm-gray mb-4">{t('notFound')}</p>
            <Link href="/events">
              <Button variant="secondary">{t('backToEvents')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const confirmedParticipants = event.participants.filter(p => p.status === 'CONFIRMED');
  const interestedParticipants = event.participants.filter(p => p.status === 'INTERESTED');
  const userParticipation = event.participants.find(p => p.userId === session?.user?.id);

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, 'blue' | 'gold' | 'green' | 'red' | 'gray'> = {
      Social: 'blue',
      Cultural: 'gold',
      Sports: 'green',
      'Language exchange': 'blue',
      'Walking tour': 'green',
      Workshop: 'gold',
      Family: 'green',
      'Professional networking': 'gold',
      Volunteering: 'green',
      Other: 'gray',
    };
    return colorMap[category] || 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-blue-light py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/events" className="inline-block mb-6">
          <Button variant="secondary" size="sm">
            ← {t('backToEvents')}
          </Button>
        </Link>

        {/* Main Content */}
        <Card className="p-8 mb-8 animate-fade-in">
          {/* Hero Image */}
          <div className="w-full h-96 bg-gradient-to-br from-lw-blue-light to-lw-gold-light rounded-lg flex items-center justify-center text-6xl mb-8">
            {event.type === 'WALK' ? '🥾' : '🎉'}
          </div>

          {/* Title & Badges */}
          <div className="mb-6">
            <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-3">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
              {event.type === 'WALK' && (
                <Badge variant="green">
                  {event.route?.difficulty || t('walk')}
                </Badge>
              )}
              <Badge variant="blue">
                {event.language}
              </Badge>
            </div>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 py-6 border-y border-lw-border">
            <div>
              <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase">
                {t('date')}
              </p>
              <p className="text-lg font-bold text-lw-blue-deep mt-1">
                {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm text-lw-warm-gray">
                {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase">
                {t('location')}
              </p>
              <p className="text-lg font-bold text-lw-blue-deep mt-1">
                {event.region}
              </p>
              {event.meetingPoint && (
                <p className="text-sm text-lw-warm-gray">
                  {event.meetingPoint}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase">
                {t('participants')}
              </p>
              <p className="text-lg font-bold text-lw-blue-deep mt-1">
                {event.participants.length}
              </p>
              {event.maxParticipants && (
                <p className="text-sm text-lw-warm-gray">
                  / {event.maxParticipants}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase">
                {t('organizer')}
              </p>
              <p className="text-lg font-bold text-lw-blue-deep mt-1">
                {event.creator.name}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-3">
              {t('about')}
            </h2>
            <p className="text-lw-charcoal leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Walking Tour Info */}
          {event.type === 'WALK' && event.route && (
            <div className="mb-8 bg-lw-green-light rounded-lg p-6">
              <h2 className="text-xl font-[family-name:var(--font-display)] text-lw-green mb-4">
                🗺️ {t('routeInfo')}
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-lw-warm-gray">{t('distance')}</p>
                  <p className="font-bold text-lw-charcoal">
                    {event.route.distanceKm} km
                  </p>
                </div>
                <div>
                  <p className="text-xs text-lw-warm-gray">{t('duration')}</p>
                  <p className="font-bold text-lw-charcoal">
                    {event.route.durationMinutes} {t('minutes')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-lw-warm-gray">{t('difficulty')}</p>
                  <p className="font-bold text-lw-charcoal">
                    {event.route.difficulty}
                  </p>
                </div>
              </div>
              {event.route.visitLuxembourgUrl && (
                <a
                  href={event.route.visitLuxembourgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-lw-green hover:text-lw-blue-deep transition-colors"
                >
                  {t('viewRoute')} →
                </a>
              )}
            </div>
          )}

          {/* RSVP Section */}
          {session && (
            <div className="mb-8 p-6 bg-lw-blue-light rounded-lg">
              <h3 className="text-lg font-[family-name:var(--font-accent)] text-lw-blue-deep mb-4">
                {t('rsvpTitle')}
              </h3>
              <div className="flex gap-3">
                {!userParticipation ? (
                  <>
                    <form
                      action={async () => {
                        'use server';
                        // RSVP will be handled by client-side form
                      }}
                    >
                      <Button variant="primary">
                        {t('interested')}
                      </Button>
                    </form>
                    <Button variant="secondary">
                      {t('confirmAttendance')}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-lw-charcoal py-2">
                      {userParticipation.status === 'CONFIRMED'
                        ? t('youConfirmed')
                        : t('youInterested')}
                    </p>
                    <Button variant="danger" size="sm">
                      {t('cancelRsvp')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Participants */}
          <div className="mb-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              {t('participants')} ({event.participants.length})
            </h2>
            {confirmedParticipants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase mb-3">
                  {t('confirmed')} ({confirmedParticipants.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {confirmedParticipants.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Avatar size="sm" src={p.user.image ?? undefined} alt={p.user.name} />
                      <span className="text-sm text-lw-charcoal">{p.user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {interestedParticipants.length > 0 && (
              <div>
                <h3 className="text-sm font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase mb-3">
                  {t('interested')} ({interestedParticipants.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {interestedParticipants.map(p => (
                    <div key={p.id} className="flex items-center gap-2 opacity-75">
                      <Avatar size="sm" src={p.user.image ?? undefined} alt={p.user.name} />
                      <span className="text-sm text-lw-warm-gray">{p.user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Group Chat */}
          {session && (
            <div className="p-6 bg-lw-cream rounded-lg">
              <h3 className="text-lg font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                💬 {t('groupChat')}
              </h3>
              <p className="text-sm text-lw-warm-gray mb-4">
                {t('chatDescription')}
              </p>
              <Link href={`/messages?event=${event.id}`}>
                <Button variant="secondary">
                  {t('goToChat')}
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Organizer Card */}
        <Card className="p-6 animate-slide-up">
          <h3 className="text-lg font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
            {t('organizedBy')}
          </h3>
          <div className="flex items-center gap-4">
            <Avatar size="lg" src={event.creator.image ?? undefined} alt={event.creator.name} />
            <div className="flex-1">
              <h4 className="font-medium text-lw-charcoal">{event.creator.name}</h4>
              <p className="text-sm text-lw-warm-gray">Community organizer</p>
            </div>
            <Link href={`/profile/${event.creator.id}`}>
              <Button variant="secondary" size="sm">
                {t('viewProfile')}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
