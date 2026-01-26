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
          const graphQLFormattedError = {
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            path: error.path,
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
  ],
})
export class GraphqlModule {}
