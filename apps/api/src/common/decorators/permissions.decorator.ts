import { SetMetadata, ForbiddenException } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Inline permission check for GraphQL resolvers.
 * GQL resolvers use GqlAuthGuard (auth only), not PermissionsGuard,
 * so this helper can be called inside resolver methods.
 */
export function assertPermission(
  userPermissions: string[],
  required: string,
): void {
  if (!userPermissions) {
    throw new ForbiddenException(`Missing required permission: ${required}`);
  }
  if (userPermissions.includes('*')) return;
  if (!userPermissions.includes(required)) {
    throw new ForbiddenException(`Missing required permission: ${required}`);
  }
}

// ==================== AR Close Workflow Permissions ====================
export const AR_PERMISSIONS = {
  SIGN_OFF_CHECKLIST: 'billing.checklist.signoff',
  CLOSE_PERIOD: 'billing.period.close',
  REOPEN_PERIOD: 'billing.period.reopen',
  APPROVE_REOPEN: 'billing.period.approve-reopen',
} as const;
