'use client';

import React, { useState } from 'react';

export interface StarRatingProps {
  rating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  (
    {
      rating = 0,
      onChange,
      readonly = false,
      size = 'md',
      showLabel = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    const sizeClass = sizeMap[size];
    const displayRating = hoverRating || rating;

    const handleClick = (newRating: number) => {
      if (!readonly) {
        onChange?.(newRating);
      }
    };

    const stars = Array.from({ length: 5 }, (_, i) => i + 1);

    return (
      <div
        ref={ref}
        className={`flex items-center gap-1 ${!readonly ? 'cursor-pointer' : ''} ${className}`}
        {...props}
      >
        <div className="flex gap-1">
          {stars.map((star) => (
            <button
              key={star}
              onClick={() => handleClick(star)}
              onMouseEnter={() => !readonly && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={readonly}
              className={`transition-colors duration-150 ${sizeClass} ${
                readonly ? 'cursor-default' : 'hover:scale-110'
              }`}
              aria-label={`Rate ${star} out of 5`}
            >
              {star <= displayRating ? (
                <svg
                  className="w-full h-full text-lw-gold fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : (
                <svg
                  className="w-full h-full text-lw-border fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {showLabel && (
          <span className="ml-2 text-sm font-medium text-lw-charcoal">
            {displayRating > 0 ? `${displayRating}.0` : 'No rating'}
          </span>
        )}
      </div>
    );
  }
);

StarRating.displayName = 'StarRating';

export default StarRating;
