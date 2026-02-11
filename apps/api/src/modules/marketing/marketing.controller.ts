import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChannelEmailService } from './channel-email.service';
import { Public } from '@/common/decorators/public.decorator';

@Controller('webhooks/marketing')
export class MarketingController {
  private readonly logger = new Logger(MarketingController.name);

  constructor(private readonly channelEmailService: ChannelEmailService) {}

  @Post('email')
  @Public()
  async handleEmailWebhook(@Body() payload: any) {
    this.logger.log(`Email webhook received: ${payload.type}`);
    try {
      await this.channelEmailService.handleWebhook(payload);
      return { received: true };
    } catch (error) {
      this.logger.error('Failed to process email webhook', error);
      return { received: true, error: 'Processing failed' };
    }
  }
}
