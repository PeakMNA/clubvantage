import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { AudienceService } from './audience.service';
import { ContentGenerationService } from './content-generation.service';
import { ChannelEmailService } from './channel-email.service';
import { MarketingController } from './marketing.controller';

@Module({
  controllers: [MarketingController],
  providers: [
    MarketingService,
    AudienceService,
    ContentGenerationService,
    ChannelEmailService,
  ],
  exports: [
    MarketingService,
    AudienceService,
    ContentGenerationService,
    ChannelEmailService,
  ],
})
export class MarketingModule {}
