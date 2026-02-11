import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

export interface GenerateContentDto {
  audienceDescription?: string;
  campaignGoal: string;
  tone?: string;
  contentType?: string;
}

export interface GeneratedContent {
  subject: string;
  body: string;
  previewText: string;
}

@Injectable()
export class ContentGenerationService {
  private readonly logger = new Logger(ContentGenerationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateEmailContent(
    clubId: string,
    input: GenerateContentDto,
  ): Promise<GeneratedContent> {
    const brandConfig = await this.prisma.marketingBrandConfig.findUnique({
      where: { clubId },
    });
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { name: true },
    });

    const clubName = club?.name || 'The Club';
    const tone = input.tone || brandConfig?.tone || 'professional';
    const language = brandConfig?.language || 'en';
    const guidelines = brandConfig?.guidelines || '';

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: `You are a marketing copywriter for ${clubName}, a private club.
Tone: ${tone}
Language: ${language}
${guidelines ? `Brand guidelines: ${guidelines}` : ''}

Generate an email with subject line, HTML body, and preview text.
Return ONLY valid JSON in this exact format:
{
  "subject": "Email subject line",
  "body": "<html>...</html>",
  "previewText": "Short preview text for email clients"
}

The HTML body should be clean, professional email HTML with inline styles.
Include a header, main content, and footer. Use a clean layout.
Do NOT include <script> tags or external resources.`,
      messages: [
        {
          role: 'user',
          content: `Generate an email for: ${input.campaignGoal}${input.audienceDescription ? `\nTarget audience: ${input.audienceDescription}` : ''}`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    const responseText = textContent?.text || '{}';

    try {
      const parsed = JSON.parse(responseText);
      return {
        subject: parsed.subject || 'Untitled Email',
        body: parsed.body || '<p>Content generation failed. Please try again.</p>',
        previewText: parsed.previewText || '',
      };
    } catch (error) {
      this.logger.error('Failed to parse content generation response', error);
      return {
        subject: 'Untitled Email',
        body: '<p>Content generation failed. Please try again.</p>',
        previewText: '',
      };
    }
  }

  async generateVariant(clubId: string, contentId: string): Promise<GeneratedContent> {
    const content = await this.prisma.marketingContentPiece.findFirst({
      where: { id: contentId, clubId },
    });

    if (!content) {
      throw new Error('Content piece not found');
    }

    return this.generateEmailContent(clubId, {
      campaignGoal: `Create an A/B variant of this email. Original subject: "${content.subject}". Keep the same general message but vary the approach, tone, or angle.`,
    });
  }

  async improveContent(
    clubId: string,
    contentId: string,
    feedback: string,
  ): Promise<GeneratedContent> {
    const content = await this.prisma.marketingContentPiece.findFirst({
      where: { id: contentId, clubId },
    });

    if (!content) {
      throw new Error('Content piece not found');
    }

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: `You are a marketing copywriter. Improve the given email based on feedback.
Return ONLY valid JSON: { "subject": "...", "body": "<html>...</html>", "previewText": "..." }`,
      messages: [
        {
          role: 'user',
          content: `Original email subject: ${content.subject}\nOriginal body: ${content.body}\n\nFeedback to incorporate: ${feedback}`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    const responseText = textContent?.text || '{}';

    try {
      const parsed = JSON.parse(responseText);
      return {
        subject: parsed.subject || content.subject || 'Untitled Email',
        body: parsed.body || content.body,
        previewText: parsed.previewText || content.previewText || '',
      };
    } catch {
      return {
        subject: content.subject || 'Untitled Email',
        body: content.body,
        previewText: content.previewText || '',
      };
    }
  }
}
