import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

/**
 * Configuration for ID generation
 */
export interface IdGeneratorConfig {
  /** Model name in Prisma (e.g., 'invoice', 'teeTime') */
  model: string;
  /** Prefix for the ID (e.g., 'INV', 'TT') */
  prefix: string;
  /** Field name that stores the generated ID */
  numberField: string;
  /** Padding length for the numeric portion (default: 5) */
  padding?: number;
}

/**
 * Common ID configurations
 */
export const ID_CONFIGS = {
  INVOICE: {
    model: 'invoice',
    prefix: 'INV',
    numberField: 'invoiceNumber',
    padding: 5,
  },
  TEE_TIME: {
    model: 'teeTime',
    prefix: 'TT',
    numberField: 'teeTimeNumber',
    padding: 5,
  },
  RECEIPT: {
    model: 'receipt',
    prefix: 'RCP',
    numberField: 'receiptNumber',
    padding: 5,
  },
  CREDIT_NOTE: {
    model: 'creditNote',
    prefix: 'CN',
    numberField: 'creditNoteNumber',
    padding: 5,
  },
  MEMBER: {
    model: 'member',
    prefix: 'M',
    numberField: 'memberId',
    padding: 6,
  },
} as const;

/**
 * Service for generating unique, sequential IDs with year prefix
 * Pattern: {PREFIX}-{YEAR}-{SEQUENCE}
 * Example: INV-2026-00001, TT-2026-00042
 */
@Injectable()
export class IdGeneratorService {
  private readonly logger = new Logger(IdGeneratorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique yearly ID for a given model
   *
   * @param clubId - The tenant/club ID
   * @param config - ID generation configuration
   * @returns Generated ID string (e.g., 'INV-2026-00001')
   *
   * @example
   * const invoiceNumber = await this.idGenerator.generateYearlyId(
   *   tenantId,
   *   ID_CONFIGS.INVOICE
   * );
   * // Returns: 'INV-2026-00001'
   */
  async generateYearlyId(
    clubId: string,
    config: IdGeneratorConfig,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const padding = config.padding ?? 5;
    const prefix = `${config.prefix}-${year}`;

    // Find the last record with this prefix
    const lastRecord = await this.findLastRecord(clubId, config, prefix);

    // Calculate next sequence number
    const nextNumber = lastRecord
      ? this.extractSequenceNumber(lastRecord, config.numberField, prefix) + 1
      : 1;

    // Format the ID
    const generatedId = `${prefix}-${nextNumber.toString().padStart(padding, '0')}`;

    this.logger.debug(
      `Generated ${config.model} ID: ${generatedId} for club ${clubId}`,
    );

    return generatedId;
  }

  /**
   * Generate ID using a common configuration
   */
  async generateInvoiceNumber(clubId: string): Promise<string> {
    return this.generateYearlyId(clubId, ID_CONFIGS.INVOICE);
  }

  async generateTeeTimeNumber(clubId: string): Promise<string> {
    return this.generateYearlyId(clubId, ID_CONFIGS.TEE_TIME);
  }

  async generateReceiptNumber(clubId: string): Promise<string> {
    return this.generateYearlyId(clubId, ID_CONFIGS.RECEIPT);
  }

  async generateCreditNoteNumber(clubId: string): Promise<string> {
    return this.generateYearlyId(clubId, ID_CONFIGS.CREDIT_NOTE);
  }

  /**
   * Find the last record with the given prefix
   */
  private async findLastRecord(
    clubId: string,
    config: IdGeneratorConfig,
    prefix: string,
  ): Promise<Record<string, unknown> | null> {
    // Use dynamic model access through Prisma
    const model = (this.prisma as any)[config.model];

    if (!model) {
      this.logger.error(`Invalid Prisma model: ${config.model}`);
      throw new Error(`Invalid Prisma model: ${config.model}`);
    }

    return model.findFirst({
      where: {
        clubId,
        [config.numberField]: { startsWith: prefix },
      },
      orderBy: { [config.numberField]: 'desc' },
    });
  }

  /**
   * Extract the sequence number from an existing ID
   */
  private extractSequenceNumber(
    record: Record<string, unknown>,
    field: string,
    prefix: string,
  ): number {
    const value = record[field] as string;
    if (!value) return 0;

    // ID format: PREFIX-YEAR-SEQUENCE (e.g., INV-2026-00001)
    const parts = value.split('-');
    if (parts.length < 3) return 0;

    const sequencePart = parts[parts.length - 1];
    const sequence = parseInt(sequencePart ?? '0', 10);

    return isNaN(sequence) ? 0 : sequence;
  }
}
