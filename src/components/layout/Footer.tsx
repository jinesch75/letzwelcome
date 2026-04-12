import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-lw-charcoal text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">{t('about.title')}</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              {t('about.description')}
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">{t('links.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-white/70 hover:text-lw-gold transition-colors text-sm"
                >
                  {t('links.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white/70 hover:text-lw-gold transition-colors text-sm"
                >
                  {t('links.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/70 hover:text-lw-gold transition-colors text-sm"
                >
                  {t('links.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/70 hover:text-lw-gold transition-colors text-sm"
                >
                  {t('links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Language Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-4">{t('language.title')}</h3>
            <p className="text-white/70 text-sm mb-3">
              {t('language.description')}
            </p>
            <div className="flex gap-2">
              <a href="/en" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium">
                EN
              </a>
              <a href="/fr" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium">
                FR
              </a>
              <a href="/lb" className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium">
                LB
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-white/50 text-sm">
            {t('tagline')} — {currentYear}
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 text-white/50 text-sm">
            <span>Made with care in Luxembourg</span>
            <span className="text-lg">❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
