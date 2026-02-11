import { Module } from '@nestjs/common';
import { MarketingResolver } from './marketing.resolver';
import { MarketingModule } from '@/modules/marketing/marketing.module';

@Module({
  imports: [MarketingModule],
  providers: [MarketingResolver],
})
export class MarketingGraphqlModule {}
