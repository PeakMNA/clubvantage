import { Module } from '@nestjs/common';
import { BillingResolver } from './billing.resolver';
import { BillingCycleResolver } from './billing-cycle.resolver';
import { BillingModule } from '@/modules/billing/billing.module';

@Module({
  imports: [BillingModule],
  providers: [BillingResolver, BillingCycleResolver],
})
export class BillingGraphqlModule {}
