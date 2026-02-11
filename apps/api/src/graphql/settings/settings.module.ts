import { Module } from '@nestjs/common';
import { SettingsResolver } from './settings.resolver';
import { SettingsModule } from '@/modules/settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [SettingsResolver],
})
export class SettingsGraphqlModule {}
