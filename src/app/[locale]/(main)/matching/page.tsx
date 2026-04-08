'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import StarRating from '@/components/ui/StarRating';
import Tabs from '@/components/ui/Tabs';
import EmptyState from '@/components/ui/EmptyState';

interface BuddyProfile {
  id: string;
  name: string;
  image?: string;
  region: string;
  languages: string[];
  expertise: string[];
  interests: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  bio: string;
  score?: number;
}

interface MatchRequest {
  id: string;
  newcomerId: string;
  newcomerName: string;
  newcomerImage?: string;
  personalMessage: string;
  createdAt: string;
}

interface ActiveMatch {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserImage?: string;
  lastMessage: string;
  lastMessageTime: string;
  conversationId: string;
}

interface ReviewData {
  rating: number;
  text: string;
}

export default function MatchingPage() {
  const t = useTranslations('matching');
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState<BuddyProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [activeMatches, setActiveMatches] = useState<ActiveMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect modal state
  const [connectingBuddyId, setConnectingBuddyId] = useState<string | null>(null);
  const [connectMessage, setConnectMessage] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);

  // Review modal state
  const [reviewingMatchId, setReviewingMatchId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData>({ rating: 5, text: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Load suggestions
  useEffect(() => {
    if (activeTab === 'suggestions') {
      loadSuggestions();
    }
  }, [activeTab]);

  // Load incoming requests
  useEffect(() => {
    if (activeTab === 'incoming') {
      loadIncomingRequests();
    }
  }, [activeTab]);

  // Load active matches
  useEffect(() => {
    if (activeTab === 'active') {
      loadActiveMatches();
    }
  }, [activeTab]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/matching/suggestions');
      if (!response.ok) throw new Error('Failed to load suggestions');
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadIncomingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/matching/requests/incoming');
      if (!response.ok) throw new Error('Failed to load requests');
      const data = await response.json();
      setIncomingRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/matching/active');
      if (!response.ok) throw new Error('Failed to load active matches');
      const data = await response.json();
      setActiveMatches(data.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!connectingBuddyId || connectMessage.trim().length === 0) return;

    try {
      setConnectLoading(true);
      const response = await fetch('/api/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buddyId: connectingBuddyId,
          personalMessage: connectMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send connect request');

      setConnectingBuddyId(null);
      setConnectMessage('');
      loadSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/matching/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) throw new Error('Failed to accept request');
      loadIncomingRequests();
      loadActiveMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/matching/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (!response.ok) throw new Error('Failed to decline request');
      loadIncomingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline request');
    }
  };

  const handleCompleteMatch = (matchId: string) => {
    setReviewingMatchId(matchId);
    setReviewData({ rating: 5, text: '' });
  };

  const handleSubmitReview = async () => {
    if (!reviewingMatchId) return;

    try {
      setReviewLoading(true);
      const response = await fetch(`/api/matching/${reviewingMatchId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewData.rating,
          text: reviewData.text,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setReviewingMatchId(null);
      setReviewData({ rating: 5, text: '' });
      loadActiveMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const tabs = [
    {
      id: 'suggestions',
      label: t('tabs.suggestions'),
      content: (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-lw-red bg-opacity-10 border border-lw-red rounded-lg text-lw-red">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} variant="interactive" className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                </Card>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <EmptyState
              icon="🔍"
              title={t('suggestions.empty.title')}
              description={t('suggestions.empty.description')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {suggestions.map(buddy => (
                <Card key={buddy.id} variant="interactive" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar
                        src={buddy.image}
                        name={buddy.name}
                        size="lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-lw-charcoal mb-1">
                          {buddy.name}
                        </h3>
                        <p className="text-sm text-lw-warm-gray">{buddy.region}</p>
                      </div>
                      {buddy.isVerified && (
                        <Badge variant="blue" icon="✓">
                          {t('verified')}
                        </Badge>
                      )}
                    </div>

                    {/* Languages */}
                    <div className="mb-4">
                      <p className="text-xs font-accent text-lw-warm-gray mb-2 uppercase tracking-wide">
                        {t('languages')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {buddy.languages.map(lang => (
                          <Badge key={lang} variant="blue">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Expertise */}
                    {buddy.expertise.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-accent text-lw-warm-gray mb-2 uppercase tracking-wide">
                          {t('expertise')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {buddy.expertise.slice(0, 3).map(exp => (
                            <Badge key={exp} variant="green">
                              {exp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(buddy.rating)
                                ? 'text-lw-gold'
                                : 'text-lw-border'
                            } fill-current`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-lw-warm-gray">
                        ({buddy.reviewCount})
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-lw-charcoal mb-6 line-clamp-3">
                      {buddy.bio}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {/* navigate to profile */}}
                      >
                        {t('viewProfile')}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setConnectingBuddyId(buddy.id)}
                      >
                        {t('connect')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'incoming',
      label: t('tabs.incoming'),
      content: (
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-lw-red bg-opacity-10 border border-lw-red rounded-lg text-lw-red">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </Card>
              ))}
            </div>
          ) : incomingRequests.length === 0 ? (
            <EmptyState
              icon="📬"
              title={t('incoming.empty.title')}
              description={t('incoming.empty.description')}
            />
          ) : (
            <div className="space-y-4 animate-fade-in">
              {incomingRequests.map(request => (
                <Card key={request.id} variant="interactive" className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={request.newcomerImage}
                        name={request.newcomerName}
                        size="lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-lw-charcoal">
                          {request.newcomerName}
                        </h3>
                        <p className="text-sm text-lw-warm-gray">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {request.personalMessage && (
                    <div className="mb-4 p-4 bg-lw-cream rounded-lg border border-lw-border">
                      <p className="text-sm text-lw-charcoal italic">
                        "{request.personalMessage}"
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      {t('accept')}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      {t('decline')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'active',
      label: t('tabs.active'),
      content: (
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-lw-red bg-opacity-10 border border-lw-red rounded-lg text-lw-red">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </Card>
              ))}
            </div>
          ) : activeMatches.length === 0 ? (
            <EmptyState
              icon="👥"
              title={t('active.empty.title')}
              description={t('active.empty.description')}
            />
          ) : (
            <div className="space-y-4 animate-fade-in">
              {activeMatches.map(match => (
                <Card key={match.id} variant="interactive" className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar
                      src={match.otherUserImage}
                      name={match.otherUserName}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-display text-lg text-lw-charcoal">
                        {match.otherUserName}
                      </h3>
                      <p className="text-sm text-lw-warm-gray line-clamp-1">
                        {match.lastMessage}
                      </p>
                      <p className="text-xs text-lw-warm-gray mt-1">
                        {new Date(match.lastMessageTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => {/* navigate to chat */}}
                    >
                      {t('openChat')}
                    </Button>
                    <Button
                      variant="gold"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleCompleteMatch(match.id)}
                    >
                      {t('complete')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-display text-lw-charcoal mb-2">
          {t('title')}
        </h1>
        <p className="text-lg text-lw-warm-gray">
          {t('subtitle')}
        </p>
      </div>

      <Tabs tabs={tabs} defaultTabId="suggestions" onChange={setActiveTab} />

      {/* Connect Modal */}
      <Modal
        isOpen={connectingBuddyId !== null}
        onClose={() => setConnectingBuddyId(null)}
        title={t('connect.title')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-lw-warm-gray">
            {t('connect.description')}
          </p>
          <Textarea
            value={connectMessage}
            onChange={e => setConnectMessage(e.target.value)}
            placeholder={t('connect.placeholder')}
            maxLength={500}
            showCharCount
            maxCharacters={500}
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConnectingBuddyId(null)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={connectLoading}
              onClick={handleConnect}
            >
              {t('send')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewingMatchId !== null}
        onClose={() => setReviewingMatchId(null)}
        title={t('review.title')}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm font-accent text-lw-warm-gray mb-3 uppercase tracking-wide">
              {t('review.ratingLabel')}
            </p>
            <StarRating
              rating={reviewData.rating}
              onChange={rating => setReviewData({ ...reviewData, rating })}
              size="lg"
            />
          </div>

          <Textarea
            value={reviewData.text}
            onChange={e => setReviewData({ ...reviewData, text: e.target.value })}
            placeholder={t('review.placeholder')}
            maxLength={1000}
            showCharCount
            maxCharacters={1000}
            rows={4}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setReviewingMatchId(null)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              loading={reviewLoading}
              onClick={handleSubmitReview}
            >
              {t('review.submit')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
