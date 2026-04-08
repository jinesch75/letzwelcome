'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { REGIONS, LANGUAGES } from '@/lib/utils/regions';

interface Club {
  id: string;
  name: string;
  description: string;
  region: string;
  activityType: string;
  languages: string[];
  meetingFrequency?: string;
  imageUrl?: string;
}

interface ClubsResponse {
  clubs: Club[];
  total: number;
}

const ACTIVITY_TYPES = [
  'Language Exchange',
  'Sports',
  'Arts & Culture',
  'Social',
  'Volunteering',
  'Professional',
  'Family',
  'Other',
] as const;

export default function ClubsPage() {
  const t = useTranslations('clubs');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: '',
    activityType: '',
    language: '',
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [clubs, filters]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clubs');
      if (!response.ok) throw new Error('Failed to fetch clubs');
      const data: ClubsResponse = await response.json();
      setClubs(data.clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = clubs;

    if (filters.region) {
      result = result.filter(club => club.region === filters.region);
    }
    if (filters.activityType) {
      result = result.filter(club => club.activityType === filters.activityType);
    }
    if (filters.language) {
      result = result.filter(club => club.languages.includes(filters.language));
    }

    setFilteredClubs(result);
  };

  const languageCoffees = clubs.filter(club =>
    club.activityType.toLowerCase().includes('language')
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-lw-cream py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-blue-light py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-lw-warm-gray">
            {t('subtitle')}
          </p>
        </div>

        {/* Language Coffees Section */}
        {languageCoffees.length > 0 && (
          <div className="mb-16 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-[family-name:var(--font-display)] text-lw-gold">
                ☕ {t('languageCoffees')}
              </h2>
              <Badge variant="gold">{t('featured')}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {languageCoffees.map(club => (
                <Link key={club.id} href={`/clubs/${club.id}`}>
                  <Card variant="interactive" className="h-full overflow-hidden hover:shadow-lg transition-all">
                    <div className="w-full h-32 bg-gradient-to-br from-lw-gold-light to-lw-cream flex items-center justify-center text-4xl">
                      ☕
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-[family-name:var(--font-display)] text-lw-blue-deep mb-1">
                        {club.name}
                      </h3>
                      <p className="text-xs text-lw-warm-gray mb-3">
                        {club.region}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {club.languages.map(lang => (
                          <Badge key={lang} variant="blue" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                      {club.meetingFrequency && (
                        <p className="text-xs text-lw-warm-gray">
                          🔄 {club.meetingFrequency}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Select
            label={t('filterRegion')}
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            options={[
              { label: t('allRegions'), value: '' },
              ...REGIONS.map(r => ({ label: r, value: r })),
            ]}
          />
          <Select
            label={t('filterActivity')}
            value={filters.activityType}
            onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
            options={[
              { label: t('allActivities'), value: '' },
              ...ACTIVITY_TYPES.map(a => ({ label: a, value: a })),
            ]}
          />
          <Select
            label={t('filterLanguage')}
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            options={[
              { label: t('allLanguages'), value: '' },
              ...LANGUAGES.map(l => ({ label: l, value: l })),
            ]}
          />
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredClubs.map(club => (
              <Link key={club.id} href={`/clubs/${club.id}`}>
                <Card variant="interactive" className="h-full overflow-hidden hover:shadow-lg transition-all">
                  {/* Image */}
                  <div className="w-full h-40 bg-gradient-to-br from-lw-blue-light to-lw-green-light flex items-center justify-center text-4xl">
                    🏢
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-[family-name:var(--font-display)] text-lw-blue-deep mb-2 line-clamp-2">
                      {club.name}
                    </h3>

                    <p className="text-sm text-lw-warm-gray mb-3 line-clamp-2">
                      {club.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge variant="green" className="text-xs">
                        {club.activityType}
                      </Badge>
                      <Badge variant="blue" className="text-xs">
                        {club.region}
                      </Badge>
                    </div>

                    {/* Languages */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {club.languages.slice(0, 2).map(lang => (
                        <Badge key={lang} variant="gold" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {club.languages.length > 2 && (
                        <Badge variant="gray" className="text-xs">
                          +{club.languages.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Meeting Frequency */}
                    {club.meetingFrequency && (
                      <p className="text-xs text-lw-warm-gray">
                        🔄 {club.meetingFrequency}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('noClubs')}
            description={t('noClubsDescription')}
            icon="🏢"
          />
        )}
      </div>
    </div>
  );
}
