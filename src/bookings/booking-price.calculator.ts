import { Injectable } from '@nestjs/common';

export interface PriceCalculationInput {
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  baseRateLowSeason: number;
  baseRateHighSeason: number;
  lowSeasonMonths: number[];
  hasLinens: boolean;
  linensPrice: number;
  hasCleaning: boolean;
  cleaningPrice: number;
  discount: number;
  discountType: 'amount' | 'percent' | null;
  hasCancellationInsurance: boolean;
  insuranceRate: number;
  touristTaxRate: number;
}

export interface PriceBreakdown {
  basePrice: number;
  linensPrice: number;
  cleaningPrice: number;
  discount: number;
  insuranceFee: number;
  touristTax: number;
  totalPrice: number;
}

@Injectable()
export class BookingPriceCalculator {
  /**
   * Calculate the number of nights between two dates
   */
  private calculateNights(startDate: Date, endDate: Date): number {
    const ms = endDate.getTime() - startDate.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  /**
   * Determine if a month is low season
   */
  private isLowSeason(month: number, lowSeasonMonths: number[]): boolean {
    return lowSeasonMonths.includes(month);
  }

  /**
   * Calculate base price based on duration and season
   */
  private calculateBasePrice(
    startDate: Date,
    endDate: Date,
    baseRateLowSeason: number,
    baseRateHighSeason: number,
    lowSeasonMonths: number[],
  ): number {
    const nights = this.calculateNights(startDate, endDate);
    const startMonth = startDate.getMonth() + 1; // getMonth() returns 0-11

    const isLow = this.isLowSeason(startMonth, lowSeasonMonths);
    const rate = isLow ? baseRateLowSeason : baseRateHighSeason;

    // Prorated: (rate for 21 days / 21) * actual nights
    return (rate / 21) * nights;
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(
    basePrice: number,
    discount: number,
    discountType: 'amount' | 'percent' | null,
  ): number {
    if (!discount || discount <= 0) return 0;

    if (discountType === 'percent') {
      return (basePrice * discount) / 100;
    }

    return discount;
  }

  /**
   * Calculate tourist tax
   */
  private calculateTouristTax(
    adults: number,
    children: number,
    nights: number,
    touristTaxRate: number,
  ): number {
    const totalPersons = adults + children;
    return totalPersons * nights * touristTaxRate;
  }

  /**
   * Main calculation method
   */
  calculate(input: PriceCalculationInput): PriceBreakdown {
    // 1. Base price
    const basePrice = this.calculateBasePrice(
      input.startDate,
      input.endDate,
      input.baseRateLowSeason,
      input.baseRateHighSeason,
      input.lowSeasonMonths,
    );

    // 2. Apply discount on base price
    const discountAmount = this.calculateDiscount(basePrice, input.discount, input.discountType);
    const basePriceNet = basePrice - discountAmount;

    // 3. Add options
    const linensPrice = input.hasLinens ? input.linensPrice : 0;
    const cleaningPrice = input.hasCleaning ? input.cleaningPrice : 0;

    // 4. Calculate insurance (% of net base price)
    const insuranceFee = input.hasCancellationInsurance
      ? (basePriceNet * input.insuranceRate) / 100
      : 0;

    // 5. Calculate tourist tax
    const nights = this.calculateNights(input.startDate, input.endDate);
    const touristTax = this.calculateTouristTax(
      input.adults,
      input.children,
      nights,
      input.touristTaxRate,
    );

    // 6. Total
    const totalPrice = basePriceNet + linensPrice + cleaningPrice + insuranceFee + touristTax;

    return {
      basePrice: Math.round(basePrice * 100) / 100,
      linensPrice: Math.round(linensPrice * 100) / 100,
      cleaningPrice: Math.round(cleaningPrice * 100) / 100,
      discount: Math.round(discountAmount * 100) / 100,
      insuranceFee: Math.round(insuranceFee * 100) / 100,
      touristTax: Math.round(touristTax * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  }
}
