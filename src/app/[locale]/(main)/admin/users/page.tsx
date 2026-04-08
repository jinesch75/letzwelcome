'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Card, Input, Select, Badge } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  region?: string;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
  badges: number;
}

export default function UsersPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('admin.users');
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (verifiedFilter) params.append('verified', verifiedFilter);
      if (suspendedFilter) params.append('suspended', suspendedFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, verifiedFilter, suspendedFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-lw-red/10 text-lw-red';
      case 'BUDDY':
        return 'bg-lw-green/10 text-lw-green';
      case 'NEWCOMER':
        return 'bg-lw-blue-light/10 text-lw-blue-light';
      default:
        return 'bg-lw-warm-gray/10 text-lw-warm-gray';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-lw-charcoal">
        {t('title')}
      </h1>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
          />

          <Select
            label={t('roleFilter')}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: t('allRoles') },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'BUDDY', label: 'Buddy' },
              { value: 'NEWCOMER', label: 'Newcomer' },
              { value: 'BOTH', label: 'Both' },
            ]}
          />

          <Select
            label={t('verifiedFilter')}
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            options={[
              { value: '', label: t('allStatuses') },
              { value: 'true', label: t('verified') },
              { value: 'false', label: t('unverified') },
            ]}
          />

          <Select
            label={t('suspendedFilter')}
            value={suspendedFilter}
            onChange={(e) => setSuspendedFilter(e.target.value)}
            options={[
              { value: '', label: t('allStatuses') },
              { value: 'true', label: t('suspended') },
              { value: 'false', label: t('active') },
            ]}
          />
        </div>
      </Card>

      {/* User Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-lw-charcoal text-lw-cream">
              <tr>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('name')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('email')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('role')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('region')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('status')}
                </th>
                <th className="px-4 py-3 text-left font-[family-name:var(--font-accent)] font-semibold">
                  {t('joined')}
                </th>
                <th className="px-4 py-3 text-right font-[family-name:var(--font-accent)] font-semibold">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lw-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-lw-warm-gray">
                    {t('loading')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-lw-warm-gray">
                    {t('noUsers')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-lw-gold-light/20 transition">
                    <td className="px-4 py-3 font-medium text-lw-charcoal">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-lw-warm-gray">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-lw-charcoal">
                      {user.region || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {user.suspended && (
                          <Badge variant="secondary" className="bg-lw-red/10 text-lw-red text-xs">
                            {t('suspended')}
                          </Badge>
                        )}
                        {!user.verified && (
                          <Badge variant="secondary" className="bg-lw-gold/10 text-lw-gold text-xs">
                            {t('unverified')}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-lw-warm-gray">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/${params.locale}/admin/users/${user.id}`}>
                        <Button variant="secondary" size="sm">
                          {t('view')}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
