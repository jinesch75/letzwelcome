'use client';

import React from 'react';

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  progress: number;
  color?: 'blue' | 'gold' | 'green' | 'red';
  showPercentage?: boolean;
  animated?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      progress,
      color = 'blue',
      showPercentage = true,
      animated = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100);

    const colorClasses = {
      blue: 'bg-lw-blue-light',
      gold: 'bg-lw-gold',
      green: 'bg-lw-green',
      red: 'bg-lw-red',
    };

    const finalClassName = `w-full ${className}`;

    return (
      <div ref={ref} className={finalClassName} {...props}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <div className="w-full h-2 bg-lw-border rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500 ${
                  animated ? 'ease-out' : ''
                }`}
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
          </div>
          {showPercentage && (
            <span className="ml-3 text-sm font-medium text-lw-charcoal whitespace-nowrap">
              {Math.round(normalizedProgress)}%
            </span>
          )}
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
