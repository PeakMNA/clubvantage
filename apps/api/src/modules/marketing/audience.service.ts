import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import Anthropic from '@anthropic-ai/sdk';

export interface SegmentRule {
  field: string;
  operator: string;
  value: unknown;
  source: string;
}

export interface CreateSegmentDto {
  name: string;
  description?: string;
  type: string;
  rules: SegmentRule[];
  naturalLanguageQuery?: string;
}

export interface UpdateSegmentDto {
  name?: string;
  description?: string;
  rules?: SegmentRule[];
}

export interface SegmentTranslationResult {
  rules: SegmentRule[];
  explanation: string;
  estimatedCount: number;
}

@Injectable()
export class AudienceService {
  private readonly logger = new Logger(AudienceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSegment(clubId: string, dto: CreateSegmentDto) {
    const segment = await this.prisma.marketingAudienceSegment.create({
      data: {
        clubId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        rules: dto.rules as any,
        naturalLanguageQuery: dto.naturalLanguageQuery,
      },
    });

    // Calculate initial member count
    const count = await this.calculateMemberCount(clubId, dto.rules);
    return this.prisma.marketingAudienceSegment.update({
      where: { id: segment.id },
      data: { memberCount: count, refreshedAt: new Date() },
    });
  }

  async getSegments(clubId: string, filters?: { type?: string; isArchived?: boolean }) {
    return this.prisma.marketingAudienceSegment.findMany({
      where: {
        clubId,
        ...(filters?.type ? { type: filters.type } : {}),
        isArchived: filters?.isArchived ?? false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSegment(clubId: string, segmentId: string) {
    const segment = await this.prisma.marketingAudienceSegment.findFirst({
      where: { id: segmentId, clubId },
    });
    if (!segment) {
      throw new NotFoundException('Segment not found');
    }
    return segment;
  }

  async updateSegment(clubId: string, segmentId: string, dto: UpdateSegmentDto) {
    const segment = await this.getSegment(clubId, segmentId);

    const updated = await this.prisma.marketingAudienceSegment.update({
      where: { id: segment.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.rules !== undefined ? { rules: dto.rules as any } : {}),
      },
    });

    // Recalculate member count if rules changed
    if (dto.rules) {
      const count = await this.calculateMemberCount(clubId, dto.rules);
      return this.prisma.marketingAudienceSegment.update({
        where: { id: updated.id },
        data: { memberCount: count, refreshedAt: new Date() },
      });
    }

    return updated;
  }

  async deleteSegment(clubId: string, segmentId: string) {
    const segment = await this.getSegment(clubId, segmentId);
    await this.prisma.marketingAudienceSegment.update({
      where: { id: segment.id },
      data: { isArchived: true },
    });
    return true;
  }

  async refreshSegmentCount(clubId: string, segmentId: string) {
    const segment = await this.getSegment(clubId, segmentId);
    const rules = (segment.rules as any) || [];
    const count = await this.calculateMemberCount(clubId, rules);
    return this.prisma.marketingAudienceSegment.update({
      where: { id: segment.id },
      data: { memberCount: count, refreshedAt: new Date() },
    });
  }

  async getSegmentMembers(
    clubId: string,
    segmentId: string,
    pagination?: { skip?: number; take?: number },
  ) {
    const segment = await this.getSegment(clubId, segmentId);
    const rules = (segment.rules as any) || [];
    const where = this.buildPrismaWhere(clubId, rules);

    return this.prisma.member.findMany({
      where,
      skip: pagination?.skip ?? 0,
      take: pagination?.take ?? 50,
      select: {
        id: true,
        memberId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        membershipType: { select: { name: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async translateNaturalLanguage(
    clubId: string,
    query: string,
  ): Promise<SegmentTranslationResult> {
    const anthropic = new Anthropic();

    const systemPrompt = `You are a segment rule translator for a club management system (country clubs, golf courses).
You translate natural language queries into structured segment rules.

Available fields and their sources:
- MEMBERS source: status (ACTIVE/SUSPENDED/LAPSED/etc), membershipType (string), joinDate (date), renewalDate (date), tags (string array), gender (string), dateOfBirth (date)
- BOOKINGS source: bookingCount (number for period), lastBookingDate (date), facilityType (string)
- BILLING source: outstandingBalance (number), totalSpend (number for period), invoiceStatus (string)
- GOLF source: roundsPlayed (number for period), handicap (number), lastRoundDate (date)

Available operators: EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, CONTAINS, NOT_CONTAINS, IN, NOT_IN, BETWEEN, IS_NULL, IS_NOT_NULL, BEFORE, AFTER, WITHIN_LAST

Return ONLY valid JSON in this exact format:
{
  "rules": [{ "field": "fieldName", "operator": "OPERATOR", "value": "value", "source": "SOURCE" }],
  "explanation": "Human-readable explanation of what this segment targets",
  "estimatedCount": 0
}

For date-relative values like "last 30 days", use WITHIN_LAST operator with value as number of days.
Set estimatedCount to 0 (will be calculated separately).`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    const responseText = textContent?.text || '{}';

    try {
      const parsed = JSON.parse(responseText);
      const rules: SegmentRule[] = parsed.rules || [];

      // Calculate actual member count
      const count = await this.calculateMemberCount(clubId, rules);

      return {
        rules,
        explanation: parsed.explanation || 'Segment rules generated from your query.',
        estimatedCount: count,
      };
    } catch (error) {
      this.logger.error('Failed to parse NL translation response', error);
      return {
        rules: [],
        explanation: 'Could not parse the query. Please try rephrasing.',
        estimatedCount: 0,
      };
    }
  }

  private async calculateMemberCount(
    clubId: string,
    rules: SegmentRule[],
  ): Promise<number> {
    const where = this.buildPrismaWhere(clubId, rules);
    return this.prisma.member.count({ where });
  }

  private buildPrismaWhere(clubId: string, rules: SegmentRule[]): any {
    const where: any = { clubId, isActive: true };
    const memberFilters: any[] = [];

    for (const rule of rules) {
      if (rule.source === 'MEMBERS') {
        const filter = this.buildMemberFilter(rule);
        if (filter) memberFilters.push(filter);
      }
      // BOOKINGS, BILLING, GOLF sources would require subqueries
      // For Phase 1, we handle MEMBERS source directly and
      // approximate others with basic filters
    }

    if (memberFilters.length > 0) {
      where.AND = memberFilters;
    }

    return where;
  }

  private buildMemberFilter(rule: SegmentRule): any {
    const { field, operator, value } = rule;

    switch (operator) {
      case 'EQUALS':
        return { [field]: value };
      case 'NOT_EQUALS':
        return { [field]: { not: value } };
      case 'GREATER_THAN':
        return { [field]: { gt: value } };
      case 'LESS_THAN':
        return { [field]: { lt: value } };
      case 'GREATER_THAN_OR_EQUAL':
        return { [field]: { gte: value } };
      case 'LESS_THAN_OR_EQUAL':
        return { [field]: { lte: value } };
      case 'CONTAINS':
        return { [field]: { contains: value, mode: 'insensitive' } };
      case 'IN':
        return { [field]: { in: Array.isArray(value) ? value : [value] } };
      case 'NOT_IN':
        return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
      case 'IS_NULL':
        return { [field]: null };
      case 'IS_NOT_NULL':
        return { [field]: { not: null } };
      case 'BEFORE':
        return { [field]: { lt: new Date(value as string) } };
      case 'AFTER':
        return { [field]: { gt: new Date(value as string) } };
      case 'WITHIN_LAST': {
        const days = Number(value);
        const date = new Date();
        date.setDate(date.getDate() - days);
        return { [field]: { gte: date } };
      }
      case 'BETWEEN': {
        const [min, max] = Array.isArray(value) ? value : [];
        return { [field]: { gte: min, lte: max } };
      }
      default:
        return null;
    }
  }
}
