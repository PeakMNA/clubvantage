import { Module } from '@nestjs/common';
import { DiscountService } from './discounts.service';
import { DiscountResolver } from './discounts.resolver';

@Module({
  providers: [DiscountService, DiscountResolver],
  exports: [DiscountService],
})
export class DiscountsModule {}
