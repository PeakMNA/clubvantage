import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class SupabaseAuthGuard extends AuthGuard('supabase') {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Skip GraphQL requests - they are handled by GqlAuthGuard
    const contextType = context.getType<string>();
    if (contextType === 'graphql') {
      return true;
    }

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    context: ExecutionContext,
  ): TUser {
    // Check if route is public (needed for handleRequest which is called after canActivate)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user;
    }

    if (err) {
      this.logger.error(`Authentication error: ${err.message}`);
      throw err;
    }

    if (!user) {
      const message = info?.message || 'Authentication required';
      throw new UnauthorizedException(message);
    }

    return user;
  }
}
