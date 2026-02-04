import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { MinimumSpendService } from './minimum-spend.service';
import { MinimumSpendResolver } from './minimum-spend.resolver';

@Module({
  imports: [PrismaModule],
  providers: [MinimumSpendService, MinimumSpendResolver],
  exports: [MinimumSpendService],
})
export class MinimumSpendModule {}
