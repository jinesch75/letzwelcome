'use client';

import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-24 h-24 text-2xl',
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', className = '' }, ref) => {
    const getInitials = (fullName: string) => {
      return fullName
        .split(' ')
        .map((n) => n.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-full bg-lw-gold text-lw-charcoal font-accent font-semibold overflow-hidden flex-shrink-0 ${className}`}
      >
        {src ? (
          <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <span>👤</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
