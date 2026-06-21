import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the database module
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

// Mock the auth guard
vi.mock('@/lib/auth-guard', () => ({
  requireAuth: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock Next.js server components
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val, type: 'eq' })),
  and: vi.fn((...conditions: unknown[]) => ({ conditions, type: 'and' })),
  gte: vi.fn((col: unknown, val: unknown) => ({ col, val, type: 'gte' })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
    type: 'sql',
  })),
}));

// Mock drizzle-orm/pg-core
vi.mock('drizzle-orm/pg-core', () => ({
  pgTable: vi.fn(),
  text: vi.fn(),
  timestamp: vi.fn(),
  uuid: vi.fn(),
  decimal: vi.fn(),
  jsonb: vi.fn(),
  boolean: vi.fn(),
  integer: vi.fn(),
  date: vi.fn(),
  serial: vi.fn(),
}));
