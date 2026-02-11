import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Resend } from 'resend';

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface BatchEmail {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class ChannelEmailService {
  private readonly logger = new Logger(ChannelEmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getResendClient(clubId: string): Promise<Resend> {
    const config = await this.prisma.marketingChannelConfig.findUnique({
      where: { clubId_type: { clubId, type: 'EMAIL' } },
    });
    const apiKey =
      (config?.credentials as any)?.apiKey || process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Resend API key not configured');
    }
    return new Resend(apiKey);
  }

  private async getSenderInfo(clubId: string) {
    const brandConfig = await this.prisma.marketingBrandConfig.findUnique({
      where: { clubId },
    });
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { name: true, email: true },
    });

    return {
      fromName: brandConfig?.fromName || club?.name || 'Club',
      fromEmail: brandConfig?.fromEmail || club?.email || 'noreply@example.com',
      replyTo: brandConfig?.replyToEmail || club?.email || undefined,
    };
  }

  async sendEmail(clubId: string, dto: SendEmailDto) {
    const resend = await this.getResendClient(clubId);
    const sender = await this.getSenderInfo(clubId);

    const from = dto.from || `${sender.fromName} <${sender.fromEmail}>`;
    const replyTo = dto.replyTo || sender.replyTo;

    try {
      const result = await resend.emails.send({
        from,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        replyTo,
      });

      this.logger.log(`Email sent to ${dto.to}, id: ${result.data?.id}`);
      return { success: true, messageId: result.data?.id };
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  async sendBatch(clubId: string, emails: BatchEmail[]) {
    const resend = await this.getResendClient(clubId);
    const sender = await this.getSenderInfo(clubId);
    const from = `${sender.fromName} <${sender.fromEmail}>`;

    const results: Array<{ to: string; success: boolean; messageId?: string; error?: string }> = [];

    // Resend supports up to 100 emails per batch
    const batchSize = 100;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      try {
        const batchPayload = batch.map((email) => ({
          from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          replyTo: sender.replyTo,
        }));

        const result = await resend.batch.send(batchPayload);

        for (let j = 0; j < batch.length; j++) {
          const data = result.data?.data?.[j];
          results.push({
            to: batch[j].to,
            success: true,
            messageId: data?.id,
          });
        }
      } catch (error) {
        this.logger.error(`Batch send failed for chunk ${i}`, error);
        for (const email of batch) {
          results.push({
            to: email.to,
            success: false,
            error: (error as Error).message,
          });
        }
      }
    }

    return results;
  }

  async handleWebhook(payload: any) {
    const eventType = payload.type;
    const emailId = payload.data?.email_id;
    const recipient = payload.data?.to?.[0];

    this.logger.log(`Webhook received: ${eventType} for ${emailId}`);

    // Map Resend event types to our event types
    const eventMap: Record<string, string> = {
      'email.sent': 'SENT',
      'email.delivered': 'DELIVERED',
      'email.opened': 'OPENED',
      'email.clicked': 'CLICKED',
      'email.bounced': 'BOUNCED',
      'email.complained': 'COMPLAINED',
    };

    const mappedEvent = eventMap[eventType];
    if (!mappedEvent) return;

    // Find campaign member by email
    // This is a simplified lookup - in production, we'd track by message ID
    if (recipient) {
      const member = await this.prisma.member.findFirst({
        where: { email: recipient },
        select: { id: true, clubId: true },
      });

      if (member) {
        // Record the marketing event
        await this.prisma.marketingEvent.create({
          data: {
            clubId: member.clubId,
            memberId: member.id,
            eventType: mappedEvent,
            channel: 'EMAIL',
            metadata: payload.data || {},
          },
        });

        // Update campaign member status if we can find the record
        const statusMap: Record<string, string> = {
          DELIVERED: 'DELIVERED',
          OPENED: 'OPENED',
          CLICKED: 'CLICKED',
          BOUNCED: 'BOUNCED',
        };

        const newStatus = statusMap[mappedEvent];
        if (newStatus) {
          const dateField: Record<string, string> = {
            DELIVERED: 'deliveredAt',
            OPENED: 'openedAt',
            CLICKED: 'clickedAt',
          };

          // Update the most recent campaign member record for this member
          const campaignMember = await this.prisma.marketingCampaignMember.findFirst({
            where: { memberId: member.id, status: { in: ['SENT', 'DELIVERED', 'OPENED'] } },
            orderBy: { createdAt: 'desc' },
          });

          if (campaignMember) {
            const updateData: any = { status: newStatus };
            const df = dateField[mappedEvent];
            if (df) {
              updateData[df] = new Date();
            }
            await this.prisma.marketingCampaignMember.update({
              where: { id: campaignMember.id },
              data: updateData,
            });
          }
        }
      }
    }
  }

  async getChannelConfig(clubId: string) {
    return this.prisma.marketingChannelConfig.findUnique({
      where: { clubId_type: { clubId, type: 'EMAIL' } },
    });
  }
}
