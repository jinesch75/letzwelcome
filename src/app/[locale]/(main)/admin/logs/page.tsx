'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, Input, Badge } from '@/components/ui';

interface AdminLog {
  id: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  timestamp: string;
}

export default function LogsPage() {
  const t = useTranslations('admin.logs');
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.append('adminId', search);
        if (actionFilter) params.append('action', actionFilter);

        const response = await fetch(`/api/admin/logs?${params}`);
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [search, actionFilter]);

  const getActionColor = (action: string) => {
    if (action.includes('suspend')) return 'bg-lw-red/10 text-lw-red';
    if (action.includes('delete') || action.includes('deactivate')) return 'bg-lw-red/10 text-lw-red';
    if (action.includes('warn')) return 'bg-lw-gold/10 text-lw-gold';
    if (action.includes('resolve') || action.includes('dismiss')) return 'bg-lw-green/10 text-lw-green';
    return 'bg-lw-blue-light/10 text-lw-blue-light';
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return <div className="text-lw-warm-gray">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
        {t('title')}
      </h1>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder={t('searchAdmin')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
          />

          <Input
            placeholder={t('searchAction')}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            type="search"
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lw-charcoal text-lw-cream">
              <tr>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('timestamp')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('admin')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('action')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('targetType')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('details')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-lw-warm-gray">
                    {t('noLogs')}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-lw-gold-light/20 transition">
                    <td className="px-4 py-3 text-sm text-lw-warm-gray whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-lw-charcoal">{log.admin.name}</p>
                        <p className="text-xs text-lw-warm-gray">{log.admin.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="gray"
                        className={`text-xs ${getActionColor(log.action)}`}
                      >
                        {formatAction(log.action)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-lw-charcoal capitalize">
                      {log.targetType}
                    </td>
                    <td className="px-4 py-3 text-sm text-lw-warm-gray max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4 space-y-2">
        <p className="font-semibold text-lw-charcoal text-sm font-[family-name:var(--font-accent)]">
          {t('actionLegend')}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-lw-red"></span>
            <span className="text-lw-charcoal">{t('dangerous')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-lw-gold"></span>
            <span className="text-lw-charcoal">{t('warning')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-lw-green"></span>
            <span className="text-lw-charcoal">{t('resolution')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-lw-blue-light"></span>
            <span className="text-lw-charcoal">{t('other')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
