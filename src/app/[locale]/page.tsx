import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const features = [
    {
      emoji: '👥',
      titleKey: 'featureBuddy',
      descKey: 'featureBuddyDesc',
    },
    {
      emoji: '🎉',
      titleKey: 'featureEvents',
      descKey: 'featureEventsDesc',
    },
    {
      emoji: '✓',
      titleKey: 'featureChecklist',
      descKey: 'featureChecklistDesc',
    },
    {
      emoji: '🤝',
      titleKey: 'featureClubs',
      descKey: 'featureClubsDesc',
    },
  ];

  const trustMethods = [
    { icon: '🆔', label: 'LinkedIn & Google verification' },
    { icon: '🛡️', label: 'Safety-first guidelines' },
    { icon: '👁️', label: 'Community moderation' },
  ];

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-lw-blue-deep text-lw-cream py-24 md:py-40">
          {/* Grain Overlay */}
          <div className="grain-overlay absolute inset-0 opacity-5" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Decorative Gold Line */}
            <div className="absolute top-0 left-8 w-1 h-12 bg-lw-gold md:left-12" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-7xl font-bold leading-tight mb-6 text-lw-cream">
                  {t('heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-lw-cream/90 mb-8 leading-relaxed max-w-xl">
                  {t('heroSubtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button variant="gold" size="lg" className="w-full sm:w-auto">
                      {t('cta')}
                    </Button>
                  </Link>
                  <Link href="/checklist">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto border-lw-cream text-lw-cream hover:bg-lw-cream hover:text-lw-blue-deep"
                    >
                      {t('ctaSecondary')}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Decorative Illustration Area */}
              <div className="hidden lg:block animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-lw-cream/10 rounded-3xl h-96 flex items-center justify-center border-2 border-lw-cream/20 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-8xl mb-4">👋</div>
                    <p className="text-lw-cream/70 font-[family-name:var(--font-accent)]">
                      Welcome to Luxembourg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 md:py-32 bg-lw-cream">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-lw-blue-deep mb-4">
                {t('statsTitle')}
              </h2>
              <div className="h-1 w-16 bg-lw-gold mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.titleKey}
                  className="card bg-white p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300 animate-slide-up"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="text-5xl mb-4">{feature.emoji}</div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-lw-blue-deep mb-3">
                    {t(feature.titleKey as any)}
                  </h3>
                  <p className="text-lw-warm-gray leading-relaxed">
                    {t(feature.descKey as any)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-lw-blue-light/10 rounded-3xl p-12 md:p-16 border-2 border-lw-blue-light/20">
              <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-lw-blue-deep mb-6 animate-fade-in">
                {t('trustTitle')}
              </h2>
              <p className="text-lg text-lw-charcoal mb-12 max-w-2xl animate-fade-in">
                {t('trustDesc')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {trustMethods.map((method, index) => (
                  <div
                    key={method.label}
                    className="flex items-start gap-4 animate-slide-up"
                    style={{ animationDelay: `${(index + 1) * 0.15}s` }}
                  >
                    <div className="flex-shrink-0 text-4xl">{method.icon}</div>
                    <p className="text-lw-charcoal font-medium">{method.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-32 bg-lw-gold-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-lw-blue-deep mb-8 animate-fade-in">
              Ready to find your place?
            </h2>
            <p className="text-lg text-lw-charcoal mb-8 max-w-2xl mx-auto animate-fade-in">
              Join thousands of newcomers who've built meaningful connections and found belonging in Luxembourg.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg" className="animate-scale-in">
                {t('cta')}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
