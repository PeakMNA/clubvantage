import { Module } from '@nestjs/common';
import { ScheduleConfigResolver } from './schedule-config.resolver';
import { ScheduleConfigModule } from '@/modules/schedule-config/schedule-config.module';

@Module({
  imports: [ScheduleConfigModule],
  providers: [ScheduleConfigResolver],
})
export class ScheduleConfigGraphqlModule {}
