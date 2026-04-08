'use client';

import React from 'react';
import Button, { ButtonProps } from './Button';

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionButton?: ButtonProps & { label: string };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, actionButton, className = '', ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-lw-warm-gray flex justify-center">
            {typeof icon === 'string' ? (
              <span className="text-5xl">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}

        <h3 className="text-xl font-display text-lw-charcoal mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-base text-lw-warm-gray mb-6 max-w-sm">
            {description}
          </p>
        )}

        {actionButton && (
          <Button
            {...actionButton}
            variant={actionButton.variant || 'primary'}
            size={actionButton.size || 'md'}
          >
            {actionButton.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
