import { SetMetadata } from '@nestjs/common';

export interface AuditMetadata {
  action: string;
  entityType: string;
  getEntityId?: (request: any) => string;
}

export const AUDIT_KEY = 'audit';
export const Audit = (metadata: AuditMetadata) =>
  SetMetadata(AUDIT_KEY, metadata);
