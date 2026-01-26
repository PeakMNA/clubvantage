import { Module } from '@nestjs/common';
import { BillingResolver } from './billing.resolver';
import { BillingModule } from '@/modules/billing/billing.module';

@Module({
  imports: [BillingModule],
  providers: [BillingResolver],
})
export class BillingGraphqlModule {}
