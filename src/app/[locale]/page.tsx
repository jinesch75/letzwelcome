import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      iconBg: 'bg-lw-icon-pink',
      iconColor: 'text-lw-icon-pink-fg',
      title: t('featureBuddy'),
      desc: t('featureBuddyDesc'),
      href: '/matching',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      iconBg: 'bg-lw-icon-blue',
      iconColor: 'text-lw-icon-blue-fg',
      title: t('featureEvents'),
      desc: t('featureEventsDesc'),
      href: '/events',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      iconBg: 'bg-lw-green-light',
      iconColor: 'text-lw-green',
      title: t('featureChecklist'),
      desc: t('featureChecklistDesc'),
      href: '/checklist',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconBg: 'bg-lw-gold-light',
      iconColor: 'text-lw-blue-deep',
      title: t('featureClubs'),
      desc: t('featureClubsDesc'),
      href: '/clubs',
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
        {/* ── Hero Section ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-lw-cream min-h-[88vh] flex flex-col items-center justify-center text-center px-4">

          {/* Faded architectural background (SVG placeholder matching the BL screenshot aesthetic) */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `
                radial-gradient(ellipse 80% 60% at 50% 120%, rgba(74,127,181,0.08) 0%, transparent 70%)
              `,
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
            <h1
              className="font-display font-[800] text-lw-charcoal leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.03em' }}
            >
              Discover<br />Luxembourg
            </h1>

            <p className="text-lw-warm-gray text-lg md:text-xl mb-10 max-w-xl mx-auto font-body leading-relaxed">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {t('cta')}
                </Button>
              </Link>
              <Link href="/checklist">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t('ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature cards — matching the BL screenshot layout */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mx-auto mt-16 px-2">
            {features.map((feature, i) => (
              <Link key={feature.href} href={feature.href}>
                <div
                  className="card p-6 flex flex-col gap-4 cursor-pointer animate-slide-up text-left group"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`icon-badge ${feature.iconBg} ${feature.iconColor}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-[700] text-lw-charcoal text-base mb-1 leading-snug group-hover:text-lw-blue-deep transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-lw-warm-gray text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Admin link */}
          <div className="relative z-10 mt-10 mb-4">
            <Link href="/admin" className="text-xs text-lw-warm-gray hover:text-lw-charcoal transition-colors">
              Admin
            </Link>
          </div>
        </section>

        {/* ── Trust Section ─────────────────────────────────────────── */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16">
              <h2
                className="font-display font-[800] text-lw-charcoal mb-4"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
              >
                {t('trustTitle')}
              </h2>
              <p className="text-lw-warm-gray text-lg leading-relaxed">
                {t('trustDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trustMethods.map((method, index) => (
                <div
                  key={method.label}
                  className="flex items-start gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="icon-badge bg-lw-cream text-2xl">
                    {method.icon}
                  </div>
                  <p className="text-lw-charcoal font-semibold mt-2.5">{method.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section className="py-24 md:py-32 bg-lw-cream">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              className="font-display font-[800] text-lw-charcoal mb-6 animate-fade-in"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.02em' }}
            >
              Ready to find your place?
            </h2>
            <p className="text-lw-warm-gray text-lg mb-8 max-w-xl mx-auto animate-fade-in">
              Join thousands of newcomers who've built meaningful connections in Luxembourg.
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
