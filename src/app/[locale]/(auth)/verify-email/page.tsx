'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full space-y-8 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-lw-gold/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-lw-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-blue-deep mb-3">
          {t('verifyEmail')}
        </h1>
        <p className="text-lw-warm-gray">
          {t('verifyEmailDesc').replace('{email}', email)}
        </p>
      </div>

      {/* Check Email Info */}
      <div className="bg-lw-blue-light/5 border-2 border-lw-blue-light/20 rounded-xl p-6">
        <p className="text-lw-charcoal text-sm leading-relaxed">
          If you don't see the email in your inbox, please check your spam or junk folder. The verification link will expire in 24 hours.
        </p>
      </div>

      {/* Success Message */}
      {resendSuccess && (
        <div className="p-4 bg-lw-green/10 border border-lw-green rounded-lg">
          <p className="text-lw-green font-medium text-sm">
            Verification email sent! Please check your inbox.
          </p>
        </div>
      )}

      {/* Resend Button */}
      <div className="space-y-3">
        <Button
          onClick={handleResendEmail}
          disabled={resending}
          loading={resending}
          variant="secondary"
          size="md"
          className="w-full"
        >
          {t('resendEmail')}
        </Button>

        <p className="text-sm text-lw-warm-gray">
          Already verified?{' '}
          <a
            href="/login"
            className="text-lw-blue-deep hover:text-lw-blue-light font-medium transition-colors"
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
