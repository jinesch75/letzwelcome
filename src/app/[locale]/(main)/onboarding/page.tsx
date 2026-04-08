'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Avatar from '@/components/ui/Avatar';
import {
  REGIONS,
  INTERESTS,
  EXPERTISE_AREAS,
  LANGUAGES,
  FAMILY_SITUATIONS,
  MEETING_STYLES,
} from '@/lib/utils/regions';

interface OnboardingData {
  // Step 1: Welcome - no data
  // Step 2: About You
  arrivalDate: string;
  countryOfOrigin: string;
  currentRegion: string;
  languagesSpoken: string[];
  // Step 3: Your Interests
  interests: string[];
  familySituation: string;
  professionalBackground: string;
  // Step 4: What You Need
  needsHelp: string[];
  // Step 5: Your Role
  role: 'NEWCOMER' | 'BUDDY' | 'BOTH' | null;
  // Step 6: Preferences
  preferredMeetingStyle: string;
  availability: string;
  ageRangePreference: string;
  genderPreference: string;
  expertiseAreas: string[];
  regionsServed: string[];
  maxActiveConnections: number;
  // Step 7: Your Story
  bio: string;
  // Step 8: Profile Photo
  avatarUrl: string;
}

const STEPS = [
  'Welcome',
  'About You',
  'Your Interests',
  'What You Need',
  'Your Role',
  'Preferences',
  'Your Story',
  'Profile Photo',
];

export default function OnboardingPage() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    arrivalDate: '',
    countryOfOrigin: '',
    currentRegion: '',
    languagesSpoken: [],
    interests: [],
    familySituation: '',
    professionalBackground: '',
    needsHelp: [],
    role: null,
    preferredMeetingStyle: '',
    availability: '',
    ageRangePreference: '',
    genderPreference: '',
    expertiseAreas: [],
    regionsServed: [],
    maxActiveConnections: 3,
    bio: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const buddyProfile = ['BUDDY', 'BOTH'].includes(data.role || '')
        ? {
            expertiseAreas: data.expertiseAreas,
            regionsServed: data.regionsServed,
            maxActiveConnections: data.maxActiveConnections,
            isAcceptingMatches: true,
          }
        : undefined;

      const payload = {
        role: data.role,
        profile: {
          arrivalDate: data.arrivalDate,
          countryOfOrigin: data.countryOfOrigin,
          currentRegion: data.currentRegion,
          languagesSpoken: data.languagesSpoken,
          interests: data.interests,
          familySituation: data.familySituation,
          professionalBackground: data.professionalBackground,
          needsHelp: data.needsHelp,
          preferredMeetingStyle: data.preferredMeetingStyle,
          availability: data.availability,
          ageRangePreference: data.ageRangePreference,
          genderPreference: data.genderPreference,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
        },
        buddyProfile,
      };

      const response = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Onboarding failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setData((prev) => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(lang)
        ? prev.languagesSpoken.filter((l) => l !== lang)
        : [...prev.languagesSpoken, lang],
    }));
  };

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleNeed = (need: string) => {
    setData((prev) => ({
      ...prev,
      needsHelp: prev.needsHelp.includes(need)
        ? prev.needsHelp.filter((n) => n !== need)
        : [...prev.needsHelp, need],
    }));
  };

  const toggleExpertise = (expertise: string) => {
    setData((prev) => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(expertise)
        ? prev.expertiseAreas.filter((e) => e !== expertise)
        : [...prev.expertiseAreas, expertise],
    }));
  };

  const toggleRegion = (region: string) => {
    setData((prev) => ({
      ...prev,
      regionsServed: prev.regionsServed.includes(region)
        ? prev.regionsServed.filter((r) => r !== region)
        : [...prev.regionsServed, region],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lw-blue-light to-lw-cream py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className={`flex-1 text-center text-xs font-medium ${
                  idx <= currentStep
                    ? 'text-lw-blue-deep'
                    : 'text-lw-warm-gray'
                }`}
              >
                {idx < STEPS.length - 1 && (
                  <>
                    <div className="mb-2">{step}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <ProgressBar
            progress={((currentStep + 1) / STEPS.length) * 100}
            color="blue"
          />
        </div>

        {/* Step Content */}
        <Card variant="default" className="mb-8 p-8 animate-fade-in">
          {currentStep === 0 && (
            <div className="text-center">
              <h1 className="text-4xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-4">
                Welcome to Letzwelcome
              </h1>
              <p className="text-lg text-lw-charcoal mb-6">
                We're delighted to have you join our community! This onboarding
                process takes about 5-10 minutes and helps us connect you with
                the right people and resources.
              </p>
              <div className="bg-lw-blue-light rounded-lg p-6 mb-6">
                <p className="text-lw-charcoal">
                  Let's get to know you and help you settle into Luxembourg.
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                About You
              </h2>
              <div className="space-y-4">
                <Input
                  label="When did you arrive in Luxembourg?"
                  type="date"
                  value={data.arrivalDate}
                  onChange={(e) =>
                    setData({ ...data, arrivalDate: e.target.value })
                  }
                />
                <Input
                  label="Country of origin"
                  placeholder="Where are you from?"
                  value={data.countryOfOrigin}
                  onChange={(e) =>
                    setData({ ...data, countryOfOrigin: e.target.value })
                  }
                />
                <Select
                  label="Current region in Luxembourg"
                  value={data.currentRegion}
                  onChange={(e) =>
                    setData({ ...data, currentRegion: e.target.value })
                  }
                  options={REGIONS.map((r) => ({ value: r, label: r }))}
                  placeholder="Select your region"
                />
                <div>
                  <label className="block text-sm font-medium text-lw-charcoal mb-3">
                    Languages you speak
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {LANGUAGES.map((lang) => (
                      <label
                        key={lang}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={data.languagesSpoken.includes(lang)}
                          onChange={() => toggleLanguage(lang)}
                          className="w-4 h-4 rounded border-lw-border cursor-pointer"
                        />
                        <span className="ml-2 text-lw-charcoal">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                Your Interests
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
                          checked={data.interests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="w-4 h-4 rounded border-lw-border cursor-pointer"
                        />
                        <span className="ml-2 text-lw-charcoal text-sm">
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <Select
                  label="Family situation"
                  value={data.familySituation}
                  onChange={(e) =>
                    setData({ ...data, familySituation: e.target.value })
                  }
                  options={FAMILY_SITUATIONS.map((f) => ({
                    value: f,
                    label: f,
                  }))}
                  placeholder="Select your family situation"
                />
                <Input
                  label="Professional background"
                  placeholder="What's your profession or field?"
                  value={data.professionalBackground}
                  onChange={(e) =>
                    setData({
                      ...data,
                      professionalBackground: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                What Help Do You Need?
              </h2>
              <p className="text-lw-charcoal mb-4">
                Select the areas where you'd like support
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXPERTISE_AREAS.map((area) => (
                  <label
                    key={area}
                    className="flex items-center cursor-pointer p-3 border-2 border-lw-border rounded-lg hover:border-lw-blue-light transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={data.needsHelp.includes(area)}
                      onChange={() => toggleNeed(area)}
                      className="w-4 h-4 rounded border-lw-border cursor-pointer"
                    />
                    <span className="ml-3 text-lw-charcoal">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                Your Role
              </h2>
              <p className="text-lw-charcoal mb-6">
                Choose how you'd like to participate in Letzwelcome
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    role: 'NEWCOMER' as const,
                    title: 'Newcomer',
                    description:
                      'I just arrived and want to make connections',
                    icon: '👋',
                  },
                  {
                    role: 'BUDDY' as const,
                    title: 'Buddy',
                    description: 'I want to help others settle in',
                    icon: '🤝',
                  },
                  {
                    role: 'BOTH' as const,
                    title: 'Both',
                    description:
                      'I want to receive help and help others too',
                    icon: '🌟',
                  },
                ].map(({ role, title, description, icon }) => (
                  <Card
                    key={role}
                    variant={data.role === role ? 'featured' : 'interactive'}
                    onClick={() => setData({ ...data, role })}
                    className={`p-4 cursor-pointer transition-all ${
                      data.role === role ? 'ring-2 ring-lw-gold' : ''
                    }`}
                  >
                    <div className="text-3xl mb-2">{icon}</div>
                    <h3 className="font-[family-name:var(--font-accent)] text-lw-blue-deep mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-lw-warm-gray">{description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                Your Preferences
              </h2>
              <div className="space-y-4">
                <Select
                  label="Preferred meeting style"
                  value={data.preferredMeetingStyle}
                  onChange={(e) =>
                    setData({ ...data, preferredMeetingStyle: e.target.value })
                  }
                  options={MEETING_STYLES.map((m) => ({
                    value: m,
                    label: m,
                  }))}
                  placeholder="Select your preference"
                />
                <Input
                  label="Availability"
                  placeholder="e.g., Weekends, Evenings"
                  value={data.availability}
                  onChange={(e) =>
                    setData({ ...data, availability: e.target.value })
                  }
                />
                <Select
                  label="Age range preference (optional)"
                  value={data.ageRangePreference}
                  onChange={(e) =>
                    setData({ ...data, ageRangePreference: e.target.value })
                  }
                  options={[
                    { value: '18-25', label: '18-25' },
                    { value: '26-35', label: '26-35' },
                    { value: '36-45', label: '36-45' },
                    { value: '46-55', label: '46-55' },
                    { value: '56+', label: '56+' },
                  ]}
                  placeholder="Select or leave blank"
                />
                <Select
                  label="Gender preference (optional)"
                  value={data.genderPreference}
                  onChange={(e) =>
                    setData({ ...data, genderPreference: e.target.value })
                  }
                  options={[
                    { value: 'any', label: 'Any' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'non-binary', label: 'Non-binary' },
                  ]}
                  placeholder="Select or leave blank"
                />
                {['BUDDY', 'BOTH'].includes(data.role || '') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-lw-charcoal mb-3">
                        Areas of expertise you can help with
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {EXPERTISE_AREAS.map((area) => (
                          <label
                            key={area}
                            className="flex items-center cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={data.expertiseAreas.includes(area)}
                              onChange={() => toggleExpertise(area)}
                              className="w-4 h-4 rounded border-lw-border cursor-pointer"
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
                              checked={data.regionsServed.includes(region)}
                              onChange={() => toggleRegion(region)}
                              className="w-4 h-4 rounded border-lw-border cursor-pointer"
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
                      value={data.maxActiveConnections}
                      onChange={(e) =>
                        setData({
                          ...data,
                          maxActiveConnections: parseInt(e.target.value),
                        })
                      }
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                Your Story
              </h2>
              <p className="text-lw-charcoal mb-4">
                Share a bit about yourself and why you love or are excited about
                Luxembourg
              </p>
              <Textarea
                label="Bio"
                placeholder="Tell us your story..."
                value={data.bio}
                onChange={(e) => setData({ ...data, bio: e.target.value })}
                maxCharacters={1000}
                showCharCount
                rows={6}
              />
            </div>
          )}

          {currentStep === 7 && (
            <div>
              <h2 className="text-2xl font-[family-name:var(--font-display)] text-lw-blue-deep mb-6">
                Profile Photo
              </h2>
              <p className="text-lw-charcoal mb-6">
                Add a profile photo to help others recognize you
              </p>
              <div className="border-2 border-dashed border-lw-border rounded-lg p-8 text-center bg-lw-cream">
                <Avatar size="xl" />
                <p className="mt-4 text-lw-warm-gray text-sm">
                  Cloudinary integration coming soon
                </p>
                <p className="text-xs text-lw-warm-gray mt-2">
                  You can upload a photo later from your profile
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-lw-red bg-opacity-10 border-l-4 border-lw-red rounded">
              <p className="text-lw-red text-sm">{error}</p>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <div className="flex gap-4">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="secondary"
                onClick={handleSkip}
                disabled={loading}
              >
                Skip
              </Button>
            )}
          </div>
          {currentStep < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="gold"
              onClick={handleSubmit}
              loading={loading}
              disabled={!data.role}
            >
              Complete Onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
