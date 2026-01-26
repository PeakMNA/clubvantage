import { Module } from '@nestjs/common';
import { GolfService } from './golf.service';
import { GolfController } from './golf.controller';
import { TeeTicketService } from './tee-ticket.service';

@Module({
  controllers: [GolfController],
  providers: [GolfService, TeeTicketService],
  exports: [GolfService, TeeTicketService],
})
export class GolfModule {}
