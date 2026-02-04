import { Injectable } from '@nestjs/common';

/**
 * Tax calculation types
 */
export type TaxType = 'ADD' | 'INCLUDE' | 'NONE';

/**
 * Line item types for tax override lookup
 */
export type LineItemType = 'GREEN_FEE' | 'CART' | 'CADDY' | 'RENTAL' | 'PROSHOP';

/**
 * Tax configuration structure
 */
export interface TaxConfig {
  defaultRate: number;
  defaultType: TaxType;
  overrides: Array<{
    itemType: LineItemType;
    rate: number;
    taxType: TaxType;
  }>;
}

/**
 * Result of tax calculation
 */
export interface TaxCalculationResult {
  /** Amount before tax (for INCLUDE, this is extracted) */
  netAmount: number;
  /** Tax amount */
  taxAmount: number;
  /** Final amount (base + tax for ADD, same as base for INCLUDE) */
  totalAmount: number;
}

/**
 * Service for calculating taxes on line items
 *
 * Supports three tax types:
 * - ADD: Tax is added on top of the base price
 * - INCLUDE: Tax is already included in the price (extract tax from total)
 * - NONE: No tax applied
 */
@Injectable()
export class TaxCalculatorService {
  /**
   * Calculate tax for a given amount
   *
   * @param baseAmount - The base amount (price before or including tax)
   * @param taxType - How tax should be calculated
   * @param taxRate - Tax rate as percentage (e.g., 7 for 7%)
   * @returns Calculated tax amounts
   *
   * @example
   * // ADD: $100 + 7% tax = $107
   * calculateTax(100, 'ADD', 7) // { netAmount: 100, taxAmount: 7, totalAmount: 107 }
   *
   * @example
   * // INCLUDE: $100 includes 7% tax, so net = $93.46, tax = $6.54
   * calculateTax(100, 'INCLUDE', 7) // { netAmount: 93.46, taxAmount: 6.54, totalAmount: 100 }
   *
   * @example
   * // NONE: No tax applied
   * calculateTax(100, 'NONE', 7) // { netAmount: 100, taxAmount: 0, totalAmount: 100 }
   */
  calculateTax(
    baseAmount: number,
    taxType: TaxType,
    taxRate: number,
  ): TaxCalculationResult {
    // Ensure we're working with valid numbers
    const amount = Number(baseAmount) || 0;
    const rate = Number(taxRate) || 0;

    switch (taxType) {
      case 'ADD': {
        // Tax is added on top of base price
        // Formula: taxAmount = baseAmount * (rate / 100)
        const taxAmount = this.round(amount * (rate / 100));
        return {
          netAmount: this.round(amount),
          taxAmount,
          totalAmount: this.round(amount + taxAmount),
        };
      }

      case 'INCLUDE': {
        // Tax is already included in the price
        // Formula: netAmount = totalAmount / (1 + rate/100)
        // taxAmount = totalAmount - netAmount
        if (rate <= 0) {
          return {
            netAmount: this.round(amount),
            taxAmount: 0,
            totalAmount: this.round(amount),
          };
        }
        const netAmount = this.round(amount / (1 + rate / 100));
        const taxAmount = this.round(amount - netAmount);
        return {
          netAmount,
          taxAmount,
          totalAmount: this.round(amount),
        };
      }

      case 'NONE':
      default: {
        // No tax applied
        return {
          netAmount: this.round(amount),
          taxAmount: 0,
          totalAmount: this.round(amount),
        };
      }
    }
  }

  /**
   * Get the appropriate tax configuration for a line item type
   *
   * @param itemType - Type of line item
   * @param taxConfig - Club's tax configuration
   * @returns Tax rate and type to use
   */
  getTaxConfigForItem(
    itemType: LineItemType,
    taxConfig: TaxConfig,
  ): { rate: number; type: TaxType } {
    // Check for item-specific override
    const override = taxConfig.overrides.find((o) => o.itemType === itemType);

    if (override) {
      return {
        rate: override.rate,
        type: override.taxType,
      };
    }

    // Use default configuration
    return {
      rate: taxConfig.defaultRate,
      type: taxConfig.defaultType,
    };
  }

  /**
   * Calculate tax for a line item using club configuration
   *
   * @param baseAmount - The base amount
   * @param itemType - Type of line item
   * @param taxConfig - Club's tax configuration
   * @returns Calculated tax amounts
   */
  calculateTaxForItem(
    baseAmount: number,
    itemType: LineItemType,
    taxConfig: TaxConfig,
  ): TaxCalculationResult {
    const { rate, type } = this.getTaxConfigForItem(itemType, taxConfig);
    return this.calculateTax(baseAmount, type, rate);
  }

  /**
   * Calculate total tax for multiple line items
   *
   * @param items - Array of items with amount and type
   * @param taxConfig - Club's tax configuration
   * @returns Combined totals
   */
  calculateTotalTax(
    items: Array<{ baseAmount: number; itemType: LineItemType }>,
    taxConfig: TaxConfig,
  ): { totalNet: number; totalTax: number; grandTotal: number } {
    let totalNet = 0;
    let totalTax = 0;
    let grandTotal = 0;

    for (const item of items) {
      const result = this.calculateTaxForItem(
        item.baseAmount,
        item.itemType,
        taxConfig,
      );
      totalNet += result.netAmount;
      totalTax += result.taxAmount;
      grandTotal += result.totalAmount;
    }

    return {
      totalNet: this.round(totalNet),
      totalTax: this.round(totalTax),
      grandTotal: this.round(grandTotal),
    };
  }

  /**
   * Round to 2 decimal places (standard currency precision)
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
