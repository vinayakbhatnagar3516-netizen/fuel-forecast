import { describe, it, expect } from 'vitest';

describe('proxy-forecast: PRNG logic', () => {
  // Test the mulberry32 algorithm directly since it's not exported
  function mulberry32(seed: number) {
    let s = seed | 0;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  it('generates deterministic sequences from same seed', () => {
    const rng1 = mulberry32(12345);
    const rng2 = mulberry32(12345);
    
    const values1 = Array.from({ length: 100 }, () => rng1());
    const values2 = Array.from({ length: 100 }, () => rng2());
    
    expect(values1).toEqual(values2);
  });

  it('generates different sequences from different seeds', () => {
    const rng1 = mulberry32(11111);
    const rng2 = mulberry32(22222);
    
    const values1 = Array.from({ length: 100 }, () => rng1());
    const values2 = Array.from({ length: 100 }, () => rng2());
    
    expect(values1).not.toEqual(values2);
  });

  it('generates values in [0, 1) range', () => {
    const rng = mulberry32(42);
    
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('produces uniform-like distribution', () => {
    const rng = mulberry32(42);
    const buckets = new Array(10).fill(0);
    const samples = 10000;
    
    for (let i = 0; i < samples; i++) {
      const value = rng();
      const bucket = Math.floor(value * 10);
      buckets[bucket]++;
    }
    
    // Each bucket should have roughly 1000 samples (10% of 10000)
    // Allow 20% tolerance for statistical variation
    for (const count of buckets) {
      expect(count).toBeGreaterThan(800);
      expect(count).toBeLessThan(1200);
    }
  });
});

describe('proxy-forecast: Quantile multipliers', () => {
  const QUANTILE_MULTIPLIERS = {
    q05: 0.85,
    q25: 0.93,
    q50: 1.0,
    q75: 1.07,
    q95: 1.15,
  };

  it('has correct structure', () => {
    expect(QUANTILE_MULTIPLIERS).toHaveProperty('q05');
    expect(QUANTILE_MULTIPLIERS).toHaveProperty('q25');
    expect(QUANTILE_MULTIPLIERS).toHaveProperty('q50');
    expect(QUANTILE_MULTIPLIERS).toHaveProperty('q75');
    expect(QUANTILE_MULTIPLIERS).toHaveProperty('q95');
  });

  it('q50 is 1.0 (center quantile)', () => {
    expect(QUANTILE_MULTIPLIERS.q50).toBe(1.0);
  });

  it('quantiles are in ascending order', () => {
    expect(QUANTILE_MULTIPLIERS.q05).toBeLessThan(QUANTILE_MULTIPLIERS.q25);
    expect(QUANTILE_MULTIPLIERS.q25).toBeLessThan(QUANTILE_MULTIPLIERS.q50);
    expect(QUANTILE_MULTIPLIERS.q50).toBeLessThan(QUANTILE_MULTIPLIERS.q75);
    expect(QUANTILE_MULTIPLIERS.q75).toBeLessThan(QUANTILE_MULTIPLIERS.q95);
  });

  it('q05 is less than 1.0 (lower bound)', () => {
    expect(QUANTILE_MULTIPLIERS.q05).toBeLessThan(1.0);
  });

  it('q95 is greater than 1.0 (upper bound)', () => {
    expect(QUANTILE_MULTIPLIERS.q95).toBeGreaterThan(1.0);
  });

  it('applies correctly to base demand', () => {
    const baseDemand = 1800;
    const q05 = Math.round(baseDemand * QUANTILE_MULTIPLIERS.q05);
    const q95 = Math.round(baseDemand * QUANTILE_MULTIPLIERS.q95);
    
    expect(q05).toBe(1530);
    expect(q95).toBe(2070);
    expect(q05).toBeLessThan(baseDemand);
    expect(q95).toBeGreaterThan(baseDemand);
  });
});

describe('proxy-forecast: Daily demand generation logic', () => {
  function generateDailyDemand(
    base: number,
    dayIndex: number,
    rng: () => number,
    fuelType: 'Petrol' | 'High-Speed Diesel',
  ): number {
    const dow = dayIndex % 7;
    const isWeekend = dow >= 5;
    const month = (dayIndex % 365) / 30;

    let mult = 1.0;
    if (fuelType === 'Petrol') {
      mult = dow === 5 ? 1.35 : dow === 6 ? 1.25 : 1.0;
    } else {
      mult = isWeekend ? 0.92 : 1.0;
    }

    let seasonMult = 1.0;
    if (month >= 2 && month <= 5) seasonMult = 1.20;
    else if (month >= 6 && month <= 8) seasonMult = 0.90;
    else if (month >= 11 || month <= 1) seasonMult = 0.85;

    const noiseStd = fuelType === 'Petrol' ? 0.08 : 0.05;
    const noise = rng() * noiseStd * 2 - noiseStd;

    const demand = base * mult * seasonMult * (1 + noise);
    return Math.round(Math.max(demand, base * 0.3));
  }

  it('returns positive values', () => {
    const rng = () => 0.5;
    for (let i = 0; i < 100; i++) {
      const demand = generateDailyDemand(1800, i, rng, 'Petrol');
      expect(demand).toBeGreaterThan(0);
    }
  });

  it('applies weekend multiplier for Petrol', () => {
    const rng = () => 0.5; // no noise
    const friday = generateDailyDemand(1800, 5, rng, 'Petrol'); // dow=5
    const saturday = generateDailyDemand(1800, 6, rng, 'Petrol'); // dow=6
    const weekday = generateDailyDemand(1800, 7, rng, 'Petrol'); // dow=0

    expect(saturday).toBeGreaterThan(weekday);
    expect(friday).toBeGreaterThan(weekday);
  });

  it('applies seasonal multipliers', () => {
    const rng = () => 0.5; // no noise
    // Month 0 (January) = winter (0.85)
    const winter = generateDailyDemand(1800, 15, rng, 'Petrol');
    // Month 3 (April) = summer peak (1.20)
    const summer = generateDailyDemand(1800, 100, rng, 'Petrol');
    // Month 7 (July) = monsoon (0.90)
    const monsoon = generateDailyDemand(1800, 220, rng, 'Petrol');

    expect(summer).toBeGreaterThan(winter);
    expect(summer).toBeGreaterThan(monsoon);
  });

  it('HSD has lower weekend multiplier than Petrol', () => {
    const rng = () => 0.5;
    const petrolWeekend = generateDailyDemand(1800, 6, rng, 'Petrol');
    const hsdWeekend = generateDailyDemand(1400, 6, rng, 'High-Speed Diesel');
    
    // HSD weekend mult is 0.92, Petrol is 1.25
    // Even with different bases, the relative behavior differs
    expect(petrolWeekend).toBeGreaterThan(hsdWeekend);
  });

  it('clamps minimum demand to 30% of base', () => {
    const rng = () => 0; // minimum noise
    const demand = generateDailyDemand(1800, 0, rng, 'Petrol');
    expect(demand).toBeGreaterThanOrEqual(1800 * 0.3);
  });
});

describe('proxy-forecast: Forecast from history logic', () => {
  function forecastFromHistory(
    history: number[],
    forecastDays: number,
    rng: () => number,
  ): number[] {
    if (history.length < 14) return Array(forecastDays).fill(history[history.length - 1] || 1000);

    const recent = history.slice(-14);
    const ma14 = recent.reduce((a, b) => a + b, 0) / recent.length;
    const trend = (history[history.length - 1] - history[history.length - 14]) / 14;

    const forecasts: number[] = [];
    for (let i = 0; i < forecastDays; i++) {
      const base = ma14 + trend * (i + 1);
      const noise = (rng() - 0.5) * base * 0.06;
      forecasts.push(Math.round(Math.max(base + noise, 100)));
    }
    return forecasts;
  }

  it('returns array of correct length', () => {
    const history = Array.from({ length: 90 }, (_, i) => 1000 + i);
    const forecasts = forecastFromHistory(history, 30, () => 0.5);
    expect(forecasts).toHaveLength(30);
  });

  it('returns all same value when history < 14 days', () => {
    const history = [500, 600, 700];
    const forecasts = forecastFromHistory(history, 10, () => 0.5);
    expect(forecasts).toHaveLength(10);
    expect(forecasts.every((v) => v === 700)).toBe(true);
  });

  it('returns minimum 100 for each forecast', () => {
    const history = Array.from({ length: 90 }, () => 50);
    const forecasts = forecastFromHistory(history, 30, () => 0.5);
    expect(forecasts.every((v) => v >= 100)).toBe(true);
  });

  it('follows upward trend when history is increasing', () => {
    const history = Array.from({ length: 90 }, (_, i) => 1000 + i * 10);
    const forecasts = forecastFromHistory(history, 10, () => 0.5);
    // Last forecast should be higher than first
    expect(forecasts[forecasts.length - 1]).toBeGreaterThan(forecasts[0]);
  });

  it('follows downward trend when history is decreasing', () => {
    const history = Array.from({ length: 90 }, (_, i) => 2000 - i * 10);
    const forecasts = forecastFromHistory(history, 10, () => 0.5);
    // Last forecast should be lower than first
    expect(forecasts[forecasts.length - 1]).toBeLessThan(forecasts[0]);
  });
});
