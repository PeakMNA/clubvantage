import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { CityLedgerService } from './city-ledger.service';
import { AllocationService } from './allocation.service';
import { BillingCycleSettingsService } from './billing-cycle-settings.service';

@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    CityLedgerService,
    AllocationService,
    BillingCycleSettingsService,
  ],
  exports: [
    BillingService,
    CityLedgerService,
    AllocationService,
    BillingCycleSettingsService,
  ],
})
export class BillingModule {}
