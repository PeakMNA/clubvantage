/**
 * Member Engagement Types
 * Types for interest capture and communication preferences
 */

// =============================================================================
// Interest Source
// =============================================================================

export type InterestSource = 'EXPLICIT' | 'BOOKING' | 'INFERRED';

// =============================================================================
// Interest Category
// =============================================================================

export interface InterestCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

// =============================================================================
// Member Interest
// =============================================================================

export interface MemberInterest {
  id: string;
  memberId: string;
  categoryId: string;
  interestLevel: number; // 0-100
  source: InterestSource;
  lastActivityAt?: string;
  activityCount: number;
  category?: InterestCategory;
}

// =============================================================================
// Dependent Interest
// =============================================================================

export interface DependentInterest {
  id: string;
  dependentId: string;
  categoryId: string;
  interestLevel: number; // 0-100
  category?: InterestCategory;
}

// =============================================================================
// Communication Preferences
// =============================================================================

export interface CommunicationPrefs {
  id: string;
  memberId: string;
  emailPromotions: boolean;
  smsPromotions: boolean;
  pushNotifications: boolean;
  unsubscribedCategories: string[];
}

// =============================================================================
// Input Types (for mutations)
// =============================================================================

export interface InterestInput {
  categoryId: string;
  interestLevel: number;
  source?: InterestSource;
}

export interface SetMemberInterestsInput {
  memberId: string;
  interests: InterestInput[];
}

export interface SetDependentInterestsInput {
  dependentId: string;
  interests: Omit<InterestInput, 'source'>[];
}

export interface UpdateCommunicationPrefsInput {
  memberId: string;
  emailPromotions?: boolean;
  smsPromotions?: boolean;
  pushNotifications?: boolean;
  unsubscribedCategories?: string[];
}

// =============================================================================
// Component State Types
// =============================================================================

export interface PendingInterestChange {
  categoryId: string;
  originalLevel: number | null; // null if newly added
  newLevel: number;
}

export interface InterestSelectorState {
  interests: Map<string, number>; // categoryId -> interestLevel
  pendingChanges: Map<string, PendingInterestChange>;
  hasChanges: boolean;
}
