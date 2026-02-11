import { Module } from '@nestjs/common';
import { BillingResolver } from './billing.resolver';
import { BillingCycleResolver } from './billing-cycle.resolver';
import { PaymentArrangementResolver } from './payment-arrangement.resolver';
import { ShareableLinkResolver } from './shareable-link.resolver';
import { BillingModule } from '@/modules/billing/billing.module';

@Module({
  imports: [BillingModule],
  providers: [
    BillingResolver,
    BillingCycleResolver,
    PaymentArrangementResolver,
    ShareableLinkResolver,
  ],
})
export class BillingGraphqlModule {}
