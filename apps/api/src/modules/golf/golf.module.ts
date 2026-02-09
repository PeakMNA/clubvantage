import { Module, forwardRef } from '@nestjs/common';
import { GolfService } from './golf.service';
import { GolfController } from './golf.controller';
import { TeeTicketService } from './tee-ticket.service';
import { TeeSheetService } from './tee-sheet.service';
import { FlightService } from './flight.service';
import { GolfScheduleService } from './golf-schedule.service';
import { BlockService } from './block.service';
import { PlayerRentalService } from './player-rental.service';
import { GolfGraphqlModule } from '@/graphql/golf/golf.module';

@Module({
  imports: [forwardRef(() => GolfGraphqlModule)],
  controllers: [GolfController],
  providers: [
    GolfService,
    TeeTicketService,
    TeeSheetService,
    FlightService,
    GolfScheduleService,
    BlockService,
    PlayerRentalService,
  ],
  exports: [
    GolfService,
    TeeTicketService,
    TeeSheetService,
    FlightService,
    GolfScheduleService,
    BlockService,
    PlayerRentalService,
  ],
})
export class GolfModule {}
