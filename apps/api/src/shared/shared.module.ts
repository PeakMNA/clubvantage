import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TaxModule } from './tax/tax.module';

@Module({
  imports: [PrismaModule, TaxModule],
  exports: [PrismaModule, TaxModule],
})
export class SharedModule {}
