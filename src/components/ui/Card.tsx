'use client';

import React from 'react';

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'featured';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseCardClasses = 'card';

    const variantClasses = {
      default: '',
      interactive: 'hover:shadow-md cursor-pointer',
      featured: 'border-2 border-lw-gold',
    };

    const finalClassName = `${baseCardClasses} ${variantClasses[variant]} ${className}`;

    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
