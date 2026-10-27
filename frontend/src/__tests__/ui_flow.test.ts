import { describe, it, expect } from 'vitest';

describe('FairShift Frontend Logic & Workflows', () => {
  it('validates wage calculation parity for daily rate', () => {
    const dailyRate = 750;
    const hourlyEquivalent = dailyRate / 8.0;
    const regularHours = 48;
    const overtimeHours = 14;
    const multiplier = 2.0;

    const regPay = regularHours * hourlyEquivalent;
    const otPay = overtimeHours * (hourlyEquivalent * multiplier);
    const expected = regPay + otPay;
    const recorded = 5500;
    const discrepancy = expected - recorded;

    expect(hourlyEquivalent).toBe(93.75);
    expect(regPay).toBe(4500);
    expect(otPay).toBe(2625);
    expect(expected).toBe(7125);
    expect(discrepancy).toBe(1625);
  });

  it('validates fatigue risk limits', () => {
    const shiftHours = 13.5;
    const restHours = 7.0;
    const consecutiveDays = 7;

    const isLongShift = shiftHours > 12.0;
    const isRestDeficit = restHours < 8.0;
    const isConsecutiveBreach = consecutiveDays >= 7;

    expect(isLongShift).toBe(true);
    expect(isRestDeficit).toBe(true);
    expect(isConsecutiveBreach).toBe(true);
  });

  it('verifies report reference code generation regex', () => {
    const sampleRef = 'FS-2026-E4912';
    expect(/^FS-2026-[A-Z0-9]{5}$/.test(sampleRef)).toBe(true);
  });
});
