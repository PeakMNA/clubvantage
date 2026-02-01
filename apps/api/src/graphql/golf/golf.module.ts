import { Module, forwardRef } from '@nestjs/common';
import { GolfResolver } from './golf.resolver';
import { GroupBookingResolver } from './group-booking.resolver';
import { LotteryResolver } from './lottery.resolver';
import { WaitlistResolver } from './waitlist.resolver';
import { ClubSettingsResolver } from './club-settings.resolver';
import { CheckInSettingsResolver } from './check-in-settings.resolver';
import { CheckInSettingsService } from './check-in-settings.service';
import { ProShopResolver } from './proshop.resolver';
import { ProShopService } from './proshop.service';
import { CheckInResolver } from './checkin.resolver';
import { CheckInService } from './checkin.service';
import { TicketPrintService } from './ticket-print.service';
import { PaymentService } from './payment.service';
import { LineItemGeneratorService } from './line-item-generator.service';
import { RatesService } from './rates.service';
import { CartService } from './cart.service';
import { CartDraftService } from './cart-draft.service';
import { CartResolver } from './cart.resolver';
import { GolfModule } from '@/modules/golf/golf.module';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { TaxModule } from '@/shared/tax/tax.module';

@Module({
  imports: [forwardRef(() => GolfModule), PrismaModule, TaxModule],
  providers: [
    GolfResolver,
    GroupBookingResolver,
    LotteryResolver,
    WaitlistResolver,
    ClubSettingsResolver,
    CheckInSettingsResolver,
    CheckInSettingsService,
    ProShopResolver,
    ProShopService,
    CheckInResolver,
    CheckInService,
    TicketPrintService,
    PaymentService,
    LineItemGeneratorService,
    RatesService,
    CartService,
    CartDraftService,
    CartResolver,
  ],
  exports: [LineItemGeneratorService, CartService, CartDraftService],
})
export class GolfGraphqlModule {}
