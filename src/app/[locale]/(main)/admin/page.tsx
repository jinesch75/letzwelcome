'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, ProgressBar, Skeleton } from '@/components/ui';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  users: {
    total: number;
    byRole: Record<string, number>;
    newThisWeek: number;
    newThisMonth: number;
    activeLastMonth: number;
  };
  matches: {
    total: number;
    pending: number;
    accepted: number;
    completed: number;
    acceptanceRate: number;
  };
  ratings: {
    averageBuddyRating: number;
  };
  messaging: {
    totalMessages: number;
  };
  events: {
    total: number;
    upcoming: number;
  };
  clubs: {
    total: number;
  };
  checklist: {
    completionRate: number;
  };
  reports: {
    open: number;
    total: number;
  };
  regions: Array<{ region: string; count: number }>;
  trends: {
    registrationsByWeek: Array<{ week: string; registrations: number }>;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  highlight,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
}) => (
  <Card className={`p-4 ${highlight ? 'border-2 border-lw-red bg-lw-red/5' : ''}`}>
    <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
      {title}
    </p>
    <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-lw-red' : 'text-lw-charcoal'}`}>
      {value}
    </p>
    {subtitle && <p className="text-xs text-lw-warm-gray mt-2">{subtitle}</p>}
  </Card>
);

export default function AdminDashboard() {
  const t = useTranslations('admin.dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
          {t('title')}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-lw-warm-gray">
        {t('error')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
        {t('title')}
      </h1>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t('totalUsers')}
          value={stats.users.total}
          subtitle={`${stats.users.byRole['NEWCOMER'] || 0} newcomers, ${stats.users.byRole['BUDDY'] || 0} buddies`}
        />

        <StatCard
          title={t('newRegistrations')}
          value={stats.users.newThisWeek}
          subtitle={`${stats.users.newThisMonth} this month`}
        />

        <StatCard
          title={t('activeUsers')}
          value={stats.users.activeLastMonth}
          subtitle="Last 30 days"
        />

        <StatCard
          title={t('totalMatches')}
          value={stats.matches.total}
          subtitle={`${stats.matches.accepted + stats.matches.completed} accepted/completed`}
        />

        <StatCard
          title={t('matchAcceptanceRate')}
          value={`${stats.matches.acceptanceRate.toFixed(1)}%`}
          subtitle={`${stats.matches.pending} pending`}
        />

        <StatCard
          title={t('averageRating')}
          value={stats.ratings.averageBuddyRating.toFixed(1)}
          subtitle="out of 5"
        />

        <StatCard
          title={t('totalMessages')}
          value={stats.messaging.totalMessages}
        />

        <StatCard
          title={t('events')}
          value={stats.events.total}
          subtitle={`${stats.events.upcoming} upcoming`}
        />

        <StatCard
          title={t('clubs')}
          value={stats.clubs.total}
        />

        <StatCard
          title={t('checklistCompletion')}
          value={`${stats.checklist.completionRate.toFixed(1)}%`}
        />

        <StatCard
          title={t('openReports')}
          value={stats.reports.open}
          highlight={stats.reports.open > 0}
          subtitle={`${stats.reports.total} total`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Trend */}
        <Card className="p-6">
          <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal mb-4">
            {t('registrationTrend')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trends.registrationsByWeek}>
              <CartesianGrid stroke="#e0e0e0" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12 }}
                interval={1}
                angle={-45}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }} />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#0066cc"
                dot={{ fill: '#0066cc' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Regional Distribution */}
        <Card className="p-6">
          <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal mb-4">
            {t('regionalBreakdown')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stats.regions.sort((a, b) => b.count - a.count).slice(0, 8)}
            >
              <CartesianGrid stroke="#e0e0e0" />
              <XAxis
                dataKey="region"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }} />
              <Bar dataKey="count" fill="#ffa500" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Match Status Breakdown */}
      <Card className="p-6">
        <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal mb-4">
          {t('matchStatus')}
        </h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-lw-charcoal">{t('pending')}</span>
              <span className="text-lw-warm-gray">{stats.matches.pending}</span>
            </div>
            <ProgressBar
              progress={stats.matches.total > 0 ? (stats.matches.pending / stats.matches.total) * 100 : 0}
              color="blue"
              showPercentage={false}
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-lw-charcoal">{t('accepted')}</span>
              <span className="text-lw-warm-gray">{stats.matches.accepted}</span>
            </div>
            <ProgressBar
              progress={stats.matches.total > 0 ? (stats.matches.accepted / stats.matches.total) * 100 : 0}
              color="gold"
              showPercentage={false}
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-lw-charcoal">{t('completed')}</span>
              <span className="text-lw-warm-gray">{stats.matches.completed}</span>
            </div>
            <ProgressBar
              progress={stats.matches.total > 0 ? (stats.matches.completed / stats.matches.total) * 100 : 0}
              color="green"
              showPercentage={false}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
