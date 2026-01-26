import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AUDIT_KEY, AuditMetadata } from '../decorators/audit.decorator';
import { EventStoreService } from '@/shared/events/event-store.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private eventStore: EventStoreService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    // If no audit decorator, just pass through
    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const entityId = auditMetadata.getEntityId
            ? auditMetadata.getEntityId(request)
            : request.params?.id || response?.id;

          if (user?.tenantId && entityId) {
            await this.eventStore.append({
              tenantId: user.tenantId,
              aggregateType: auditMetadata.entityType,
              aggregateId: entityId,
              type: auditMetadata.action,
              data: {
                body: this.sanitizeBody(request.body),
                params: request.params,
                query: request.query,
                responseId: response?.id,
                duration: Date.now() - startTime,
              },
              userId: user.sub,
              userEmail: user.email,
              metadata: {
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
              },
            });
          }
        } catch (error) {
          // Log but don't fail the request if audit fails
          console.error('Failed to create audit event:', error);
        }
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
