import { BookingPriceCalculator, PriceCalculationInput } from './booking-price.calculator';

describe('BookingPriceCalculator', () => {
  let calculator: BookingPriceCalculator;

  beforeEach(() => {
    calculator = new BookingPriceCalculator();
  });

  const baseInput: PriceCalculationInput = {
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-22'),
    adults: 2,
    children: 0,
    baseRateLowSeason: 750,
    baseRateHighSeason: 830,
    lowSeasonMonths: [1, 2, 3, 11, 12],
    hasLinens: false,
    linensPrice: 20,
    hasCleaning: false,
    cleaningPrice: 35,
    discount: 0,
    discountType: null,
    hasCancellationInsurance: false,
    insuranceRate: 6,
    touristTaxRate: 1,
  };

  it('calculates base price for 7 days in low season', () => {
    const result = calculator.calculate(baseInput);
    // (750 / 21) * 7 = 250
    expect(result.basePrice).toBe(250);
  });

  it('calculates base price for 7 days in high season', () => {
    const input = {
      ...baseInput,
      startDate: new Date('2025-07-15'),
      endDate: new Date('2025-07-22'),
    };
    const result = calculator.calculate(input);
    // (830 / 21) * 7 = 276.67
    expect(result.basePrice).toBeCloseTo(276.67, 2);
  });

  it('includes linens when selected', () => {
    const input = { ...baseInput, hasLinens: true };
    const result = calculator.calculate(input);
    expect(result.linensPrice).toBe(20);
  });

  it('includes cleaning when selected', () => {
    const input = { ...baseInput, hasCleaning: true };
    const result = calculator.calculate(input);
    expect(result.cleaningPrice).toBe(35);
  });

  it('applies fixed discount', () => {
    const input = { ...baseInput, discount: 50, discountType: 'amount' as const };
    const result = calculator.calculate(input);
    expect(result.discount).toBe(50);
    expect(result.totalPrice).toBeLessThan(250);
  });

  it('applies percentage discount', () => {
    const input = { ...baseInput, discount: 10, discountType: 'percent' as const };
    const result = calculator.calculate(input);
    // 10% of 250 = 25
    expect(result.discount).toBe(25);
  });

  it('calculates insurance as 6% of net base price', () => {
    const input = { ...baseInput, hasCancellationInsurance: true };
    const result = calculator.calculate(input);
    // 6% of 250 = 15
    expect(result.insuranceFee).toBe(15);
  });

  it('calculates tourist tax for adults and children', () => {
    const input = { ...baseInput, adults: 2, children: 1 };
    const result = calculator.calculate(input);
    // 3 persons * 7 nights * 1€ = 21
    expect(result.touristTax).toBe(21);
  });

  it('calculates complete price with all options', () => {
    const input: PriceCalculationInput = {
      ...baseInput,
      hasLinens: true,
      hasCleaning: true,
      discount: 10,
      discountType: 'percent',
      hasCancellationInsurance: true,
      adults: 2,
      children: 1,
    };
    const result = calculator.calculate(input);

    // Base: 250
    // Discount 10%: -25
    // Net base: 225
    // Linens: +20
    // Cleaning: +35
    // Insurance 6% of 225: +13.5
    // Tax (3*7*1): +21
    // Total: 314.5
    expect(result.totalPrice).toBeCloseTo(314.5, 2);
  });

  it('handles zero discount gracefully', () => {
    const input = { ...baseInput, discount: 0 };
    const result = calculator.calculate(input);
    expect(result.discount).toBe(0);
  });

  it('handles negative discount as zero', () => {
    const input = { ...baseInput, discount: -10 };
    const result = calculator.calculate(input);
    expect(result.discount).toBe(0);
  });
});
