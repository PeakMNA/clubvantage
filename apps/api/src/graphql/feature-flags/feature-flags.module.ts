import { Module } from '@nestjs/common';
import { FeatureFlagsResolver } from './feature-flags.resolver';
import { FeatureFlagsModule } from '@/modules/feature-flags/feature-flags.module';

@Module({
  imports: [FeatureFlagsModule],
  providers: [FeatureFlagsResolver],
})
export class FeatureFlagsGraphqlModule {}
