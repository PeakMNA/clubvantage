import { Module } from '@nestjs/common';
import { EngagementResolver } from './engagement.resolver';
import { EngagementModule } from '@/modules/engagement/engagement.module';

@Module({
  imports: [EngagementModule],
  providers: [EngagementResolver],
})
export class EngagementGraphqlModule {}
