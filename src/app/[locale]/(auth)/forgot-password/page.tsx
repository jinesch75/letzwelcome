'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validators/auth';
import { z } from 'zod';

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request reset form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Reset password form state
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResetEmailError('');
    setLoading(true);

    try {
      const validated = forgotPasswordSchema.parse({ email: resetEmail });

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset email. Please try again.');
      } else {
        setEmailSubmitted(true);
        setSuccess('Reset email sent! Please check your inbox.');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.issues[0];
        setResetEmailError(firstError?.message || 'Invalid email address');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setLoading(true);

    try {
      if (!token) {
        setError('Invalid reset link. Please request a new one.');
        return;
      }

      const validated = resetPasswordSchema.parse({
        token,
        password: newPassword,
      });

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password. Please try again.');
      } else {
        setSuccess(t('passwordChanged'));
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.issues[0];
        setPasswordError(firstError?.message || 'Invalid password');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show reset password form if token is present
  if (token) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center mb-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-lw-blue-deep mb-2">
            {t('setNewPassword')}
          </h2>
          <p className="text-lw-warm-gray text-sm">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          {error && (
            <div className="p-4 bg-lw-red/10 border border-lw-red rounded-lg">
              <p className="text-lw-red text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-lw-green/10 border border-lw-green rounded-lg">
              <p className="text-lw-green text-sm font-medium">{success}</p>
            </div>
          )}

          <Input
            label={t('newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            placeholder="Minimum 8 characters, 1 uppercase, 1 number"
            error={passwordError}
            disabled={loading}
            helperText="At least 8 characters, one uppercase letter, and one number"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {t('resetPassword')}
          </Button>
        </form>
      </div>
    );
  }

  // Show request reset form
  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-lw-blue-deep mb-2">
          {t('resetPassword')}
        </h2>
        <p className="text-lw-warm-gray text-sm">
          {t('resetPasswordDesc')}
        </p>
      </div>

      {emailSubmitted ? (
        <div className="space-y-6">
          {/* Success State */}
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

          <div className="bg-lw-gold/10 border border-lw-gold/30 rounded-lg p-4">
            <p className="text-lw-charcoal text-sm text-center">
              Check your email at <strong>{resetEmail}</strong> for a password reset link.
            </p>
          </div>

          <Button
            onClick={() => {
              setEmailSubmitted(false);
              setResetEmail('');
            }}
            variant="secondary"
            size="md"
            className="w-full"
          >
            Send another email
          </Button>

          <p className="text-center text-sm text-lw-warm-gray">
            Remember your password?{' '}
            <a
              href="/login"
              className="text-lw-blue-deep hover:text-lw-blue-light font-medium transition-colors"
            >
              Sign in instead
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleRequestReset} className="space-y-4">
          {error && (
            <div className="p-4 bg-lw-red/10 border border-lw-red rounded-lg">
              <p className="text-lw-red text-sm font-medium">{error}</p>
            </div>
          )}

          <Input
            label={t('email')}
            type="email"
            value={resetEmail}
            onChange={(e) => {
              setResetEmail(e.target.value);
              if (resetEmailError) setResetEmailError('');
            }}
            placeholder="you@example.com"
            error={resetEmailError}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading}
            className="w-full"
          >
            {t('sendResetLink')}
          </Button>

          <p className="text-center text-sm text-lw-warm-gray">
            Remember your password?{' '}
            <a
              href="/login"
              className="text-lw-blue-deep hover:text-lw-blue-light font-medium transition-colors"
            >
              Sign in here
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
