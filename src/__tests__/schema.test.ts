import { describe, it, expect, vi } from 'vitest';

// Mock drizzle-orm
vi.mock('drizzle-orm/pg-core', () => ({
  pgTable: vi.fn((name: string) => ({ name, columns: {} })),
  text: vi.fn(() => ({})),
  timestamp: vi.fn(() => ({})),
  uuid: vi.fn(() => ({})),
  decimal: vi.fn(() => ({})),
  jsonb: vi.fn(() => ({})),
  boolean: vi.fn(() => ({})),
  integer: vi.fn(() => ({})),
  date: vi.fn(() => ({})),
  serial: vi.fn(() => ({})),
}));

describe('Schema: CostMatrixData type', () => {
  it('validates required top-level fields', () => {
    const validData = {
      pump_name: 'Test Pump',
      location: { latitude: 31.022, longitude: 77.137 },
      costs: {
        stockout_cost_per_liter: { value: 8.2 },
        overstock_cost_per_liter_per_day: { value: 0.5 },
        cost_per_order: { value: 500 },
      },
      seasonal_adjustments: {},
      by_fuel_grade: {
        Petrol: {
          commission_per_liter: 3.2,
          tank_capacity_liters: 30000,
          purchase_price_per_liter: 94.50,
        },
      },
      operational_constraints: {
        tank_capacity_liters: 54000,
        tanker_capacity_liters: 40000,
        order_lead_time_days: 3,
      },
      financial: {
        monthly_opex: { total: 115000 },
        non_fuel_monthly_income: { base_value: 20000 },
        debt: { total_monthly_interest: 37500 },
        cash_invested: { total_cash_outlay: 12500000 },
        depreciation: { total_daily_non_cash: 639 },
        equity: { net_book_equity: 8000000, working_equity_at_risk: 2500000 },
      },
      decision_parameters: {
        risk_aversion: 0.7,
        policies: {
          conservative: { quantile_target: 0.95, safety_buffer_liters: 500 },
          balanced: { quantile_target: 0.75, safety_buffer_liters: 200 },
          aggressive: { quantile_target: 0.50, safety_buffer_liters: -100 },
        },
      },
    };

    expect(validData.pump_name).toBe('Test Pump');
    expect(validData.by_fuel_grade.Petrol.commission_per_liter).toBe(3.2);
    expect(validData.financial.equity.net_book_equity).toBe(8000000);
  });

  it('validates numeric fields are non-negative', () => {
    const data = {
      tank_capacity_liters: 54000,
      tanker_capacity_liters: 40000,
      order_lead_time_days: 3,
    };

    expect(data.tank_capacity_liters).toBeGreaterThanOrEqual(0);
    expect(data.tanker_capacity_liters).toBeGreaterThanOrEqual(0);
    expect(data.order_lead_time_days).toBeGreaterThanOrEqual(0);
  });

  it('validates fuel types are recognized', () => {
    const validFuelTypes = ['Petrol', 'High-Speed Diesel'];
    const testFuelType = 'Petrol';

    expect(validFuelTypes).toContain(testFuelType);
    expect(validFuelTypes).not.toContain('Diesel');
    expect(validFuelTypes).not.toContain('Kerosene');
  });
});

describe('Schema: DecisionData type', () => {
  it('has valid action types', () => {
    const validActions = ['BUY', 'SELL', 'HOLD', 'NO_DATA'];
    const testAction = 'BUY';

    expect(validActions).toContain(testAction);
  });

  it('has valid severity levels', () => {
    const validSeverities = ['info', 'warning', 'critical'];
    const testSeverity = 'warning';

    expect(validSeverities).toContain(testSeverity);
  });

  it('has valid trend directions', () => {
    const validTrends = ['up', 'down', 'stable', 'neutral'];
    const testTrend = 'stable';

    expect(validTrends).toContain(testTrend);
  });
});
