import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Request, Response } from 'express';

// Common modules
import { PubSubModule } from './common/pubsub';

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

@Module({
  imports: [
    PubSubModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('app.env') !== 'production',
        introspection: configService.get('app.env') !== 'production',
        context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),
        formatError: (error) => {
          // Log the full error for debugging
          console.error('GraphQL Error:', JSON.stringify(error, null, 2));
          if (error.extensions?.originalError) {
            console.error('Original Error:', JSON.stringify(error.extensions.originalError, null, 2));
          }
          const graphQLFormattedError = {
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            path: error.path,
            // Include validation details if present
            validationErrors: (error.extensions?.originalError as any)?.message,
          };
          return graphQLFormattedError;
        },
        subscriptions: {
          'graphql-ws': true,
          'subscriptions-transport-ws': true,
        },
      }),
      inject: [ConfigService],
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
  ],
})
export class GraphqlModule {}
