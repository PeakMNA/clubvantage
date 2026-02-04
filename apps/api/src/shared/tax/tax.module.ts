import { Module, Global } from '@nestjs/common';
import { TaxCalculatorService } from './tax-calculator.service';

@Global()
@Module({
  providers: [TaxCalculatorService],
  exports: [TaxCalculatorService],
})
export class TaxModule {}
