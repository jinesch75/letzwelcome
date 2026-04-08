import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import prisma from '@/lib/db';

interface ClubDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations('clubDetail');

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      events: {
        where: {
          date: { gte: new Date() },
        },
        orderBy: { date: 'asc' },
        take: 5,
      },
    },
  });

  if (!club) {
    return (
      <div className="min-h-screen bg-lw-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <p className="text-xl text-lw-warm-gray mb-4">{t('notFound')}</p>
            <Link href="/clubs">
              <Button variant="secondary">{t('backToClubs')}</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-blue-light py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/clubs" className="inline-block mb-6">
          <Button variant="secondary" size="sm">
            ← {t('backToClubs')}
          </Button>
        </Link>

        {/* Main Card */}
        <Card className="p-8 mb-8 animate-fade-in">
          {/* Hero */}
          <div className="w-full h-64 bg-gradient-to-br from-lw-blue-light to-lw-green-light rounded-lg flex items-center justify-center text-6xl mb-8">
            🏢
          </div>

          {/* Title & Badges */}
          <div className="mb-6">
            <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              {club.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="green">{club.activityType}</Badge>
              <Badge variant="blue">{club.region}</Badge>
              {club.meetingFrequency && (
                <Badge variant="gray">{club.meetingFrequency}</Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-lw-charcoal leading-relaxed mb-8 whitespace-pre-wrap">
            {club.description}
          </p>

          {/* Languages */}
          {club.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-3">
                🗣️ {t('languages')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {club.languages.map(lang => (
                  <Badge key={lang} variant="gold">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-t border-b border-lw-border mb-8">
            {club.contactEmail && (
              <div>
                <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase mb-1">
                  {t('email')}
                </p>
                <a
                  href={`mailto:${club.contactEmail}`}
                  className="text-lw-blue-deep hover:text-lw-gold transition-colors font-medium"
                >
                  {club.contactEmail}
                </a>
              </div>
            )}
            {club.contactUrl && (
              <div>
                <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase mb-1">
                  {t('website')}
                </p>
                <a
                  href={club.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lw-blue-deep hover:text-lw-gold transition-colors font-medium"
                >
                  {t('visitWebsite')} →
                </a>
              </div>
            )}
            {club.benevolatLink && (
              <div>
                <p className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase mb-1">
                  {t('volunteering')}
                </p>
                <a
                  href={club.benevolatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lw-green hover:text-lw-gold transition-colors font-medium"
                >
                  {t('benevolutPage')} →
                </a>
              </div>
            )}
          </div>

          {/* Follow Button */}
          <div className="flex gap-3 mb-8">
            <Button variant="primary" size="lg">
              ⭐ {t('follow')}
            </Button>
            <Button variant="secondary" size="lg">
              📧 {t('notify')}
            </Button>
          </div>
        </Card>

        {/* Upcoming Events */}
        {club.events.length > 0 && (
          <Card className="p-8 animate-slide-up">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              📅 {t('upcomingEvents')}
            </h2>
            <div className="space-y-4">
              {club.events.map(event => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card variant="interactive" className="p-4 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lw-charcoal">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-lw-warm-gray">
                          <span>📅</span>
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>📍 {event.region}</span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">
                        {t('viewEvent')}
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <Link href={`/events?club=${club.id}`} className="block mt-6">
              <Button variant="secondary" className="w-full">
                {t('allEvents')}
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
