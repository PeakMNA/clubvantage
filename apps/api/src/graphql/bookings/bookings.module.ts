import { Module } from '@nestjs/common';
import { BookingsResolver } from './bookings.resolver';
import { BookingsModule as BookingsServiceModule } from '@/modules/bookings/bookings.module';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [BookingsServiceModule, SharedModule],
  providers: [BookingsResolver],
  exports: [BookingsResolver],
})
export class BookingsGraphQLModule {}
