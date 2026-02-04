import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { StoredPaymentsService } from './stored-payments.service';
import { StoredPaymentsResolver } from './stored-payments.resolver';

@Module({
  imports: [PrismaModule],
  providers: [StoredPaymentsService, StoredPaymentsResolver],
  exports: [StoredPaymentsService],
})
export class StoredPaymentsModule {}
