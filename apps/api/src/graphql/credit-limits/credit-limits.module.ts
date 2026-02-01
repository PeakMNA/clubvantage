import { Module } from '@nestjs/common';
import { CreditLimitService } from './credit-limits.service';
import { CreditLimitResolver } from './credit-limits.resolver';

@Module({
  providers: [CreditLimitService, CreditLimitResolver],
  exports: [CreditLimitService],
})
export class CreditLimitsModule {}
