'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Tabs, Badge, Modal } from '@/components/ui';

interface InactiveUser {
  id: string;
  email: string;
  name: string;
  lastActiveAt: string;
}

export default function GDPRPage() {
  const t = useTranslations('admin.gdpr');
  const [requests, setRequests] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InactiveUser | null>(null);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/gdpr');
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch GDPR requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async () => {
    if (!selectedUser || !action) return;

    try {
      if (action === 'reminder') {
        // Send reminder email
        console.log('Sending reminder to:', selectedUser.email);
      } else if (action === 'anonymise') {
        // Anonymize user
        console.log('Anonymizing user:', selectedUser.id);
      }

      setShowConfirm(false);
      setSelectedUser(null);
      setAction(null);
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  if (loading) {
    return <div className="text-lw-warm-gray">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
        {t('title')}
      </h1>

      <Tabs
        defaultTabId="inactive"
        tabs={[
          {
            id: 'exports',
            label: `${t('dataExports')} (0)`,
            content: (
              <Card className="mt-4 p-6 text-center text-lw-warm-gray">
                {t('noExportRequests')}
              </Card>
            ),
          },
          {
            id: 'deletions',
            label: `${t('deletionRequests')} (0)`,
            content: (
              <Card className="mt-4 p-6 text-center text-lw-warm-gray">
                {t('noDeletionRequests')}
              </Card>
            ),
          },
          {
            id: 'inactive',
            label: `${t('inactiveUsers')} (${requests?.inactiveUsers?.length || 0})`,
            content: (
              <div className="mt-4 space-y-4">
                {(!requests?.inactiveUsers || requests.inactiveUsers.length === 0) ? (
                  <Card className="p-6 text-center text-lw-warm-gray">
                    {t('noInactiveUsers')}
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {requests.inactiveUsers.map((user: InactiveUser) => (
                      <Card
                        key={user.id}
                        className="p-4 flex items-center justify-between hover:bg-lw-gold-light/20 transition"
                      >
                        <div>
                          <p className="font-semibold text-lw-charcoal">{user.name}</p>
                          <p className="text-sm text-lw-warm-gray">{user.email}</p>
                          <p className="text-xs text-lw-warm-gray">
                            {t('lastActive')}:{' '}
                            {new Date(user.lastActiveAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setAction('reminder');
                              setShowConfirm(true);
                            }}
                          >
                            {t('sendReminder')}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setAction('anonymise');
                              setShowConfirm(true);
                            }}
                          >
                            {t('anonymise')}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Info Banner */}
      <Card className="p-4 border-l-4 border-lw-gold bg-lw-gold-light flex items-start gap-3">
        <span className="text-lw-gold text-xl flex-shrink-0 mt-0.5">⚠️</span>
        <div>
          <p className="font-semibold text-lw-charcoal">{t('gdprInfo')}</p>
          <p className="text-sm text-lw-warm-gray mt-1">{t('gdprDescription')}</p>
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && selectedUser && (
        <Modal
          isOpen
          onClose={() => setShowConfirm(false)}
          title={t('confirm')}
        >
          <div className="space-y-4">
            <p className="text-lw-charcoal">
              {action === 'reminder'
                ? t('reminderConfirm', { email: selectedUser.email })
                : t('anonymiseConfirm', { name: selectedUser.name })}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                variant={action === 'anonymise' ? 'danger' : 'primary'}
                onClick={handleAction}
              >
                {t('confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
