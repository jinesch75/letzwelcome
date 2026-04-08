'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useTranslations } from 'next-intl';

interface SafetyChecklistProps {
  onDismiss?: () => void;
}

export function SafetyChecklist({ onDismiss }: SafetyChecklistProps) {
  const t = useTranslations('safety');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const guidelines = [
    t('checklist.guideline1'),
    t('checklist.guideline2'),
    t('checklist.guideline3'),
    t('checklist.guideline4'),
  ];

  return (
    <div className="border-l-4 border-lw-gold bg-lw-gold-light rounded-r-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lw-gold text-xl flex-shrink-0 mt-1">⚠️</span>
          <div>
            <h3 className="font-[family-name:var(--font-accent)] text-lw-charcoal font-semibold">
              {t('checklist.title')}
            </h3>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-lw-warm-gray hover:text-lw-charcoal transition"
        >
          {isExpanded ? (
            <span>▲</span>
          ) : (
            <span>▼</span>
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          <ul className="space-y-2 ml-8">
            {guidelines.map((guideline, index) => (
              <li key={index} className="text-sm text-lw-charcoal flex items-start gap-2">
                <span className="text-lw-gold font-bold">•</span>
                <span>{guideline}</span>
              </li>
            ))}
          </ul>

          <div className="bg-white/60 rounded p-3 space-y-3 mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAcknowledged}
                onChange={(e) => setIsAcknowledged(e.target.checked)}
                className="mt-1 w-4 h-4 accent-lw-gold rounded"
              />
              <span className="text-sm text-lw-charcoal">
                {t('checklist.acknowledgment')}
              </span>
            </label>

            <div className="flex gap-2">
              <Button
                variant="gold"
                size="sm"
                disabled={!isAcknowledged}
                onClick={() => {
                  setIsExpanded(false);
                }}
              >
                {t('checklist.confirm')}
              </Button>
              {onDismiss && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onDismiss}
                >
                  {t('checklist.dismiss')}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
