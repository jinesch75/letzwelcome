'use client';

import React, { useState, useRef, useEffect } from 'react';
import Avatar from '../ui/Avatar';
import { Link } from '@/i18n/routing';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface UserMenuProps {
  user: User;
  onSignOut: () => void;
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
        aria-label={`User menu for ${user.name}`}
      >
        <Avatar name={user.name} src={user.image} size="md" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-lw-cream border border-lw-border rounded-lg shadow-lg z-50 animate-scale-in overflow-hidden">
          <div className="px-4 py-3 border-b border-lw-border bg-lw-gold-light">
            <p className="text-sm font-semibold text-lw-charcoal">{user.name}</p>
            <p className="text-xs text-lw-charcoal opacity-75">{user.email}</p>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-lw-charcoal hover:bg-lw-gold-light transition-colors"
            >
              View Profile
            </Link>
            <Link
              href="/profile/edit"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-lw-charcoal hover:bg-lw-gold-light transition-colors"
            >
              Edit Profile
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-lw-blue-deep font-medium hover:bg-lw-gold-light transition-colors border-t border-lw-border"
              >
                Admin Panel
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-lw-red hover:bg-lw-gold-light transition-colors border-t border-lw-border font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
