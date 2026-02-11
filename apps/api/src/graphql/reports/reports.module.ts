import { Module } from '@nestjs/common';
import { ReportsResolver } from './reports.resolver';
import { ReportsModule } from '@/modules/reports/reports.module';

@Module({
  imports: [ReportsModule],
  providers: [ReportsResolver],
})
export class ReportsGraphqlModule {}
