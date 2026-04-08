'use client';

import React from 'react';

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      count = 1,
      animated = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'bg-lw-border';
    const animationClass = animated ? 'animate-pulse' : '';

    const variantClasses = {
      text: `h-4 rounded ${animationClass}`,
      circle: `rounded-full ${animationClass}`,
      card: `rounded-xl min-h-64 ${animationClass}`,
    };

    const widthClass = width ? `w-${width}` : 'w-full';
    const heightClass =
      height && variant !== 'text'
        ? ''
        : variant === 'circle'
          ? 'h-12 w-12'
          : '';

    const skeletonContent = (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${heightClass} ${className}`}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
        }}
        {...props}
      />
    );

    if (count === 1) {
      return skeletonContent;
    }

    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${heightClass}`}
            style={{
              width: typeof width === 'number' ? `${width}px` : width,
              height: typeof height === 'number' ? `${height}px` : height,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

export default Skeleton;
