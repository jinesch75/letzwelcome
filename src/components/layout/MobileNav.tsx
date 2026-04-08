'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Avatar from '../ui/Avatar';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
  onSignOut?: () => void;
}

export default function MobileNav({ isOpen, onClose, user, onSignOut }: MobileNavProps) {
  const t = useTranslations('nav');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: t('dashboard'), icon: '📊' },
    { href: '/matching', label: t('buddy'), icon: '🤝' },
    { href: '/messages', label: t('messages'), icon: '💬' },
    { href: '/events', label: t('events'), icon: '📅' },
    { href: '/checklist', label: t('checklist'), icon: '✓' },
    { href: '/clubs', label: t('clubs'), icon: '👥' },
  ];

  const bottomNavLinks = [
    { href: '/dashboard', label: t('dashboard'), icon: '📊' },
    { href: '/matching', label: t('buddy'), icon: '🤝' },
    { href: '/messages', label: t('messages'), icon: '💬' },
    { href: '/events', label: t('events'), icon: '📅' },
    { href: '/profile', label: t('profile') || 'Profile', icon: '👤' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Menu */}
      <div className="fixed right-0 top-16 bottom-20 w-full max-w-xs bg-lw-cream border-l border-lw-border z-40 overflow-y-auto animate-slide-in-right">
        {/* Navigation Links */}
        <nav className="px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-lw-charcoal hover:bg-lw-gold-light transition-colors"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-lw-border my-4" />

        {/* User Info and Actions */}
        <div className="px-4 py-4 space-y-4">
          {user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-lw-gold-light transition-colors"
              >
                <Avatar name={user.name} src={user.image} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-lw-charcoal">{user.name}</p>
                  <p className="text-xs text-lw-charcoal opacity-75">{user.email}</p>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="space-y-2 pl-3 border-l-2 border-lw-gold">
                  <Link
                    href="/profile"
                    onClick={() => {
                      onClose();
                      setUserMenuOpen(false);
                    }}
                    className="block text-sm text-lw-charcoal hover:text-lw-blue-deep font-medium py-2"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => {
                      onClose();
                      setUserMenuOpen(false);
                    }}
                    className="block text-sm text-lw-charcoal hover:text-lw-blue-deep font-medium py-2"
                  >
                    Edit Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        onClose();
                        setUserMenuOpen(false);
                      }}
                      className="block text-sm text-lw-blue-deep font-medium py-2"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      onClose();
                      setUserMenuOpen(false);
                      onSignOut?.();
                    }}
                    className="block w-full text-left text-sm text-lw-red font-medium py-2 hover:text-lw-charcoal"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              href="/auth/signin"
              onClick={onClose}
              className="block w-full text-center px-4 py-2 bg-lw-blue-deep text-lw-cream rounded-lg font-medium hover:bg-lw-blue-light transition-colors"
            >
              {t('signIn')}
            </Link>
          )}

          {/* Language Switcher */}
          <div className="border-t border-lw-border pt-4">
            <p className="text-xs font-semibold text-lw-charcoal uppercase tracking-wide mb-3">Language</p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Mobile Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-lw-cream border-t border-lw-border lg:hidden">
        <nav className="flex items-center justify-around">
          {bottomNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex-1 flex flex-col items-center justify-center py-3 text-xs gap-1 text-lw-charcoal hover:bg-lw-gold-light transition-colors"
            >
              <span className="text-lg">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
