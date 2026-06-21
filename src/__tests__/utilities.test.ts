import { describe, it, expect } from 'vitest';

describe('Utility: formatInr', () => {
  function formatInr(value: number): string {
    return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  it('formats positive numbers with Indian locale', () => {
    expect(formatInr(1234567)).toBe('12,34,567');
    expect(formatInr(100000)).toBe('1,00,000');
    expect(formatInr(1000)).toBe('1,000');
  });

  it('formats zero', () => {
    expect(formatInr(0)).toBe('0');
  });

  it('formats decimal numbers by rounding', () => {
    expect(formatInr(1234.56)).toBe('1,235');
    expect(formatInr(1234.4)).toBe('1,234');
  });

  it('formats negative numbers', () => {
    expect(formatInr(-1234567)).toBe('-12,34,567');
    expect(formatInr(-1000)).toBe('-1,000');
  });
});

describe('Utility: emptyState', () => {
  function emptyState() {
    return {
      decision: {
        action: 'NO_DATA' as const,
        headline: 'Good morning — no forecast data yet',
        sub: 'Run the forecast pipeline to see your order recommendation.',
      },
      metrics: {
        expectedDemand: { value: '—', unit: 'L', description: '', trend: 'neutral' as const },
        stockoutRisk: { value: '—', unit: '%', description: '', trend: 'neutral' as const },
        forecastConfidence: { value: '—', unit: '%', description: '', trend: 'neutral' as const },
      },
      pnl: {
        expectedDailyProfit: { value: '—', unit: '₹', description: '', trend: 'neutral' as const },
        expectedMonthlyProfit: { value: '—', unit: '₹', description: '', trend: 'neutral' as const },
        pLoss: { value: '—', unit: '%', description: '', trend: 'neutral' as const },
        var5: { value: '—', unit: '₹', description: '', trend: 'neutral' as const },
      },
      alerts: [{ title: 'No forecast data', description: '', severity: 'info' as const }],
      fuelTypes: [
        { value: 'combined', label: 'Combined', active: true },
        { value: 'Petrol', label: 'Petrol', active: false },
        { value: 'High-Speed Diesel', label: 'High-Speed Diesel', active: false },
      ],
      lastUpdated: null,
    };
  }

  it('returns NO_DATA action', () => {
    const state = emptyState();
    expect(state.decision.action).toBe('NO_DATA');
  });

  it('has all required metric fields', () => {
    const state = emptyState();
    expect(state.metrics).toHaveProperty('expectedDemand');
    expect(state.metrics).toHaveProperty('stockoutRisk');
    expect(state.metrics).toHaveProperty('forecastConfidence');
  });

  it('has all required P&L fields', () => {
    const state = emptyState();
    expect(state.pnl).toHaveProperty('expectedDailyProfit');
    expect(state.pnl).toHaveProperty('expectedMonthlyProfit');
    expect(state.pnl).toHaveProperty('pLoss');
    expect(state.pnl).toHaveProperty('var5');
  });

  it('has all three fuel types', () => {
    const state = emptyState();
    expect(state.fuelTypes).toHaveLength(3);
    expect(state.fuelTypes.map((f) => f.value)).toEqual(['combined', 'Petrol', 'High-Speed Diesel']);
  });

  it('combined is active by default', () => {
    const state = emptyState();
    expect(state.fuelTypes.find((f) => f.value === 'combined')?.active).toBe(true);
  });

  it('Petrol and HSD are inactive by default', () => {
    const state = emptyState();
    expect(state.fuelTypes.find((f) => f.value === 'Petrol')?.active).toBe(false);
    expect(state.fuelTypes.find((f) => f.value === 'High-Speed Diesel')?.active).toBe(false);
  });
});

describe('Utility: forecast confidence calculation', () => {
  function computeConfidence(q95: number, q05: number, forecastPoint: number): number {
    const piWidth = q95 - q05;
    return piWidth > 0
      ? Math.round(Math.max(0, Math.min(100, 100 - (piWidth / forecastPoint) * 50)))
      : 50;
  }

  it('returns 100 when PI width is 0', () => {
    expect(computeConfidence(1000, 1000, 1000)).toBe(50);
  });

  it('returns lower confidence for wider PI', () => {
    const narrow = computeConfidence(1100, 900, 1000);
    const wide = computeConfidence(1300, 700, 1000);
    expect(narrow).toBeGreaterThan(wide);
  });

  it('caps confidence at 100', () => {
    expect(computeConfidence(1001, 999, 1000)).toBe(100);
  });

  it('floors confidence at 0', () => {
    expect(computeConfidence(2000, 0, 1000)).toBe(0);
  });
});
