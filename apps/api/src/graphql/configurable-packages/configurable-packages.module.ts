import { Module } from '@nestjs/common';
import { ConfigurablePackagesResolver } from './configurable-packages.resolver';
import { ConfigurablePackagesModule } from '@/modules/configurable-packages/configurable-packages.module';

@Module({
  imports: [ConfigurablePackagesModule],
  providers: [ConfigurablePackagesResolver],
})
export class ConfigurablePackagesGraphqlModule {}
