import { Module } from '@nestjs/common';
import { LookupsResolver } from './lookups.resolver';
import { LookupsModule } from '@/modules/lookups/lookups.module';

@Module({
  imports: [LookupsModule],
  providers: [LookupsResolver],
})
export class LookupsGraphQLModule {}
