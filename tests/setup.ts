/**
 * Test setup file for Vitest
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_key';
process.env.PAYSTACK_WEBHOOK_SECRET = 'whsec_mock_secret';
process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = 'pk_test_mock_key';
process.env.PLATFORM_FEE_PERCENTAGE = '5';
process.env.DEFAULT_CURRENCY = 'ZAR';

// Mock Firebase Admin
vi.mock('../firebase/admin', () => ({
  firebaseDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
      where: vi.fn(() => ({
        get: vi.fn(),
        limit: vi.fn(() => ({
          get: vi.fn(),
        })),
      })),
      add: vi.fn(),
    })),
  },
}));

// Global setup
beforeAll(() => {
  console.log('🧪 Setting up tests...');
});

// Global teardown
afterAll(() => {
  console.log('✅ Tests complete');
});
