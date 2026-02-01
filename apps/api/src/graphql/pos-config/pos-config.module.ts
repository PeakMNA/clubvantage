import { Module } from '@nestjs/common';
import { POSConfigService } from './pos-config.service';
import { POSConfigResolver } from './pos-config.resolver';

@Module({
  providers: [POSConfigService, POSConfigResolver],
  exports: [POSConfigService],
})
export class POSConfigModule {}
