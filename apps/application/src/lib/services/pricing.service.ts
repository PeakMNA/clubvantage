/**
 * PricingService
 *
 * Handles price calculation for bookings, including:
 * - Base service/facility pricing
 * - Member tier discounts
 * - Service variations and add-ons
 * - Promotional discounts
 */

// ============================================================================
// TYPES
// ============================================================================

export type VariationPriceType = 'FIXED_ADD' | 'PERCENTAGE_ADD' | 'REPLACEMENT';

export interface ServiceVariation {
  id: string;
  name: string;
  priceType: VariationPriceType;
  priceValue: number;
  isActive: boolean;
}

export interface TierDiscount {
  tierName: string;
  discountPercent: number;
}

export interface PriceBreakdown {
  basePrice: number;
  variations: Array<{
    id: string;
    name: string;
    amount: number;
  }>;
  variationsTotal: number;
  subtotal: number;
  tierDiscount: number;
  tierDiscountPercent: number;
  tierName?: string;
  promotionalDiscount: number;
  promotionCode?: string;
  total: number;
  currency: string;
}

export interface PricingInput {
  basePrice: number;
  selectedVariationIds?: string[];
  availableVariations?: ServiceVariation[];
  memberTier?: string;
  tierDiscounts?: Record<string, number>; // { "Gold": 10, "Platinum": 20 }
  promotionCode?: string;
  currency?: string;
}

export interface PromotionValidation {
  valid: boolean;
  discountPercent?: number;
  discountAmount?: number;
  message?: string;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class PricingService {
  private defaultCurrency = 'THB';

  /**
   * Calculate full price breakdown for a booking
   */
  calculatePrice(input: PricingInput): PriceBreakdown {
    const {
      basePrice,
      selectedVariationIds = [],
      availableVariations = [],
      memberTier,
      tierDiscounts = {},
      promotionCode,
      currency = this.defaultCurrency,
    } = input;

    // Calculate variations
    const variationsResult = this.calculateVariations(
      basePrice,
      selectedVariationIds,
      availableVariations
    );

    // Calculate subtotal (base + variations adjustments)
    const subtotal = variationsResult.adjustedBasePrice + variationsResult.additionalAmount;

    // Calculate tier discount
    const tierDiscountPercent = memberTier ? (tierDiscounts[memberTier] ?? 0) : 0;
    const tierDiscount = subtotal * (tierDiscountPercent / 100);

    // Calculate promotional discount
    const promo = this.validatePromotion(promotionCode, subtotal - tierDiscount);
    const promotionalDiscount = promo.valid ? (promo.discountAmount ?? 0) : 0;

    // Calculate total
    const total = subtotal - tierDiscount - promotionalDiscount;

    return {
      basePrice,
      variations: variationsResult.variations,
      variationsTotal: variationsResult.additionalAmount,
      subtotal,
      tierDiscount,
      tierDiscountPercent,
      tierName: memberTier,
      promotionalDiscount,
      promotionCode: promo.valid ? promotionCode : undefined,
      total: Math.max(0, total), // Ensure non-negative
      currency,
    };
  }

  /**
   * Calculate variation adjustments
   */
  private calculateVariations(
    basePrice: number,
    selectedVariationIds: string[],
    availableVariations: ServiceVariation[]
  ): {
    variations: Array<{ id: string; name: string; amount: number }>;
    adjustedBasePrice: number;
    additionalAmount: number;
  } {
    const variations: Array<{ id: string; name: string; amount: number }> = [];
    let adjustedBasePrice = basePrice;
    let additionalAmount = 0;

    for (const variationId of selectedVariationIds) {
      const variation = availableVariations.find((v) => v.id === variationId);
      if (!variation || !variation.isActive) {
        continue;
      }

      let amount = 0;

      switch (variation.priceType) {
        case 'FIXED_ADD':
          amount = variation.priceValue;
          additionalAmount += amount;
          break;

        case 'PERCENTAGE_ADD':
          amount = basePrice * (variation.priceValue / 100);
          additionalAmount += amount;
          break;

        case 'REPLACEMENT':
          // Replace base price entirely
          const difference = variation.priceValue - adjustedBasePrice;
          adjustedBasePrice = variation.priceValue;
          amount = difference;
          break;
      }

      variations.push({
        id: variation.id,
        name: variation.name,
        amount,
      });
    }

    return {
      variations,
      adjustedBasePrice,
      additionalAmount,
    };
  }

  /**
   * Validate a promotion code
   */
  validatePromotion(
    code: string | undefined,
    subtotal: number
  ): PromotionValidation {
    if (!code) {
      return { valid: false };
    }

    // Mock promotion validation - in production, this would query the database
    const mockPromotions: Record<string, { discountPercent: number; minAmount?: number }> = {
      WELCOME10: { discountPercent: 10 },
      VIP20: { discountPercent: 20, minAmount: 1000 },
      SUMMER15: { discountPercent: 15 },
    };

    const promo = mockPromotions[code.toUpperCase()];
    if (!promo) {
      return { valid: false, message: 'Invalid promotion code' };
    }

    if (promo.minAmount && subtotal < promo.minAmount) {
      return {
        valid: false,
        message: `Minimum order of ${this.formatCurrency(promo.minAmount)} required`,
      };
    }

    const discountAmount = subtotal * (promo.discountPercent / 100);

    return {
      valid: true,
      discountPercent: promo.discountPercent,
      discountAmount,
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = this.defaultCurrency): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get tier discounts for a membership type
   */
  getTierDiscounts(): Record<string, number> {
    // Mock tier discounts - in production, this would come from the database
    return {
      Standard: 0,
      Silver: 5,
      Gold: 10,
      Platinum: 15,
      Diamond: 20,
    };
  }

  /**
   * Calculate refund amount based on cancellation policy
   */
  calculateRefund(
    originalAmount: number,
    bookingStartTime: Date,
    cancellationTime: Date = new Date()
  ): { refundAmount: number; refundPercent: number; policyApplied: string } {
    const hoursUntilBooking =
      (bookingStartTime.getTime() - cancellationTime.getTime()) / (1000 * 60 * 60);

    // Standard cancellation policy
    if (hoursUntilBooking >= 48) {
      return {
        refundAmount: originalAmount,
        refundPercent: 100,
        policyApplied: 'Full refund (48+ hours notice)',
      };
    } else if (hoursUntilBooking >= 24) {
      const refund = originalAmount * 0.75;
      return {
        refundAmount: refund,
        refundPercent: 75,
        policyApplied: '75% refund (24-48 hours notice)',
      };
    } else if (hoursUntilBooking >= 4) {
      const refund = originalAmount * 0.5;
      return {
        refundAmount: refund,
        refundPercent: 50,
        policyApplied: '50% refund (4-24 hours notice)',
      };
    } else {
      return {
        refundAmount: 0,
        refundPercent: 0,
        policyApplied: 'No refund (less than 4 hours notice)',
      };
    }
  }
}

// Export singleton instance
export const pricingService = new PricingService();
