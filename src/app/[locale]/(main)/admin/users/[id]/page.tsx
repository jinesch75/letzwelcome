'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Input, Select, Textarea, Badge, Modal } from '@/components/ui';
import { useRouter } from 'next/navigation';

interface UserDetail {
  id: string;
  email: string;
  name: string;
  role: string;
  suspended: boolean;
  suspendReason?: string;
  emailVerified: boolean;
  createdAt: string;
  profile?: {
    bio?: string;
    currentRegion?: string;
    arrivalDate?: string;
    countryOfOrigin?: string;
  };
  matchesAsNewcomer?: any[];
  matchesAsBuddy?: any[];
  reportsReceived?: any[];
  reportsFiled?: any[];
  badges?: any[];
}

export default function UserDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const t = useTranslations('admin.userDetail');
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [newRole, setNewRole] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // In a real app, fetch individual user details
        // For now, search and find the user
        const response = await fetch(`/api/admin/users?search=${params.id}`);
        const users = await response.json();
        if (users.length > 0) {
          // Load full user data
          setUser(users[0]);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleAction = async () => {
    if (!user) return;

    try {
      let payload: any = { userId: user.id };

      if (action === 'suspend') {
        payload.action = 'suspend';
        payload.reason = suspendReason;
      } else if (action === 'unsuspend') {
        payload.action = 'unsuspend';
      } else if (action === 'deactivate') {
        payload.action = 'deactivate';
      } else if (action === 'change_role') {
        payload.action = 'change_role';
        payload.newRole = newRole;
      }

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Refresh and reset
        setAction(null);
        setShowConfirm(false);
        setSuspendReason('');
        setNewRole('');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  if (loading) {
    return <div className="text-lw-warm-gray">{t('loading')}</div>;
  }

  if (!user) {
    return <div className="text-lw-warm-gray">{t('notFound')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
          {user.name}
        </h1>
        <Button
          variant="secondary"
          onClick={() => router.back()}
        >
          {t('back')}
        </Button>
      </div>

      {/* Basic Info */}
      <Card className="p-6 space-y-4">
        <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal">
          {t('basicInfo')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('email')}
            </p>
            <p className="text-lw-charcoal">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('role')}
            </p>
            <p className="text-lw-charcoal flex items-center gap-2">
              {user.role}
              {user.role === 'ADMIN' && (
                <Badge variant="secondary" className="bg-lw-red/10 text-lw-red text-xs">
                  Admin
                </Badge>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('joined')}
            </p>
            <p className="text-lw-charcoal">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('verified')}
            </p>
            <p className="text-lw-charcoal">
              {user.emailVerified ? (
                <Badge variant="secondary" className="bg-lw-green/10 text-lw-green text-xs">
                  {t('verified')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-lw-gold/10 text-lw-gold text-xs">
                  {t('unverified')}
                </Badge>
              )}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      {user.profile && (
        <Card className="p-6 space-y-4">
          <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal">
            {t('profileInfo')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
                {t('region')}
              </p>
              <p className="text-lw-charcoal">{user.profile.currentRegion || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
                {t('countryOfOrigin')}
              </p>
              <p className="text-lw-charcoal">{user.profile.countryOfOrigin || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
                {t('arrivalDate')}
              </p>
              <p className="text-lw-charcoal">
                {user.profile.arrivalDate
                  ? new Date(user.profile.arrivalDate).toLocaleDateString()
                  : '-'}
              </p>
            </div>
          </div>
          {user.profile.bio && (
            <div>
              <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
                {t('bio')}
              </p>
              <p className="text-lw-charcoal text-sm">{user.profile.bio}</p>
            </div>
          )}
        </Card>
      )}

      {/* Activity */}
      <Card className="p-6 space-y-4">
        <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal">
          {t('activity')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('matchesAsNewcomer')}
            </p>
            <p className="text-2xl font-bold text-lw-charcoal">
              {user.matchesAsNewcomer?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('matchesAsBuddy')}
            </p>
            <p className="text-2xl font-bold text-lw-charcoal">
              {user.matchesAsBuddy?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('badgesAwarded')}
            </p>
            <p className="text-2xl font-bold text-lw-charcoal">
              {user.badges?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-lw-warm-gray font-[family-name:var(--font-accent)]">
              {t('reportsReceived')}
            </p>
            <p className="text-2xl font-bold text-lw-red">
              {user.reportsReceived?.length || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Admin Actions */}
      <Card className="p-6 space-y-4 border-l-4 border-lw-red">
        <h2 className="font-[family-name:var(--font-accent)] text-lg font-semibold text-lw-charcoal">
          {t('adminActions')}
        </h2>
        <div className="space-y-3">
          {!user.suspended ? (
            <Button
              variant="danger"
              onClick={() => setAction('suspend')}
              className="w-full"
            >
              {t('suspend')}
            </Button>
          ) : (
            <Button
              variant="gold"
              onClick={() => {
                setAction('unsuspend');
                setShowConfirm(true);
              }}
              className="w-full"
            >
              {t('unsuspend')}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => setAction('change_role')}
            className="w-full"
          >
            {t('changeRole')}
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              setAction('deactivate');
              setShowConfirm(true);
            }}
            className="w-full"
          >
            {t('deactivate')}
          </Button>
        </div>
      </Card>

      {/* Modals */}
      {action === 'suspend' && (
        <Modal
          isOpen
          onClose={() => setAction(null)}
          title={t('suspendUser')}
        >
          <div className="space-y-4">
            <Textarea
              label={t('suspensionReason')}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              rows={4}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setAction(null)}>
                {t('cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowConfirm(true);
                }}
                disabled={!suspendReason}
              >
                {t('confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {action === 'change_role' && (
        <Modal
          isOpen
          onClose={() => setAction(null)}
          title={t('changeRole')}
        >
          <div className="space-y-4">
            <Select
              label={t('newRole')}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'ADMIN', label: 'Admin' },
                { value: 'BUDDY', label: 'Buddy' },
                { value: 'NEWCOMER', label: 'Newcomer' },
                { value: 'BOTH', label: 'Both' },
              ]}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setAction(null)}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowConfirm(true);
                }}
                disabled={!newRole}
              >
                {t('confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showConfirm && (
        <Modal
          isOpen
          onClose={() => setShowConfirm(false)}
          title={t('confirmAction')}
        >
          <div className="space-y-4">
            <p className="text-lw-charcoal">
              {action === 'suspend' && t('suspendConfirm', { name: user.name })}
              {action === 'unsuspend' && t('unsuspendConfirm', { name: user.name })}
              {action === 'deactivate' && t('deactivateConfirm', { name: user.name })}
              {action === 'change_role' && t('changeRoleConfirm', { name: user.name, role: newRole })}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                variant={action === 'deactivate' ? 'danger' : 'primary'}
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
