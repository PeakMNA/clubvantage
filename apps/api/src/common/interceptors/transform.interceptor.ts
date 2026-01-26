import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    // Skip transformation for GraphQL requests
    // GraphQL has its own response format and shouldn't be wrapped
    const contextType = context.getType<string>();
    if (contextType === 'graphql') {
      return next.handle();
    }

    // Also check if this is a GraphQL execution context
    try {
      const gqlContext = GqlExecutionContext.create(context);
      if (gqlContext.getContext()?.req?.body?.query) {
        return next.handle();
      }
    } catch {
      // Not a GraphQL context, continue with transformation
    }

    return next.handle().pipe(
      map((data) => {
        // If data is already formatted (e.g., paginated response), extract it
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
