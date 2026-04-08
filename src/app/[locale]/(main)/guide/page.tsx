import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default async function GuidePage() {
  const t = await getTranslations('guide');

  const sections = [
    {
      id: 'volunteering',
      title: 'title_volunteering',
      icon: '🤝',
      color: 'green',
      link: '/volunteering',
    },
    {
      id: 'clubs',
      title: 'title_clubs',
      icon: '🏢',
      color: 'blue',
      link: '/clubs',
    },
    {
      id: 'events',
      title: 'title_events',
      icon: '🎉',
      color: 'gold',
      link: '/events',
    },
    {
      id: 'languages',
      title: 'title_languages',
      icon: '🗣️',
      color: 'blue',
      link: '/clubs?activity=language',
    },
    {
      id: 'settling',
      title: 'title_settling',
      icon: '🏠',
      color: 'green',
      link: '/checklist',
    },
  ];

  type ColorVariant = 'blue' | 'gold' | 'green' | 'red' | 'gray';

  const colorMap: Record<string, ColorVariant> = {
    green: 'green',
    blue: 'blue',
    gold: 'gold',
    red: 'red',
    gray: 'gray',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-blue-light py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-5xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-lw-warm-gray">
            {t('subtitle')}
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {sections.map(section => (
            <Link key={section.id} href={section.link}>
              <Card
                variant="interactive"
                className="h-full p-6 text-center hover:shadow-lg transition-all animate-slide-up"
              >
                <div className="text-5xl mb-3">{section.icon}</div>
                <h3 className="font-[family-name:var(--font-display)] text-lw-blue-deep mb-3">
                  {t(section.title)}
                </h3>
                <p className="text-sm text-lw-warm-gray mb-4">
                  {t(`desc_${section.id}`)}
                </p>
                <Button variant="secondary" size="sm" className="w-full">
                  {t('explore')}
                </Button>
              </Card>
            </Link>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Volunteering */}
          <Card className="p-8 animate-slide-up">
            <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              🤝 {t('title_volunteering')}
            </h2>
            <div className="prose prose-sm max-w-none text-lw-charcoal mb-6">
              <p className="text-lg leading-relaxed">
                {t('volunteering_intro')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-lw-green-light p-4 rounded-lg">
                <h4 className="font-[family-name:var(--font-accent)] text-lw-green mb-2">
                  {t('volunteering_why')}
                </h4>
                <ul className="text-sm text-lw-charcoal space-y-1">
                  <li>✓ {t('volunteer_benefit_1')}</li>
                  <li>✓ {t('volunteer_benefit_2')}</li>
                  <li>✓ {t('volunteer_benefit_3')}</li>
                </ul>
              </div>
              <div className="bg-lw-blue-light p-4 rounded-lg">
                <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                  {t('volunteering_opportunities')}
                </h4>
                <ul className="text-sm text-lw-charcoal space-y-1">
                  <li>✓ {t('volunteer_type_1')}</li>
                  <li>✓ {t('volunteer_type_2')}</li>
                  <li>✓ {t('volunteer_type_3')}</li>
                </ul>
              </div>
            </div>
            <Link href="/volunteering">
              <Button variant="primary" size="lg">
                {t('viewVolunteering')}
              </Button>
            </Link>
          </Card>

          {/* Joining Clubs */}
          <Card className="p-8 animate-slide-up">
            <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              🏢 {t('title_clubs')}
            </h2>
            <p className="text-lg text-lw-charcoal leading-relaxed mb-6">
              {t('clubs_intro')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['language', 'hobby', 'professional'].map(type => (
                <div key={type} className="bg-lw-cream p-4 rounded-lg border border-lw-border">
                  <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                    {t(`club_type_${type}`)}
                  </h4>
                  <p className="text-sm text-lw-warm-gray">
                    {t(`club_type_${type}_desc`)}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/clubs">
              <Button variant="secondary" size="lg">
                {t('browseClubs')}
              </Button>
            </Link>
          </Card>

          {/* Community Events */}
          <Card className="p-8 animate-slide-up">
            <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              🎉 {t('title_events')}
            </h2>
            <p className="text-lg text-lw-charcoal leading-relaxed mb-6">
              {t('events_intro')}
            </p>
            <div className="bg-lw-gold-light p-6 rounded-lg mb-6">
              <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-3">
                {t('popular_events')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['social', 'cultural', 'sports', 'workshop'].map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="text-lg">
                      {type === 'social' && '👥'}
                      {type === 'cultural' && '🎭'}
                      {type === 'sports' && '⚽'}
                      {type === 'workshop' && '🛠️'}
                    </span>
                    <span className="text-lw-charcoal text-sm">
                      {t(`event_type_${type}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/events">
              <Button variant="primary" size="lg">
                {t('discoverEvents')}
              </Button>
            </Link>
          </Card>

          {/* Learning Languages */}
          <Card className="p-8 animate-slide-up">
            <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              🗣️ {t('title_languages')}
            </h2>
            <p className="text-lg text-lw-charcoal leading-relaxed mb-6">
              {t('languages_intro')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-[family-name:var(--font-accent)] text-lw-green mb-3">
                  {t('language_options')}
                </h4>
                <ul className="space-y-2 text-lw-charcoal">
                  <li className="flex items-center gap-2">
                    <span className="text-lw-gold">🟡</span> {t('lang_luxembourgish')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lw-gold">🟡</span> {t('lang_french')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lw-gold">🟡</span> {t('lang_german')}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-3">
                  {t('language_resources')}
                </h4>
                <ul className="space-y-2 text-lw-charcoal">
                  <li>✓ {t('resource_coffee')}</li>
                  <li>✓ {t('resource_tandem')}</li>
                  <li>✓ {t('resource_courses')}</li>
                </ul>
              </div>
            </div>
            <Link href="/clubs?activity=language">
              <Button variant="secondary" size="lg">
                {t('findLanguageGroups')}
              </Button>
            </Link>
          </Card>

          {/* Settling In Tips */}
          <Card className="p-8 animate-slide-up">
            <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
              🏠 {t('title_settling')}
            </h2>
            <p className="text-lg text-lw-charcoal leading-relaxed mb-6">
              {t('settling_intro')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {['housing', 'healthcare', 'administration', 'finance'].map(topic => (
                <div key={topic} className="bg-lw-blue-light p-4 rounded-lg">
                  <h4 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                    {t(`settling_${topic}`)}
                  </h4>
                  <p className="text-sm text-lw-charcoal">
                    {t(`settling_${topic}_tip`)}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/checklist">
              <Button variant="gold" size="lg">
                {t('startChecklist')}
              </Button>
            </Link>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-16 p-8 bg-gradient-to-r from-lw-blue-deep to-lw-gold text-white animate-slide-up">
          <h2 className="text-3xl font-[family-name:var(--font-display)] mb-4">
            {t('cta_title')}
          </h2>
          <p className="text-lg mb-6 text-gray-100">
            {t('cta_description')}
          </p>
          <Link href="/dashboard">
            <Button variant="gold" size="lg">
              {t('getCommunity')}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
