'use client';

import React from 'react';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blue' | 'gold' | 'green' | 'red' | 'gray' | 'secondary';
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'blue', icon, className = '', children, ...props }, ref) => {
    const baseClasses = 'badge-pill inline-flex items-center gap-1.5';

    const variantClasses = {
      blue: 'bg-lw-blue-light bg-opacity-15 text-lw-blue-deep',
      gold: 'bg-lw-gold bg-opacity-15 text-lw-gold',
      green: 'bg-lw-green bg-opacity-15 text-lw-green',
      red: 'bg-lw-red bg-opacity-15 text-lw-red',
      gray: 'bg-lw-warm-gray bg-opacity-15 text-lw-charcoal',
      secondary: 'bg-lw-border text-lw-charcoal',
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
      <span ref={ref} className={finalClassName} {...props}>
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
