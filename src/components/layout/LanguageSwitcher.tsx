'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

const locales: string[] = [...routing.locales];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const localeLabels: Record<string, string> = {
    en: 'EN',
    fr: 'FR',
    lb: 'LB',
  };

  // Get current locale from pathname
  const currentLocale = pathname.split('/')[0] || 'en';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLocaleChange = (locale: string) => {
    // Navigate to the same pathname in the new locale
    const pathWithoutLocale = pathname.split('/').slice(1).join('/');
    router.push(`/${locale}/${pathWithoutLocale}` as any);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-sm font-semibold text-lw-charcoal border border-lw-border bg-white hover:bg-lw-cream transition-colors gap-1"
        aria-label="Change language"
      >
        {localeLabels[currentLocale]}
        <svg
          className={`ml-1.5 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-20 bg-white border border-lw-border rounded-xl shadow-lg z-50 animate-scale-in overflow-hidden">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`block w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${
                currentLocale === locale
                  ? 'bg-lw-cream text-lw-charcoal'
                  : 'text-lw-warm-gray hover:bg-lw-cream hover:text-lw-charcoal'
              }`}
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
