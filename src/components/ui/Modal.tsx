'use client';

import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      closeButton = true,
      size = 'md',
    },
    ref
  ) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    };

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div
          className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div
          ref={ref}
          className={`relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up w-full sm:w-auto ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        >
          {title && (
            <div className="sticky top-0 bg-white border-b border-lw-border px-6 py-4 rounded-t-3xl sm:rounded-t-2xl flex items-center justify-between">
              <h2 className="text-xl font-display text-lw-charcoal">
                {title}
              </h2>
              {closeButton && (
                <button
                  onClick={onClose}
                  className="p-1 text-lw-warm-gray hover:text-lw-charcoal transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
              )}
            </div>
          )}

          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
