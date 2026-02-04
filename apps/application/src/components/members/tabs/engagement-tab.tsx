'use client';

import { useState, useCallback } from 'react';
import {
  Heart,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Badge,
  Checkbox,
  Skeleton,
} from '@clubvantage/ui';
import { InterestSelector } from '../engagement/interest-selector';
import {
  useInterestCategories,
  useMemberInterests,
  useCommunicationPrefs,
  useEngagementMutations,
} from '@/hooks/use-engagement';
import type { Member } from '../types';

export interface EngagementTabProps {
  member: Member;
}

function SectionHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="relative flex items-center gap-3 border-b border-slate-100 p-4 sm:p-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl border bg-white/80 p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-600" />
      </div>
      <p className="mt-4 text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function EngagementTab({ member }: EngagementTabProps) {
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  // Fetch data
  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useInterestCategories();

  const {
    interests,
    isLoading: isInterestsLoading,
    error: interestsError,
    refetch: refetchInterests,
  } = useMemberInterests(member.id);

  const {
    prefs,
    isLoading: isPrefsLoading,
    error: prefsError,
    refetch: refetchPrefs,
  } = useCommunicationPrefs(member.id);

  const {
    setMemberInterests,
    updateCommunicationPrefs,
  } = useEngagementMutations();

  // Handle saving interests
  const handleSaveInterests = useCallback(
    async (changedInterests: Array<{ categoryId: string; interestLevel: number }>) => {
      setIsSavingInterests(true);
      try {
        await setMemberInterests({
          memberId: member.id,
          interests: changedInterests.map((i) => ({
            categoryId: i.categoryId,
            interestLevel: i.interestLevel,
          })),
        });
        // Refetch to get updated data
        await refetchInterests();
      } finally {
        setIsSavingInterests(false);
      }
    },
    [member.id, setMemberInterests, refetchInterests],
  );

  // Handle toggling communication preferences
  const handleTogglePref = useCallback(
    async (field: 'emailPromotions' | 'smsPromotions' | 'pushNotifications', value: boolean) => {
      setIsSavingPrefs(true);
      try {
        await updateCommunicationPrefs({
          memberId: member.id,
          [field]: value,
        });
        await refetchPrefs();
      } finally {
        setIsSavingPrefs(false);
      }
    },
    [member.id, updateCommunicationPrefs, refetchPrefs],
  );

  const isLoading = isCategoriesLoading || isInterestsLoading || isPrefsLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  if (categoriesError || interestsError) {
    return (
      <ErrorState
        message="Failed to load engagement data"
        onRetry={() => {
          refetchCategories();
          refetchInterests();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Activity Interests Section */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        <div className="relative">
          <SectionHeader icon={Heart} title="Activity Interests" />

          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Track which activities this member is interested in. This helps personalize promotions and recommendations.
            </p>

            <InterestSelector
              categories={categories}
              interests={interests}
              onSave={handleSaveInterests}
              isSaving={isSavingInterests}
            />
          </div>
        </div>
      </div>

      {/* Communication Preferences Section */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        <div className="relative">
          <SectionHeader icon={Bell} title="Communication Preferences" />

          <div className="p-4 sm:p-6">
            <p className="text-sm text-muted-foreground mb-6">
              Control how this member receives promotional communications and updates about club activities.
            </p>

            {prefsError ? (
              <ErrorState
                message="Failed to load communication preferences"
                onRetry={refetchPrefs}
              />
            ) : (
              <div className="space-y-4">
                {/* Email Promotions */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email Promotions</p>
                      <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSavingPrefs && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Checkbox
                      checked={prefs?.emailPromotions ?? true}
                      onCheckedChange={(checked) => handleTogglePref('emailPromotions', !!checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                </div>

                {/* SMS Promotions */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">SMS Promotions</p>
                      <p className="text-sm text-muted-foreground">Receive promotional text messages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSavingPrefs && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Checkbox
                      checked={prefs?.smsPromotions ?? false}
                      onCheckedChange={(checked) => handleTogglePref('smsPromotions', !!checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive push notifications in the member app</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSavingPrefs && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Checkbox
                      checked={prefs?.pushNotifications ?? true}
                      onCheckedChange={(checked) => handleTogglePref('pushNotifications', !!checked)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                </div>

                {/* Unsubscribed categories info */}
                {prefs?.unsubscribedCategories && prefs.unsubscribedCategories.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> Member has opted out of {prefs.unsubscribedCategories.length} activity
                      {prefs.unsubscribedCategories.length !== 1 ? ' categories' : ' category'}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
