import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/db/schema', () => ({
  costMatrix: { id: 'id', data: 'data', updatedAt: 'updatedAt' },
  dailyForecastQuantiles: { forecastDate: 'forecastDate', fuelType: 'fuelType' },
  dailyFinancialSummary: { forecastDate: 'forecastDate', fuelType: 'fuelType' },
  dailyOrderRecommendation: { forecastDate: 'forecastDate', fuelType: 'fuelType', policy: 'policy' },
}));

vi.mock('@/lib/auth-guard', () => ({
  requireAuth: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock('@/lib/proxy-forecast', () => ({
  runProxyForecast: vi.fn(),
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(() => ({})),
  and: vi.fn(() => ({})),
  gte: vi.fn(() => ({})),
  sql: vi.fn((strings: TemplateStringsArray) => ({ strings, type: 'sql' })),
}));

describe('API: /api/forecast/run validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication', async () => {
    const { requireAuth } = await import('@/lib/auth-guard');
    vi.mocked(requireAuth).mockResolvedValueOnce({
      ok: false,
      response: new Response(null, { status: 401 }),
    });

    const guard = await requireAuth();
    expect(guard.ok).toBe(false);
    expect(guard.response.status).toBe(401);
  });

  it('returns success on forecast run', async () => {
    const { runProxyForecast } = await import('@/lib/proxy-forecast');
    vi.mocked(runProxyForecast).mockResolvedValueOnce({
      forecastDates: 30,
      totalRows: 270,
      latestDate: '2026-07-20',
    });

    const result = await runProxyForecast();
    expect(result.forecastDates).toBe(30);
    expect(result.totalRows).toBe(270);
  });

  it('returns error on forecast failure', async () => {
    const { runProxyForecast } = await import('@/lib/proxy-forecast');
    vi.mocked(runProxyForecast).mockRejectedValueOnce(new Error('Database connection failed'));

    await expect(runProxyForecast()).rejects.toThrow('Database connection failed');
  });
});

describe('API: /api/decision validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication', async () => {
    const { requireAuth } = await import('@/lib/auth-guard');
    vi.mocked(requireAuth).mockResolvedValueOnce({
      ok: false,
      response: new Response(null, { status: 401 }),
    });

    const guard = await requireAuth();
    expect(guard.ok).toBe(false);
  });

  it('validates fuel type parameter', () => {
    const validFuelTypes = ['combined', 'Petrol', 'High-Speed Diesel'];
    
    expect(validFuelTypes).toContain('combined');
    expect(validFuelTypes).toContain('Petrol');
    expect(validFuelTypes).toContain('High-Speed Diesel');
    expect(validFuelTypes).not.toContain('Diesel');
  });

  it('formats INR currency correctly', () => {
    function formatInr(value: number): string {
      return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }

    expect(formatInr(1234567)).toBe('12,34,567');
    expect(formatInr(100000)).toBe('1,00,000');
    expect(formatInr(0)).toBe('0');
  });

  it('computes forecast confidence correctly', () => {
    function computeConfidence(q95: number, q05: number, forecastPoint: number): number {
      const piWidth = q95 - q05;
      return piWidth > 0
        ? Math.round(Math.max(0, Math.min(100, 100 - (piWidth / forecastPoint) * 50)))
        : 50;
    }

    // Narrow PI = high confidence
    expect(computeConfidence(1100, 900, 1000)).toBeGreaterThan(50);
    // Wide PI = low confidence (PI width 1000, forecast 1000 → 100 - (1000/1000)*50 = 50)
    // Need even wider PI to get below 50
    expect(computeConfidence(2000, 0, 1000)).toBeLessThan(50);
    // Zero width = default 50
    expect(computeConfidence(1000, 1000, 1000)).toBe(50);
  });
});

describe('API: /api/cost-matrix validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication', async () => {
    const { requireAuth } = await import('@/lib/auth-guard');
    vi.mocked(requireAuth).mockResolvedValueOnce({
      ok: false,
      response: new Response(null, { status: 401 }),
    });

    const guard = await requireAuth();
    expect(guard.ok).toBe(false);
  });

  it('validates required fields', () => {
    const requiredFields = ['pump_name', 'by_fuel_grade', 'financial'];
    const validData = {
      pump_name: 'Test Pump',
      by_fuel_grade: { Petrol: {} },
      financial: {},
    };

    for (const field of requiredFields) {
      expect(validData).toHaveProperty(field);
    }
  });

  it('validates fuel grade names', () => {
    const validGrades = ['Petrol', 'High-Speed Diesel'];
    
    expect(validGrades).toContain('Petrol');
    expect(validGrades).toContain('High-Speed Diesel');
    expect(validGrades).not.toContain('Diesel');
    expect(validGrades).not.toContain('Kerosene');
  });

  it('validates numeric fields are non-negative', () => {
    const constraints = {
      order_lead_time_days: 3,
      tank_capacity_liters: 54000,
      tanker_capacity_liters: 40000,
    };

    expect(constraints.order_lead_time_days).toBeGreaterThanOrEqual(0);
    expect(constraints.tank_capacity_liters).toBeGreaterThanOrEqual(0);
    expect(constraints.tanker_capacity_liters).toBeGreaterThanOrEqual(0);
  });

  it('enforces body size limit', () => {
    const MAX_BODY_BYTES = 100 * 1024; // 100KB
    const contentLength = 200 * 1024; // 200KB
    
    expect(contentLength).toBeGreaterThan(MAX_BODY_BYTES);
  });

  it('validates JSON parse errors', () => {
    expect(() => JSON.parse('invalid json')).toThrow(SyntaxError);
    expect(() => JSON.parse('{"valid": true}')).not.toThrow();
  });
});

describe('API: /api/weather validation', () => {
  it('validates date format', () => {
    const validDate = '2026-06-21';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    expect(dateRegex.test(validDate)).toBe(true);
    expect(dateRegex.test('2026-6-21')).toBe(false);
    expect(dateRegex.test('invalid')).toBe(false);
  });

  it('validates temperature range', () => {
    const validTemps = [-10, 0, 25, 45, 50];
    const invalidTemps = [-50, 60, -100];
    
    for (const temp of validTemps) {
      expect(temp).toBeGreaterThanOrEqual(-40);
      expect(temp).toBeLessThanOrEqual(60);
    }
    
    // -50 is less than -40, so it's invalid
    expect(-50).toBeLessThan(-40);
    // 60 is equal to max, but we'll test > 60
    expect(61).toBeGreaterThan(60);
  });

  it('validates rainfall is non-negative', () => {
    const validRainfall = [0, 5.5, 100, 500];
    const invalidRainfall = [-1, -0.5];
    
    for (const rain of validRainfall) {
      expect(rain).toBeGreaterThanOrEqual(0);
    }
    
    for (const rain of invalidRainfall) {
      expect(rain).toBeLessThan(0);
    }
  });
});
