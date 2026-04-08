'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';
import { REGIONS, LANGUAGES, EVENT_CATEGORIES } from '@/lib/utils/regions';

interface EventCard {
  id: string;
  title: string;
  date: string;
  region: string;
  language: string;
  category: string;
  participantCount: number;
  organizer: {
    name: string;
    image?: string;
  };
  imageUrl?: string;
  type: 'EVENT' | 'WALK';
  route?: {
    name: string;
    difficulty: string;
  };
}

interface EventsResponse {
  events: EventCard[];
  total: number;
}

export default function EventsPage() {
  const t = useTranslations('events');
  const [events, setEvents] = useState<EventCard[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [filters, setFilters] = useState({
    region: '',
    category: '',
    language: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters, tab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data: EventsResponse = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = events;

    // Filter by time (upcoming/past)
    const now = new Date();
    result = result.filter(event => {
      const eventDate = new Date(event.date);
      return tab === 'upcoming' ? eventDate >= now : eventDate < now;
    });

    // Apply other filters
    if (filters.region) {
      result = result.filter(event => event.region === filters.region);
    }
    if (filters.category) {
      result = result.filter(event => event.category === filters.category);
    }
    if (filters.language) {
      result = result.filter(event => event.language === filters.language);
    }

    setFilteredEvents(result);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, 'blue' | 'gold' | 'green' | 'red' | 'gray'> = {
      Social: 'blue',
      Cultural: 'gold',
      Sports: 'green',
      'Language exchange': 'blue',
      'Walking tour': 'green',
      Workshop: 'gold',
      Family: 'green',
      'Professional networking': 'gold',
      Volunteering: 'green',
      Other: 'gray',
    };
    return colorMap[category] || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lw-cream py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
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
        <div className="mb-12 animate-fade-in flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-2">
              {t('title')}
            </h1>
            <p className="text-lg text-lw-warm-gray">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/events/create">
            <Button variant="primary" size="lg">
              {t('createEvent')}
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2">
            {(['upcoming', 'past'] as const).map((t_tab) => (
              <button
                key={t_tab}
                onClick={() => setTab(t_tab)}
                className={`px-5 py-2 rounded-full text-sm font-[family-name:var(--font-accent)] transition-all ${
                  tab === t_tab
                    ? 'bg-lw-blue-deep text-lw-cream'
                    : 'bg-white border border-lw-border text-lw-charcoal hover:border-lw-blue-light'
                }`}
              >
                {t(t_tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Select
            label={t('filterRegion')}
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            options={[
              { label: t('allRegions'), value: '' },
              ...REGIONS.map(region => ({ label: region, value: region })),
            ]}
          />
          <Select
            label={t('filterCategory')}
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            options={[
              { label: t('allCategories'), value: '' },
              ...EVENT_CATEGORIES.map(cat => ({ label: cat, value: cat })),
            ]}
          />
          <Select
            label={t('filterLanguage')}
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            options={[
              { label: t('allLanguages'), value: '' },
              ...LANGUAGES.map(lang => ({ label: lang, value: lang })),
            ]}
          />
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {filteredEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card variant="interactive" className="h-full overflow-hidden hover:shadow-xl transition-all">
                  {/* Image */}
                  <div className="w-full h-40 bg-gradient-to-br from-lw-blue-light to-lw-gold-light flex items-center justify-center text-4xl">
                    {event.type === 'WALK' ? '🥾' : '🎉'}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-[family-name:var(--font-display)] text-lw-blue-deep mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-sm text-lw-warm-gray mb-3">
                      📅 {formatDate(event.date)}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      {event.type === 'WALK' && (
                        <Badge variant="green">
                          {event.route?.difficulty || 'Walk'}
                        </Badge>
                      )}
                      <Badge variant="blue">
                        {event.language}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 mb-4 text-sm">
                      <p className="text-lw-charcoal">
                        📍 {event.region}
                      </p>
                      <p className="text-lw-warm-gray">
                        👥 {event.participantCount} {event.participantCount === 1 ? t('participant') : t('participants')}
                      </p>
                    </div>

                    {/* Organizer */}
                    <div className="pt-3 border-t border-lw-border">
                      <p className="text-xs text-lw-warm-gray">
                        By <span className="font-medium text-lw-charcoal">{event.organizer.name}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('noEvents')}
            description={tab === 'upcoming' ? t('noUpcomingEvents') : t('noPastEvents')}
            icon="📭"
          />
        )}
      </div>
    </div>
  );
}
