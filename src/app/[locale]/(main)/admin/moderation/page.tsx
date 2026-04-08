'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Tabs, Textarea, Badge } from '@/components/ui';

interface ModerationItem {
  id: string;
  type: 'report' | 'flag';
  status: string;
  createdAt: string;
  adminNotes?: string;
}

interface AbuseReport extends ModerationItem {
  type: 'report';
  reporter: { id: string; name: string; email: string };
  category: string;
  description: string;
  targetUser: { id: string; name: string; email: string };
}

interface ContentFlag extends ModerationItem {
  type: 'flag';
  reporter: { id: string; name: string; email: string };
  contentType: string;
  contentId: string;
  reason: string;
}

export default function ModerationPage() {
  const t = useTranslations('admin.moderation');
  const [queue, setQueue] = useState<{ reports: AbuseReport[]; flags: ContentFlag[] } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('/api/admin/moderation');
        const data = await response.json();
        setQueue(data);
      } catch (error) {
        console.error('Failed to fetch moderation queue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  const handleAction = async (id: string, type: 'report' | 'flag', action: string) => {
    try {
      await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          type,
          action,
          notes: notes[id],
        }),
      });

      // Refresh queue
      const response = await fetch('/api/admin/moderation');
      const data = await response.json();
      setQueue(data);
      setSelectedItem(null);
      setNotes({});
    } catch (error) {
      console.error('Failed to update moderation item:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-lw-red/10 text-lw-red';
      case 'INVESTIGATING':
        return 'bg-lw-gold/10 text-lw-gold';
      case 'RESOLVED':
        return 'bg-lw-green/10 text-lw-green';
      default:
        return 'bg-lw-warm-gray/10 text-lw-warm-gray';
    }
  };

  if (loading) {
    return <div className="text-lw-warm-gray">{t('loading')}</div>;
  }

  if (!queue) {
    return <div className="text-lw-warm-gray">{t('error')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
        {t('title')}
      </h1>

      <Tabs
        defaultTabId="reports"
        tabs={[
          {
            id: 'reports',
            label: `${t('userReports')} (${queue.reports.length})`,
            content: (
              <div className="space-y-4 mt-4">
                {queue.reports.length === 0 ? (
                  <Card className="p-6 text-center text-lw-warm-gray">
                    {t('noReports')}
                  </Card>
                ) : (
                  queue.reports.map((report) => (
                    <Card
                      key={report.id}
                      className={`p-4 cursor-pointer transition ${
                        selectedItem === report.id
                          ? 'border-2 border-lw-blue-deep bg-lw-blue-light/10'
                          : 'hover:bg-lw-gold-light/50'
                      }`}
                      onClick={() => setSelectedItem(selectedItem === report.id ? null : report.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lw-red">⚠️</span>
                            <span className="font-semibold text-lw-charcoal">
                              {report.targetUser.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getStatusColor(report.status)}`}
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-lw-warm-gray mb-2">
                            <strong>{t('category')}:</strong> {report.category}
                          </p>
                          <p className="text-sm text-lw-charcoal mb-2">
                            {report.description}
                          </p>
                          <p className="text-xs text-lw-warm-gray">
                            {t('reportedBy')}: {report.reporter.name} ({report.reporter.email})
                          </p>
                        </div>
                      </div>

                      {selectedItem === report.id && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-lw-border">
                          <Textarea
                            label={t('adminNotes')}
                            value={notes[report.id] || report.adminNotes || ''}
                            onChange={(e) =>
                              setNotes({
                                ...notes,
                                [report.id]: e.target.value,
                              })
                            }
                            rows={4}
                            placeholder={t('notesPlaceholder')}
                          />

                          <div className="flex gap-2">
                            {report.status === 'OPEN' && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleAction(report.id, 'report', 'investigate')}
                                >
                                  {t('investigate')}
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAction(report.id, 'report', 'resolve')}
                                >
                                  {t('resolve')}
                                </Button>
                              </>
                            )}
                            {report.status !== 'DISMISSED' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAction(report.id, 'report', 'dismiss')}
                              >
                                {t('dismiss')}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            ),
          },
          {
            id: 'flags',
            label: `${t('flaggedContent')} (${queue.flags.length})`,
            content: (
              <div className="space-y-4 mt-4">
                {queue.flags.length === 0 ? (
                  <Card className="p-6 text-center text-lw-warm-gray">
                    {t('noFlags')}
                  </Card>
                ) : (
                  queue.flags.map((flag) => (
                    <Card
                      key={flag.id}
                      className={`p-4 cursor-pointer transition ${
                        selectedItem === flag.id
                          ? 'border-2 border-lw-blue-deep bg-lw-blue-light/10'
                          : 'hover:bg-lw-gold-light/50'
                      }`}
                      onClick={() => setSelectedItem(selectedItem === flag.id ? null : flag.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lw-red">⚠️</span>
                            <span className="font-semibold text-lw-charcoal">
                              {flag.contentType}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getStatusColor(flag.status)}`}
                            >
                              {flag.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-lw-charcoal mb-2">
                            {flag.reason}
                          </p>
                          <p className="text-xs text-lw-warm-gray">
                            {t('flaggedBy')}: {flag.reporter.name} ({flag.reporter.email})
                          </p>
                        </div>
                      </div>

                      {selectedItem === flag.id && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-lw-border">
                          <div className="flex gap-2">
                            {flag.status === 'OPEN' && (
                              <>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleAction(flag.id, 'flag', 'delete')}
                                >
                                  {t('delete')}
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAction(flag.id, 'flag', 'approve')}
                                >
                                  {t('approve')}
                                </Button>
                              </>
                            )}
                            {flag.status !== 'DISMISSED' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAction(flag.id, 'flag', 'reject')}
                              >
                                {t('reject')}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
