import { Module } from '@nestjs/common';
import { ConfigurablePackagesService } from './configurable-packages.service';

@Module({
  providers: [ConfigurablePackagesService],
  exports: [ConfigurablePackagesService],
})
export class ConfigurablePackagesModule {}
