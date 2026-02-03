import { Module, Logger } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Request, Response } from 'express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

// Common modules
import { PubSubModule } from './common/pubsub';
import { DataLoaderModule, DataLoaderService, IDataLoaders } from './common/dataloader';

/**
 * GraphQL Context interface
 * Provides typed access to request, response, user, and DataLoaders
 */
export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: {
    sub: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
  loaders: IDataLoaders;
}

// Feature modules
import { MembersGraphqlModule } from './members/members.module';
import { BillingGraphqlModule } from './billing/billing.module';
import { GolfGraphqlModule } from './golf/golf.module';
import { BookingsGraphQLModule } from './bookings/bookings.module';
import { ApplicationsGraphqlModule } from './applications/applications.module';
import { ScheduleConfigGraphqlModule } from './schedule-config/schedule-config.module';
import { DiscountsModule } from './discounts/discounts.module';
import { CreditLimitsModule } from './credit-limits/credit-limits.module';
import { CashDrawerModule } from './cash-drawer/cash-drawer.module';
import { EODSettlementModule } from './eod-settlement/eod-settlement.module';
import { MinimumSpendModule } from './minimum-spend/minimum-spend.module';
import { SubAccountsModule } from './sub-accounts/sub-accounts.module';
import { StoredPaymentsModule } from './stored-payments/stored-payments.module';
import { POSConfigModule } from './pos-config/pos-config.module';
import { ProductsModule } from './products/products.module';
import { EngagementGraphqlModule } from './engagement/engagement.module';
import { EquipmentGraphQLModule } from './equipment/equipment.module';
import { LookupsGraphQLModule } from './lookups/lookups.module';
import { DocumentsModule } from './documents/documents.module';

// GraphQL error formatter logger
const graphqlLogger = new Logger('GraphQL');

/**
 * Format GraphQL errors for client consumption.
 * - Logs full error details for debugging
 * - Returns sanitized error to client (no stack traces in production)
 */
function formatGraphQLError(
  error: GraphQLError,
  isProduction: boolean,
): GraphQLFormattedError {
  // Log the full error for debugging
  const errorDetails = {
    message: error.message,
    path: error.path,
    code: error.extensions?.code,
    originalError: error.extensions?.originalError,
  };

  // Log based on error type
  const errorCode = error.extensions?.code as string | undefined;
  if (errorCode === 'UNAUTHENTICATED' || errorCode === 'FORBIDDEN') {
    graphqlLogger.warn(`Auth error: ${error.message}`, { path: error.path });
  } else if (errorCode === 'BAD_USER_INPUT' || errorCode === 'VALIDATION_ERROR') {
    graphqlLogger.warn(`Validation error: ${error.message}`, errorDetails);
  } else {
    graphqlLogger.error(`GraphQL error: ${error.message}`, JSON.stringify(errorDetails, null, 2));
  }

  // Build extensions object
  const extensions: Record<string, unknown> = {
    code: errorCode || 'INTERNAL_SERVER_ERROR',
  };

  // Include validation details for user input errors
  if (errorCode === 'BAD_USER_INPUT' || errorCode === 'VALIDATION_ERROR') {
    const originalError = error.extensions?.originalError as { message?: string } | undefined;
    if (originalError?.message) {
      extensions.validationErrors = originalError.message;
    }
  }

  // Include stack trace only in development
  if (!isProduction && error.extensions?.stacktrace) {
    extensions.stacktrace = error.extensions.stacktrace;
  }

  // Build sanitized response for client
  const formattedError: GraphQLFormattedError = {
    message: error.message,
    path: error.path,
    extensions,
  };

  return formattedError;
}

@Module({
  imports: [
    PubSubModule,
    DataLoaderModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule, DataLoaderModule],
      useFactory: (configService: ConfigService, dataLoaderService: DataLoaderService) => {
        const isProduction = configService.get('app.env') === 'production';

        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: !isProduction,
          introspection: !isProduction,
          context: ({ req, res }: { req: Request; res: Response }): GraphQLContext => {
            // Extract user from request (set by auth guard)
            const user = (req as any).user;

            // Create request-scoped DataLoaders
            // Loaders are created per-request to prevent cross-request data leakage
            const loaders = user?.tenantId
              ? dataLoaderService.createLoaders(user.tenantId)
              : dataLoaderService.createLoaders('');

            return { req, res, user, loaders };
          },
          formatError: (error: GraphQLError) => formatGraphQLError(error, isProduction),
          subscriptions: {
            'graphql-ws': true,
            'subscriptions-transport-ws': true,
          },
        };
      },
      inject: [ConfigService, DataLoaderService],
    }),
    MembersGraphqlModule,
    BillingGraphqlModule,
    GolfGraphqlModule,
    BookingsGraphQLModule,
    ApplicationsGraphqlModule,
    ScheduleConfigGraphqlModule,
    DiscountsModule,
    CreditLimitsModule,
    CashDrawerModule,
    EODSettlementModule,
    MinimumSpendModule,
    SubAccountsModule,
    StoredPaymentsModule,
    POSConfigModule,
    ProductsModule,
    EngagementGraphqlModule,
    EquipmentGraphQLModule,
    LookupsGraphQLModule,
    DocumentsModule,
  ],
})
export class GraphqlModule {}
