'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import Tabs from '@/components/ui/Tabs';

interface ChecklistItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: string;
  region?: string;
  externalLinks: string[];
  isEuOnly: boolean;
  isNonEuOnly: boolean;
  isFamilyOnly: boolean;
  stepsKey?: string;
  completed: boolean;
}

interface ChecklistResponse {
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
}

const CATEGORIES = [
  'All',
  'Administrative',
  'Healthcare',
  'Finance',
  'Daily Life',
  'Language',
  'Family',
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Exclude<Category, 'All'>, string> = {
  Administrative: 'blue',
  Healthcare: 'red',
  Finance: 'gold',
  'Daily Life': 'green',
  Language: 'blue',
  Family: 'green',
};

export default function ChecklistPage() {
  const t = useTranslations('checklist');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const response = await fetch('/api/checklist');
      if (!response.ok) throw new Error('Failed to fetch checklist');
      const data: ChecklistResponse = await response.json();
      setItems(data.items);
      setCompletedCount(data.completedCount);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistItemId: itemId,
          completed: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update checklist');

      setItems(items.map(item =>
        item.id === itemId ? { ...item, completed: !currentStatus } : item
      ));
      setCompletedCount(prev => !currentStatus ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-lw-cream py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-cream to-lw-blue-light py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-lw-warm-gray mb-8">
            {t('subtitle')}
          </p>

          {/* Progress Section */}
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-[family-name:var(--font-display)] text-lw-blue-deep">
                {t('progress')}
              </h2>
              <p className="text-2xl font-bold text-lw-gold">
                {completedCount}/{totalCount}
              </p>
            </div>
            <ProgressBar
              progress={totalCount > 0 ? (completedCount / totalCount) * 100 : 0}
              color="gold"
            />
            <p className="text-sm text-lw-warm-gray mt-3">
              {progressPercentage}% {t('progressLabel')}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-[family-name:var(--font-accent)] transition-all ${
                  selectedCategory === cat
                    ? 'bg-lw-blue-deep text-lw-cream'
                    : 'bg-white border border-lw-border text-lw-charcoal hover:border-lw-blue-light'
                }`}
              >
                {cat === 'All' ? t('filterAll') : t(`category.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist Items */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4 animate-slide-up">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                variant="interactive"
                className="p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(item.id, item.completed);
                    }}
                    className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.completed
                        ? 'bg-lw-green border-lw-green'
                        : 'border-lw-border hover:border-lw-green'
                    }`}
                  >
                    {item.completed && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3
                        className={`text-lg font-medium ${
                          item.completed
                            ? 'line-through text-lw-warm-gray'
                            : 'text-lw-charcoal'
                        }`}
                      >
                        {t(`items.${item.titleKey}`, { defaultValue: item.titleKey })}
                      </h3>
                      <Badge
                        variant={
                          (CATEGORY_COLORS[item.category as Exclude<Category, 'All'>] ||
                            'gray') as any
                        }
                      >
                        {t(`category.${item.category}`, { defaultValue: item.category })}
                      </Badge>
                    </div>

                    {/* Conditional Badges */}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {item.isEuOnly && (
                        <Badge variant="blue" className="text-xs">
                          {t('euOnly')}
                        </Badge>
                      )}
                      {item.isNonEuOnly && (
                        <Badge variant="red" className="text-xs">
                          {t('nonEuOnly')}
                        </Badge>
                      )}
                      {item.isFamilyOnly && (
                        <Badge variant="green" className="text-xs">
                          {t('familyOnly')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <span className={`text-lw-warm-gray transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>

                {/* Expandable Section */}
                {expandedId === item.id && (
                  <div className="mt-6 pt-6 border-t border-lw-border animate-slide-up">
                    <p className="text-lw-charcoal mb-4">
                      {t(`items.${item.descriptionKey}`, { defaultValue: item.descriptionKey })}
                    </p>

                    {item.stepsKey && (
                      <div className="mb-6 bg-lw-cream p-4 rounded-lg">
                        <h4 className="font-[family-name:var(--font-accent)] font-semibold text-lw-blue-deep mb-3">
                          {t('steps')}
                        </h4>
                        <ol className="space-y-2 list-decimal list-inside text-sm text-lw-charcoal">
                          {/* Steps would be loaded from translations */}
                          <li>{t(`items.${item.stepsKey}.0`, { defaultValue: 'Step 1' })}</li>
                        </ol>
                      </div>
                    )}

                    {item.externalLinks.length > 0 && (
                      <div>
                        <h4 className="font-[family-name:var(--font-accent)] font-semibold text-lw-blue-deep mb-3">
                          {t('links')}
                        </h4>
                        <div className="space-y-2">
                          {item.externalLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-lw-blue-deep hover:text-lw-gold transition-colors text-sm"
                            >
                              {t('externalLink')} →
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('noItems')}
            description={t('noItemsDescription')}
            icon="📋"
          />
        )}

        {/* Celebration */}
        {progressPercentage === 100 && totalCount > 0 && (
          <Card className="mt-12 p-8 bg-gradient-to-r from-lw-gold-light to-lw-green-light border-2 border-lw-gold text-center animate-fade-in">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-2">
              {t('completed')}
            </h2>
            <p className="text-lw-charcoal">
              {t('completedDescription')}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
