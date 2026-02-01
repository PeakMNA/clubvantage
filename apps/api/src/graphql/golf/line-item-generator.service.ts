import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TaxCalculatorService, TaxType } from '@/shared/tax/tax-calculator.service';

interface GenerateLineItemsOptions {
  playerId: string;
  courseId: string;
  clubId: string;
  playerType: string; // MEMBER, GUEST, DEPENDENT, WALK_UP
  holes: number; // 9 or 18
  cartType?: string; // SINGLE, SHARED, WALKING
  caddyRequest?: string; // NONE, FORECADDY, SINGLE, DOUBLE
  sharedWithPosition?: number; // For shared cart cost splitting
  teeTime?: Date; // For time-based pricing (prime time)
}

@Injectable()
export class LineItemGeneratorService {
  private readonly logger = new Logger(LineItemGeneratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly taxCalculator: TaxCalculatorService,
  ) {}

  /**
   * Get active rate config for a course on a given date
   */
  private async getActiveRateConfig(courseId: string, date: Date) {
    return this.prisma.golfRateConfig.findFirst({
      where: {
        courseId,
        isActive: true,
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      include: {
        greenFeeRates: true,
        cartRates: true,
        caddyRates: true,
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Determine time category based on tee time
   */
  private getTimeCategory(teeTime: Date): string {
    const hour = teeTime.getHours();
    // Prime time: 7am-11am on weekends, 8am-10am on weekdays
    const dayOfWeek = teeTime.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend && hour >= 7 && hour < 11) return 'PRIME_TIME';
    if (!isWeekend && hour >= 8 && hour < 10) return 'PRIME_TIME';
    if (hour >= 15) return 'OFF_PEAK'; // After 3pm
    return 'STANDARD';
  }

  /**
   * Generate line items for a single player
   */
  async generateLineItemsForPlayer(options: GenerateLineItemsOptions): Promise<void> {
    const {
      playerId,
      courseId,
      clubId,
      playerType,
      holes,
      cartType,
      caddyRequest,
      sharedWithPosition,
      teeTime
    } = options;

    try {
      const effectiveDate = teeTime || new Date();
      const rateConfig = await this.getActiveRateConfig(courseId, effectiveDate);

      if (!rateConfig) {
        this.logger.warn(
          `No active rate config found for course ${courseId}. Skipping line item generation.`,
        );
        return;
      }

      const lineItemsToCreate: any[] = [];
      const timeCategory = teeTime ? this.getTimeCategory(teeTime) : 'STANDARD';

      // 1. Green Fee
      const greenFeeRate = rateConfig.greenFeeRates.find(
        (r) => r.playerType === playerType && r.holes === holes && r.timeCategory === timeCategory,
      ) || rateConfig.greenFeeRates.find(
        (r) => r.playerType === playerType && r.holes === holes && r.timeCategory === 'STANDARD',
      );

      if (greenFeeRate) {
        const { taxAmount, totalAmount } = this.taxCalculator.calculateTax(
          Number(greenFeeRate.amount),
          greenFeeRate.taxType as TaxType,
          Number(greenFeeRate.taxRate),
        );

        lineItemsToCreate.push({
          teeTimePlayerId: playerId,
          type: 'GREEN_FEE',
          description: `Green Fee (${holes} holes)`,
          baseAmount: Number(greenFeeRate.amount),
          taxType: greenFeeRate.taxType,
          taxRate: Number(greenFeeRate.taxRate),
          taxAmount,
          totalAmount,
          isPaid: false,
        });
      }

      // 2. Cart Fee (if not walking)
      if (cartType && cartType !== 'WALKING') {
        const cartRate = rateConfig.cartRates.find((r) => r.cartType === cartType);

        if (cartRate) {
          let cartAmount = Number(cartRate.amount);

          // For shared carts, the rate is already per person
          // No need to split further

          const { taxAmount, totalAmount } = this.taxCalculator.calculateTax(
            cartAmount,
            cartRate.taxType as TaxType,
            Number(cartRate.taxRate),
          );

          lineItemsToCreate.push({
            teeTimePlayerId: playerId,
            type: 'CART',
            description: cartType === 'SHARED' ? 'Cart Rental (Shared)' : 'Cart Rental (Single)',
            baseAmount: cartAmount,
            taxType: cartRate.taxType,
            taxRate: Number(cartRate.taxRate),
            taxAmount,
            totalAmount,
            isPaid: false,
          });
        }
      }

      // 3. Caddy Fee (if requested)
      if (caddyRequest && caddyRequest !== 'NONE') {
        const caddyRate = rateConfig.caddyRates.find((r) => r.caddyType === caddyRequest);

        if (caddyRate) {
          const { taxAmount, totalAmount } = this.taxCalculator.calculateTax(
            Number(caddyRate.amount),
            caddyRate.taxType as TaxType,
            Number(caddyRate.taxRate),
          );

          lineItemsToCreate.push({
            teeTimePlayerId: playerId,
            type: 'CADDY',
            description: `Caddy (${caddyRequest.toLowerCase().replace('_', ' ')})`,
            baseAmount: Number(caddyRate.amount),
            taxType: caddyRate.taxType,
            taxRate: Number(caddyRate.taxRate),
            taxAmount,
            totalAmount,
            isPaid: false,
          });
        }
      }

      // Create all line items
      if (lineItemsToCreate.length > 0) {
        await this.prisma.bookingLineItem.createMany({
          data: lineItemsToCreate,
        });
        this.logger.log(`Created ${lineItemsToCreate.length} line items for player ${playerId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to generate line items for player ${playerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Generate line items for all players in a flight
   */
  async generateLineItemsForFlight(teeTimeId: string): Promise<void> {
    try {
      const teeTime = await this.prisma.teeTime.findUnique({
        where: { id: teeTimeId },
        include: {
          course: true,
          players: true,
        },
      });

      if (!teeTime) {
        this.logger.warn(`Tee time ${teeTimeId} not found`);
        return;
      }

      for (const player of teeTime.players) {
        await this.generateLineItemsForPlayer({
          playerId: player.id,
          courseId: teeTime.courseId,
          clubId: teeTime.clubId,
          playerType: player.playerType,
          holes: teeTime.holes,
          cartType: player.cartType || undefined,
          caddyRequest: player.caddyRequest || undefined,
          sharedWithPosition: player.sharedWithPosition || undefined,
          teeTime: teeTime.teeDate,
        });
      }

      this.logger.log(`Generated line items for all players in tee time ${teeTimeId}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate line items for flight ${teeTimeId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Recalculate line items (removes unpaid and regenerates)
   */
  async recalculateLineItems(playerId: string): Promise<void> {
    try {
      const player = await this.prisma.teeTimePlayer.findUnique({
        where: { id: playerId },
        include: {
          teeTime: { include: { course: true } },
          lineItems: true,
        },
      });

      if (!player) {
        this.logger.warn(`Player ${playerId} not found`);
        return;
      }

      // Delete only unpaid line items
      const unpaidIds = player.lineItems.filter((i) => !i.isPaid).map((i) => i.id);
      if (unpaidIds.length > 0) {
        await this.prisma.bookingLineItem.deleteMany({
          where: { id: { in: unpaidIds } },
        });
        this.logger.log(`Deleted ${unpaidIds.length} unpaid line items for player ${playerId}`);
      }

      // Regenerate
      await this.generateLineItemsForPlayer({
        playerId: player.id,
        courseId: player.teeTime.courseId,
        clubId: player.teeTime.clubId,
        playerType: player.playerType,
        holes: player.teeTime.holes,
        cartType: player.cartType || undefined,
        caddyRequest: player.caddyRequest || undefined,
        sharedWithPosition: player.sharedWithPosition || undefined,
        teeTime: player.teeTime.teeDate,
      });

      this.logger.log(`Recalculated line items for player ${playerId}`);
    } catch (error) {
      this.logger.error(
        `Failed to recalculate line items for player ${playerId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
