import { Module } from '@nestjs/common';
import { ScheduleConfigService } from './schedule-config.service';

@Module({
  providers: [ScheduleConfigService],
  exports: [ScheduleConfigService],
})
export class ScheduleConfigModule {}
