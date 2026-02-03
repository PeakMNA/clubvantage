import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ResourceAvailabilityService } from './resource-availability.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, ResourceAvailabilityService],
  exports: [BookingsService, ResourceAvailabilityService],
})
export class BookingsModule {}
