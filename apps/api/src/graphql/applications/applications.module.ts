import { Module } from '@nestjs/common';
import { ApplicationsResolver } from './applications.resolver';
import { ApplicationsModule } from '@/modules/applications/applications.module';

@Module({
  imports: [ApplicationsModule],
  providers: [ApplicationsResolver],
})
export class ApplicationsGraphqlModule {}
