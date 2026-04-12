'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Button from '../ui/Button';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import MobileNav from './MobileNav';

export interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  onSignOut?: () => void;
  onMenuToggle?: () => void;
}

export default function Header({ user, onSignOut, onMenuToggle }: HeaderProps) {
  const t = useTranslations('nav');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: t('dashboard') },
    { href: '/matching', label: t('buddy') },
    { href: '/messages', label: t('messages') },
    { href: '/events', label: t('events') },
    { href: '/checklist', label: t('checklist') },
    { href: '/clubs', label: t('clubs') },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-lw-cream border-b border-lw-border/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo — "BL" monogram matching Beautiful Luxembourg brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-baseline leading-none select-none">
                <span className="text-2xl font-[900] text-[#C0392B] font-display tracking-tight">B</span>
                <span className="text-2xl font-[900] text-lw-blue-deep font-display tracking-tight">L</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-lw-blue-deep font-display leading-none block">Beautiful</span>
                <span className="text-sm font-semibold text-lw-blue-deep font-display leading-none block">Luxembourg</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-semibold text-lw-charcoal/70 hover:text-lw-charcoal hover:bg-black/5 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* User Menu or Sign In */}
              {user ? (
                <UserMenu user={user} onSignOut={onSignOut || (() => {})} />
              ) : (
                <Link href="/auth/signin">
                  <Button variant="primary" size="sm">
                    {t('signIn')}
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-lw-blue-deep hover:bg-lw-gold-light transition-colors"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileNavOpen && <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} user={user} onSignOut={onSignOut} />}
    </>
  );
}
