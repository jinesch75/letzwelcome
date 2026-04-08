'use client';

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    { message, type = 'info', duration = 4000, onClose, action },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeConfig = {
      success: {
        bg: 'bg-lw-green',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      },
      error: {
        bg: 'bg-lw-red',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
      },
      info: {
        bg: 'bg-lw-blue-light',
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
    };

    const config = typeConfig[type];

    return (
      <div
        ref={ref}
        className={`${config.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up max-w-sm`}
      >
        <div className="flex-shrink-0">{config.icon}</div>
        <p className="text-sm font-medium flex-grow">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-semibold underline hover:opacity-80 transition-opacity ml-2 flex-shrink-0"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-white hover:opacity-75 transition-opacity flex-shrink-0"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;
