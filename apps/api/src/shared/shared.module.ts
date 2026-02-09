import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TaxModule } from './tax/tax.module';
import { IdGeneratorModule } from './id-generator/id-generator.module';

@Module({
  imports: [PrismaModule, TaxModule, IdGeneratorModule],
  exports: [PrismaModule, TaxModule, IdGeneratorModule],
})
export class SharedModule {}
