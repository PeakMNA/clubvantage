import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { CityLedgerService } from './city-ledger.service';
import { AllocationService } from './allocation.service';
import { BillingCycleSettingsService } from './billing-cycle-settings.service';
import { PaymentArrangementService } from './payment-arrangement.service';
import { ShareableLinkService } from './shareable-link.service';
import { ShareableLinkController } from './shareable-link.controller';

@Module({
  controllers: [BillingController, ShareableLinkController],
  providers: [
    BillingService,
    CityLedgerService,
    AllocationService,
    BillingCycleSettingsService,
    PaymentArrangementService,
    ShareableLinkService,
  ],
  exports: [
    BillingService,
    CityLedgerService,
    AllocationService,
    BillingCycleSettingsService,
    PaymentArrangementService,
    ShareableLinkService,
  ],
})
export class BillingModule {}
