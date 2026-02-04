import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { SubAccountsService } from './sub-accounts.service';
import { SubAccountsResolver } from './sub-accounts.resolver';

@Module({
  imports: [PrismaModule],
  providers: [SubAccountsService, SubAccountsResolver],
  exports: [SubAccountsService],
})
export class SubAccountsModule {}
