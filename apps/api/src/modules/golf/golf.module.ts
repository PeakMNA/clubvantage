import { Module, forwardRef } from '@nestjs/common';
import { GolfService } from './golf.service';
import { GolfController } from './golf.controller';
import { TeeTicketService } from './tee-ticket.service';
import { GolfGraphqlModule } from '@/graphql/golf/golf.module';

@Module({
  imports: [forwardRef(() => GolfGraphqlModule)],
  controllers: [GolfController],
  providers: [GolfService, TeeTicketService],
  exports: [GolfService, TeeTicketService],
})
export class GolfModule {}
