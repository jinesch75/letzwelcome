import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import prisma from '@/lib/db';

export default async function VolunteeringPage() {
  const t = await getTranslations('volunteering');

  // Fetch volunteering-related clubs
  const volunteeringClubs = await prisma.club.findMany({
    where: {
      activityType: {
        contains: 'Volunteering',
        mode: 'insensitive',
      },
    },
    take: 6,
  });

  const buddyOpportunities = [
    {
      id: 1,
      title: 'title_buddy_program',
      description: 'desc_buddy_program',
      requirements: ['req_1', 'req_2', 'req_3'],
      impact: 'impact_buddy',
      icon: '🤝',
    },
    {
      id: 2,
      title: 'title_mentor',
      description: 'desc_mentor',
      requirements: ['req_1', 'req_2', 'req_3'],
      impact: 'impact_mentor',
      icon: '👨‍🏫',
    },
    {
      id: 3,
      title: 'title_event_organizer',
      description: 'desc_event_organizer',
      requirements: ['req_1', 'req_2', 'req_3'],
      impact: 'impact_organizer',
      icon: '🎯',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-green-light py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-lw-warm-gray max-w-3xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Benevolat Link */}
        <Card className="p-8 mb-12 bg-lw-green-light border-2 border-lw-green animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-green mb-2">
                🌟 {t('benevolat_title')}
              </h2>
              <p className="text-lw-charcoal mb-4">
                {t('benevolat_description')}
              </p>
            </div>
            <a
              href="https://benevolat.lu"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="lg">
                {t('visitBenevolat')} →
              </Button>
            </a>
          </div>
        </Card>

        {/* Buddy Volunteering Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-8">
            🤝 {t('buddy_volunteering')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {buddyOpportunities.map(opp => (
              <Card
                key={opp.id}
                className="p-6 hover:shadow-lg transition-all animate-slide-up"
              >
                <div className="text-5xl mb-4">{opp.icon}</div>
                <h3 className="text-xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-2">
                  {t(opp.title)}
                </h3>
                <p className="text-lw-charcoal mb-4 text-sm">
                  {t(opp.description)}
                </p>

                {/* Requirements */}
                <div className="mb-4">
                  <h4 className="text-xs font-[family-name:var(--font-accent)] text-lw-warm-gray uppercase mb-2">
                    {t('requirements')}
                  </h4>
                  <ul className="space-y-1">
                    {opp.requirements.map((req, idx) => (
                      <li key={idx} className="text-xs text-lw-charcoal flex items-center gap-2">
                        <span>✓</span> {t(req)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact */}
                <div className="p-3 bg-lw-green-light rounded-lg mb-4">
                  <p className="text-xs text-lw-green font-medium">
                    💚 {t(opp.impact)}
                  </p>
                </div>

                <Link href="/matching">
                  <Button variant="secondary" size="sm" className="w-full">
                    {t('learnMore')}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Volunteering Clubs */}
        {volunteeringClubs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-8">
              🌍 {t('volunteering_clubs')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {volunteeringClubs.map(club => (
                <Link key={club.id} href={`/clubs/${club.id}`}>
                  <Card
                    variant="interactive"
                    className="h-full p-6 hover:shadow-lg transition-all animate-slide-up"
                  >
                    <div className="text-4xl mb-3">🌱</div>
                    <h3 className="text-lg font-[family-name:var(--font-display)] text-lw-blue-deep mb-2">
                      {club.name}
                    </h3>
                    <p className="text-sm text-lw-warm-gray mb-4 line-clamp-2">
                      {club.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="green" className="text-xs">
                        {club.activityType}
                      </Badge>
                      <Badge variant="blue" className="text-xs">
                        {club.region}
                      </Badge>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full">
                      {t('viewClub')}
                    </Button>
                  </Card>
                </Link>
              ))}
            </div>
            <Link href="/clubs?activity=volunteering" className="block mt-6">
              <Button variant="secondary" size="lg" className="w-full">
                {t('allVolunteeringClubs')}
              </Button>
            </Link>
          </div>
        )}

        {/* Why Volunteer */}
        <Card className="p-8 mb-12 bg-lw-gold-light animate-slide-up">
          <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
            💡 {t('why_volunteer')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} className="bg-white p-4 rounded-lg">
                <p className="text-2xl mb-2">
                  {num === 1 && '🤝'}
                  {num === 2 && '👥'}
                  {num === 3 && '🎯'}
                  {num === 4 && '💪'}
                  {num === 5 && '🌟'}
                  {num === 6 && '❤️'}
                </p>
                <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-1">
                  {t(`benefit_${num}_title`)}
                </h4>
                <p className="text-sm text-lw-warm-gray">
                  {t(`benefit_${num}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Getting Started */}
        <Card className="p-8 bg-gradient-to-r from-lw-green to-lw-blue-deep text-white animate-slide-up">
          <h2 className="text-3xl font-[family-name:var(--font-display)] mb-4">
            🚀 {t('getting_started')}
          </h2>
          <ol className="space-y-3 mb-6 text-lg">
            <li className="flex items-center gap-3">
              <span className="bg-white text-lw-green font-bold rounded-full w-8 h-8 flex items-center justify-center">
                1
              </span>
              {t('step_1')}
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white text-lw-green font-bold rounded-full w-8 h-8 flex items-center justify-center">
                2
              </span>
              {t('step_2')}
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white text-lw-green font-bold rounded-full w-8 h-8 flex items-center justify-center">
                3
              </span>
              {t('step_3')}
            </li>
          </ol>
          <Link href="/matching">
            <Button variant="gold" size="lg">
              {t('startJourney')} →
            </Button>
          </Link>
        </Card>

        {/* FAQ Preview */}
        <Card className="mt-12 p-8 animate-slide-up">
          <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
            ❓ {t('faq')}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map(num => (
              <div key={num} className="p-4 bg-lw-cream rounded-lg">
                <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                  {t(`faq_${num}_q`)}
                </h4>
                <p className="text-lw-charcoal text-sm">
                  {t(`faq_${num}_a`)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
