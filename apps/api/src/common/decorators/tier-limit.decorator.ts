import { SetMetadata } from '@nestjs/common';

export const TIER_LIMIT_KEY = 'tier_limit';

/**
 * Decorator to enforce tier-based resource limits on mutations.
 * Applies to create operations that count against Club.maxMembers or Club.maxUsers.
 *
 * @param resource - The resource type to check: 'members' or 'users'
 *
 * @example
 * @TierLimit('members')
 * @Mutation(() => Member)
 * async createMember(...) { ... }
 */
export const TierLimit = (resource: 'members' | 'users') =>
  SetMetadata(TIER_LIMIT_KEY, resource);
