import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { OutletConfigService } from './outlet-config.service';
import { OutletConfigResolver } from './outlet-config.resolver';
import { SuggestionService } from './suggestion.service';

@Module({
  providers: [
    ProductService,
    ProductResolver,
    OutletConfigService,
    OutletConfigResolver,
    SuggestionService,
  ],
  exports: [ProductService, OutletConfigService, SuggestionService],
})
export class ProductsModule {}
