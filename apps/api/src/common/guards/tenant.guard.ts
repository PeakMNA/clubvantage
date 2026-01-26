import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip GraphQL requests - handled by GqlAuthGuard
    const contextType = context.getType<string>();
    if (contextType === 'graphql') {
      return true;
    }

    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Super admins and platform admins bypass tenant check
    if (user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('PLATFORM_ADMIN')) {
      return true;
    }

    // For tenant-scoped users, ensure they have a tenantId
    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    return true;
  }
}
