import { Global, Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const PUBSUB_TOKEN = 'PUBSUB';

// Subscription event names
export const SubscriptionEvents = {
  TEE_TIME_UPDATED: 'teeTimeUpdated',
  TEE_TIME_CREATED: 'teeTimeCreated',
  TEE_TIME_CANCELLED: 'teeTimeCancelled',
  TEE_TIME_CHECKED_IN: 'teeTimeCheckedIn',
  MEMBER_UPDATED: 'memberUpdated',
  INVOICE_UPDATED: 'invoiceUpdated',
  PAYMENT_RECEIVED: 'paymentReceived',
} as const;

export type SubscriptionEventName = typeof SubscriptionEvents[keyof typeof SubscriptionEvents];

// Create a PubSub instance
const pubSub = new PubSub();

@Global()
@Module({
  providers: [
    {
      provide: PUBSUB_TOKEN,
      useValue: pubSub,
    },
  ],
  exports: [PUBSUB_TOKEN],
})
export class PubSubModule {}

export { pubSub, PubSub };
