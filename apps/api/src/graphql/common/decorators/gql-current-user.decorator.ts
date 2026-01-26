import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

/**
 * Parameter decorator to extract the current user from the GraphQL context.
 * Can optionally extract a specific property from the user object.
 *
 * @example
 * // Get the full user object
 * async handler(@GqlCurrentUser() user: JwtPayload)
 *
 * // Get just the tenantId
 * async handler(@GqlCurrentUser('tenantId') tenantId: string)
 */
export const GqlCurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const request = gqlContext?.req;
    const user = request?.user as JwtPayload;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
