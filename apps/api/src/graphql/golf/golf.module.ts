import { Module } from '@nestjs/common';
import { GolfResolver } from './golf.resolver';
import { GroupBookingResolver } from './group-booking.resolver';
import { LotteryResolver } from './lottery.resolver';
import { WaitlistResolver } from './waitlist.resolver';
import { GolfModule } from '@/modules/golf/golf.module';

@Module({
  imports: [GolfModule],
  providers: [GolfResolver, GroupBookingResolver, LotteryResolver, WaitlistResolver],
})
export class GolfGraphqlModule {}
