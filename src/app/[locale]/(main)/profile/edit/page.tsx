'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import {
  REGIONS,
  INTERESTS,
  EXPERTISE_AREAS,
  LANGUAGES,
  FAMILY_SITUATIONS,
  MEETING_STYLES,
} from '@/lib/utils/regions';

interface ProfileFormData {
  arrivalDate: string;
  countryOfOrigin: string;
  currentRegion: string;
  languagesSpoken: string[];
  interests: string[];
  familySituation: string;
  professionalBackground: string;
  needsHelp: string[];
  preferredMeetingStyle: string;
  availability: string;
  ageRangePreference: string;
  genderPreference: string;
  expertiseAreas: string[];
  regionsServed: string[];
  maxActiveConnections: number;
  bio: string;
  avatarUrl: string;
  role: 'NEWCOMER' | 'BUDDY' | 'BOTH';
}

export default function ProfileEditPage() {
  const t = useTranslations('profile');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [formData, setFormData] = useState<ProfileFormData>({
    arrivalDate: '',
    countryOfOrigin: '',
    currentRegion: '',
    languagesSpoken: [],
    interests: [],
    familySituation: '',
    professionalBackground: '',
    needsHelp: [],
    preferredMeetingStyle: '',
    availability: '',
    ageRangePreference: '',
    genderPreference: '',
    expertiseAreas: [],
    regionsServed: [],
    maxActiveConnections: 3,
    bio: '',
    avatarUrl: '',
    role: 'NEWCOMER',
  });

  // In a real app, fetch current profile data on mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleToggle = (
    value: string,
    field:
      | 'languagesSpoken'
      | 'interests'
      | 'needsHelp'
      | 'expertiseAreas'
      | 'regionsServed'
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch('/api/gdpr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export' }),
      });
      const data = await response.json();
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
      );
      element.setAttribute('download', 'my-data.json');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError('Failed to download data');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lw-blue-light to-lw-cream flex items-center justify-center">
        <p className="text-lw-charcoal">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-blue-light to-lw-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-8">
          Edit Profile
        </h1>

        {error && (
          <Card className="mb-6 p-4 bg-lw-red bg-opacity-10 border-l-4 border-lw-red">
            <p className="text-lw-red text-sm">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="mb-6 p-4 bg-lw-green bg-opacity-10 border-l-4 border-lw-green">
            <p className="text-lw-green text-sm">Profile updated successfully!</p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* About Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              About You
            </h2>
            <div className="space-y-4">
              <Input
                label="When did you arrive in Luxembourg?"
                type="date"
                value={formData.arrivalDate}
                onChange={(e) =>
                  setFormData({ ...formData, arrivalDate: e.target.value })
                }
              />
              <Input
                label="Country of origin"
                placeholder="Where are you from?"
                value={formData.countryOfOrigin}
                onChange={(e) =>
                  setFormData({ ...formData, countryOfOrigin: e.target.value })
                }
              />
              <Select
                label="Current region in Luxembourg"
                value={formData.currentRegion}
                onChange={(e) =>
                  setFormData({ ...formData, currentRegion: e.target.value })
                }
                options={REGIONS.map((r) => ({ value: r, label: r }))}
              />
            </div>
          </Card>

          {/* Languages Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              Languages
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languagesSpoken.includes(lang)}
                    onChange={() =>
                      handleToggle(lang, 'languagesSpoken')
                    }
                    className="w-4 h-4 rounded border-lw-border"
                  />
                  <span className="ml-2 text-lw-charcoal">{lang}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Interests Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              Interests & Background
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-lw-charcoal mb-3">
                  What interests you?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERESTS.map((interest) => (
                    <label
                      key={interest}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleToggle(interest, 'interests')}
                        className="w-4 h-4 rounded border-lw-border"
                      />
                      <span className="ml-2 text-sm text-lw-charcoal">
                        {interest}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Select
                label="Family situation"
                value={formData.familySituation}
                onChange={(e) =>
                  setFormData({ ...formData, familySituation: e.target.value })
                }
                options={FAMILY_SITUATIONS.map((f) => ({
                  value: f,
                  label: f,
                }))}
              />
              <Input
                label="Professional background"
                placeholder="What's your profession or field?"
                value={formData.professionalBackground}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    professionalBackground: e.target.value,
                  })
                }
              />
            </div>
          </Card>

          {/* Needs Help Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              What Help Do You Need?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXPERTISE_AREAS.map((area) => (
                <label
                  key={area}
                  className="flex items-center cursor-pointer p-3 border-2 border-lw-border rounded-lg hover:border-lw-blue-light transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.needsHelp.includes(area)}
                    onChange={() => handleToggle(area, 'needsHelp')}
                    className="w-4 h-4 rounded border-lw-border"
                  />
                  <span className="ml-3 text-lw-charcoal">{area}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              Preferences
            </h2>
            <div className="space-y-4">
              <Select
                label="Preferred meeting style"
                value={formData.preferredMeetingStyle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredMeetingStyle: e.target.value,
                  })
                }
                options={MEETING_STYLES.map((m) => ({
                  value: m,
                  label: m,
                }))}
              />
              <Input
                label="Availability"
                placeholder="e.g., Weekends, Evenings"
                value={formData.availability}
                onChange={(e) =>
                  setFormData({ ...formData, availability: e.target.value })
                }
              />
              <Select
                label="Age range preference (optional)"
                value={formData.ageRangePreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ageRangePreference: e.target.value,
                  })
                }
                options={[
                  { value: '', label: 'No preference' },
                  { value: '18-25', label: '18-25' },
                  { value: '26-35', label: '26-35' },
                  { value: '36-45', label: '36-45' },
                  { value: '46-55', label: '46-55' },
                  { value: '56+', label: '56+' },
                ]}
              />
              <Select
                label="Gender preference (optional)"
                value={formData.genderPreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    genderPreference: e.target.value,
                  })
                }
                options={[
                  { value: '', label: 'No preference' },
                  { value: 'any', label: 'Any' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'non-binary', label: 'Non-binary' },
                ]}
              />
            </div>
          </Card>

          {/* Buddy Features */}
          {['BUDDY', 'BOTH'].includes(formData.role) && (
            <>
              <Card className="p-8">
                <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                  Buddy Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-lw-charcoal mb-3">
                      Areas of expertise
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {EXPERTISE_AREAS.map((area) => (
                        <label
                          key={area}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.expertiseAreas.includes(area)}
                            onChange={() =>
                              handleToggle(area, 'expertiseAreas')
                            }
                            className="w-4 h-4 rounded border-lw-border"
                          />
                          <span className="ml-2 text-sm text-lw-charcoal">
                            {area}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-lw-charcoal mb-3">
                      Regions you can serve
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {REGIONS.map((region) => (
                        <label
                          key={region}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.regionsServed.includes(region)}
                            onChange={() =>
                              handleToggle(region, 'regionsServed')
                            }
                            className="w-4 h-4 rounded border-lw-border"
                          />
                          <span className="ml-2 text-xs text-lw-charcoal">
                            {region}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Maximum active connections"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxActiveConnections}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxActiveConnections: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </Card>
            </>
          )}

          {/* Bio Section */}
          <Card className="p-8">
            <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
              Your Story
            </h2>
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxCharacters={1000}
              showCharCount
              rows={6}
            />
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={saving}
              disabled={saving}
            >
              Save Changes
            </Button>
            <Button
              variant="secondary"
              size="lg"
              type="button"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* GDPR Section */}
        <Card className="mt-12 p-8 border-2 border-lw-border">
          <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-charcoal mb-6">
            Data & Privacy
          </h2>
          <p className="text-lw-warm-gray mb-6">
            Manage your personal data and account settings
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lw-charcoal mb-2">
                Download My Data
              </h3>
              <p className="text-sm text-lw-warm-gray mb-4">
                Download a copy of all your personal data in JSON format
              </p>
              <Button
                variant="secondary"
                onClick={handleDownloadData}
              >
                Download My Data
              </Button>
            </div>
            <div className="border-t border-lw-border pt-4">
              <h3 className="font-medium text-lw-red mb-2">
                Delete My Account
              </h3>
              <p className="text-sm text-lw-warm-gray mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          title="Delete Account"
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteConfirm('');
          }}
        >
          <div className="space-y-4">
            <p className="text-lw-charcoal">
              This action is permanent and cannot be undone. All your data will be deleted.
            </p>
            <p className="text-sm text-lw-warm-gray">
              To confirm, type "DELETE" in the field below.
            </p>
            <Input
              placeholder="Type DELETE"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <div className="flex gap-4">
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
              >
                Delete My Account
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
