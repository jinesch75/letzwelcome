'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { REGIONS, LANGUAGES, EVENT_CATEGORIES } from '@/lib/utils/regions';

interface FormData {
  title: string;
  description: string;
  type: 'EVENT' | 'WALK';
  region: string;
  date: string;
  time: string;
  meetingPoint: string;
  language: string;
  category: string;
  maxParticipants: string;
  autopedestreRouteId?: string;
  imageUrl?: string;
}

export default function CreateEventPage() {
  const t = useTranslations('createEvent');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    type: 'EVENT',
    region: '',
    date: '',
    time: '18:00',
    meetingPoint: '',
    language: '',
    category: '',
    maxParticipants: '',
  });

  const handleChange = (
    field: keyof FormData,
    value: string
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!form.title || !form.description || !form.region || !form.date || !form.language || !form.category) {
        throw new Error(t('requiredFields'));
      }

      // Combine date and time
      const dateTime = new Date(`${form.date}T${form.time}`);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          type: form.type,
          region: form.region,
          date: dateTime.toISOString(),
          meetingPoint: form.meetingPoint,
          language: form.language,
          category: form.category,
          maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : null,
          autopedestreRouteId: form.type === 'WALK' ? form.autopedestreRouteId : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('createError'));
      }

      const { id } = await response.json();
      router.push(`/events/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-blue-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-lw-warm-gray">
            {t('subtitle')}
          </p>
        </div>

        {/* Form */}
        <Card className="p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-lw-red bg-opacity-10 border border-lw-red rounded-lg">
                <p className="text-lw-red text-sm">{error}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <Input
                label={t('titleLabel')}
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder={t('titlePlaceholder')}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Textarea
                label={t('descriptionLabel')}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={5}
                required
              />
            </div>

            {/* Type Selection */}
            <div>
              <Select
                label={t('typeLabel')}
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value as 'EVENT' | 'WALK')}
                options={[
                  { label: t('eventType'), value: 'EVENT' },
                  { label: t('walkType'), value: 'WALK' },
                ]}
                required
              />
            </div>

            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label={t('regionLabel')}
                  value={form.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  options={[
                    { label: t('selectRegion'), value: '' },
                    ...REGIONS.map(r => ({ label: r, value: r })),
                  ]}
                  required
                />
              </div>
              <div>
                <Select
                  label={t('languageLabel')}
                  value={form.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  options={[
                    { label: t('selectLanguage'), value: '' },
                    ...LANGUAGES.map(l => ({ label: l, value: l })),
                  ]}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('dateLabel')}
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('timeLabel')}
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
              </div>
            </div>

            {/* Meeting Point */}
            <div>
              <Input
                label={t('meetingPointLabel')}
                type="text"
                value={form.meetingPoint}
                onChange={(e) => handleChange('meetingPoint', e.target.value)}
                placeholder={t('meetingPointPlaceholder')}
              />
            </div>

            {/* Category & Max Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  label={t('categoryLabel')}
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={[
                    { label: t('selectCategory'), value: '' },
                    ...EVENT_CATEGORIES.map(c => ({ label: c, value: c })),
                  ]}
                  required
                />
              </div>
              <div>
                <Input
                  label={t('maxParticipantsLabel')}
                  type="number"
                  value={form.maxParticipants}
                  onChange={(e) => handleChange('maxParticipants', e.target.value)}
                  placeholder={t('maxParticipantsPlaceholder')}
                  min="1"
                />
              </div>
            </div>

            {/* Walking Tour Route Selection */}
            {form.type === 'WALK' && (
              <div className="p-4 bg-lw-green-light rounded-lg">
                <Select
                  label={t('routeLabel')}
                  value={form.autopedestreRouteId || ''}
                  onChange={(e) => handleChange('autopedestreRouteId', e.target.value)}
                  options={[
                    { label: t('selectRoute'), value: '' },
                    // Routes would be fetched from API
                    { label: 'Müllerthal Trail (Easy)', value: 'route-1' },
                    { label: 'Vianden Castle Loop (Medium)', value: 'route-2' },
                    { label: 'Cevennes Ridge (Hard)', value: 'route-3' },
                  ]}
                />
                <p className="text-xs text-lw-warm-gray mt-2">
                  {t('routeDescription')}
                </p>
              </div>
            )}

            {/* Image Upload Placeholder */}
            <div className="p-4 bg-lw-blue-light rounded-lg">
              <p className="text-sm font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                {t('imageLabel')}
              </p>
              <div className="border-2 border-dashed border-lw-blue-deep rounded-lg p-8 text-center hover:bg-white transition-colors cursor-pointer">
                <p className="text-2xl mb-2">📸</p>
                <p className="text-sm text-lw-warm-gray">
                  {t('imagePlaceholder')}
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? t('creating') : t('createEvent')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                type="button"
                onClick={() => window.history.back()}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips */}
        <Card className="mt-8 p-6 bg-lw-gold-light border-2 border-lw-gold">
          <h3 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-3">
            💡 {t('tipsTitle')}
          </h3>
          <ul className="space-y-2 text-sm text-lw-charcoal">
            <li>✓ {t('tip1')}</li>
            <li>✓ {t('tip2')}</li>
            <li>✓ {t('tip3')}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
