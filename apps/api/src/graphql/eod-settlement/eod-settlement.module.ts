import { Module } from '@nestjs/common';
import { EODSettlementService } from './eod-settlement.service';
import { EODSettlementResolver } from './eod-settlement.resolver';

@Module({
  providers: [EODSettlementService, EODSettlementResolver],
  exports: [EODSettlementService],
})
export class EODSettlementModule {}
