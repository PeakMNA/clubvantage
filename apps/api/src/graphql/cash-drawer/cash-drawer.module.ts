import { Module } from '@nestjs/common';
import { CashDrawerService } from './cash-drawer.service';
import { CashDrawerResolver } from './cash-drawer.resolver';

@Module({
  providers: [CashDrawerService, CashDrawerResolver],
  exports: [CashDrawerService],
})
export class CashDrawerModule {}
