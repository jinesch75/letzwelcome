'use client';

import { useState } from 'react';
import { Modal, Button, Select, Textarea } from '@/components/ui';
import { useTranslations } from 'next-intl';

type TargetType = 'user' | 'content' | 'event' | 'club';

interface ReportModalProps {
  targetType: TargetType;
  targetId: string;
  onClose: () => void;
}

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const t = useTranslations('safety');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'HARASSMENT', label: t('categories.harassment') },
    { value: 'INAPPROPRIATE', label: t('categories.inappropriate') },
    { value: 'SCAM', label: t('categories.scam') },
    { value: 'THREATS', label: t('categories.threats') },
    { value: 'IDENTITY', label: t('categories.identity') },
    { value: 'OTHER', label: t('categories.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!category) {
      setError(t('errors.categoryRequired'));
      return;
    }

    if (description.length < 10) {
      setError(t('errors.descriptionTooShort'));
      return;
    }

    setIsSubmitting(true);

    try {
      const reportPayload: any = {
        category,
        description,
      };

      if (targetType === 'user') {
        reportPayload.reportedUserId = targetId;
      } else if (targetType === 'event') {
        reportPayload.contentType = 'EVENT';
        reportPayload.contentId = targetId;
      } else if (targetType === 'club') {
        reportPayload.contentType = 'CLUB';
        reportPayload.contentId = targetId;
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(t('errors.submissionFailed'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('reportModal.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {success ? (
          <div className="p-4 bg-lw-green-light border border-lw-green rounded">
            <p className="text-lw-charcoal font-medium">{t('reportModal.successMessage')}</p>
          </div>
        ) : (
          <>
            <Select
              label={t('reportModal.category')}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categories}
              required
            />

            <Textarea
              label={t('reportModal.description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('reportModal.descriptionPlaceholder')}
              minLength={10}
              maxLength={2000}
              rows={5}
              required
            />

            {error && (
              <div className="p-3 bg-lw-red/10 border border-lw-red text-lw-red rounded">
                {error}
              </div>
            )}

            <div className="bg-lw-gold-light border-l-4 border-lw-gold p-3 rounded text-sm">
              <p className="text-lw-charcoal font-medium mb-1">
                {t('reportModal.emergencyTitle')}
              </p>
              <p className="text-lw-warm-gray">
                {t('reportModal.emergencyText')} <br />
                <strong>{t('reportModal.police')}: 113</strong> |
                <strong> {t('reportModal.helpline')}: 8002 8080</strong>
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting || !category || description.length < 10}
              >
                {isSubmitting ? t('common.submitting') : t('common.submit')}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
