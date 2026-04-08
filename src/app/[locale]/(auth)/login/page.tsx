'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signIn } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { loginSchema } from '@/lib/validators/auth';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [generalError, setGeneralError] = useState('');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');
    setLoading(true);

    try {
      // Validate form data
      const validated = loginSchema.parse(formData);

      // Sign in with credentials
      const result = await signIn('credentials', {
        email: validated.email,
        password: validated.password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError(t('errors.invalidCredentials'));
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {generalError && (
          <div className="p-4 bg-lw-red/10 border border-lw-red rounded-lg">
            <p className="text-lw-red text-sm font-medium">{generalError}</p>
          </div>
        )}

        <Input
          label={t('email')}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
          disabled={loading}
        />

        <Input
          label={t('password')}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          disabled={loading}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-lw-blue-deep hover:text-lw-blue-light transition-colors font-medium"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {t('signIn')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-lw-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-lw-cream text-lw-warm-gray font-[family-name:var(--font-accent)]">
            {t('orContinueWith')}
          </span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-8">
        <button
          type="button"
          onClick={() => signIn('google', { redirect: false })}
          disabled={loading}
          className="w-full py-2.5 px-4 border-2 border-lw-border rounded-xl font-medium text-lw-charcoal hover:bg-lw-gold-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('google')}
        </button>

        <button
          type="button"
          onClick={() => signIn('linkedin', { redirect: false })}
          disabled={loading}
          className="w-full py-2.5 px-4 border-2 border-lw-border rounded-xl font-medium text-lw-charcoal hover:bg-lw-gold-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.048-8.811 0-9.728h3.554v1.375c.428-.66 1.191-1.599 2.897-1.599 2.117 0 3.704 1.385 3.704 4.362v5.59zM5.337 6.734c-1.144 0-1.915-.759-1.915-1.71 0-.955.771-1.71 1.956-1.71 1.184 0 1.915.755 1.937 1.71 0 .951-.753 1.71-1.937 1.71zm1.582 13.718H3.635V8.456h3.284v11.996zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
          {t('linkedin')}
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-lw-charcoal">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-lw-blue-deep hover:text-lw-blue-light font-medium transition-colors">
          {t('signUp')}
        </Link>
      </p>
    </div>
  );
}
