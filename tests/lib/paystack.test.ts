/**
 * Unit tests for Paystack utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  toKobo,
  fromKobo,
  calculatePlatformFee,
  generateReference,
} from '@/lib/paystack';

describe('Paystack Utils', () => {
  describe('toKobo', () => {
    it('should convert amount to kobo correctly', () => {
      expect(toKobo(100)).toBe(10000);
      expect(toKobo(1.50)).toBe(150);
      expect(toKobo(0.01)).toBe(1);
    });

    it('should handle decimal amounts', () => {
      expect(toKobo(99.99)).toBe(9999);
      expect(toKobo(1.234)).toBe(123); // Rounds
    });

    it('should handle zero', () => {
      expect(toKobo(0)).toBe(0);
    });
  });

  describe('fromKobo', () => {
    it('should convert kobo to amount correctly', () => {
      expect(fromKobo(10000)).toBe(100);
      expect(fromKobo(150)).toBe(1.5);
      expect(fromKobo(1)).toBe(0.01);
    });

    it('should handle zero', () => {
      expect(fromKobo(0)).toBe(0);
    });
  });

  describe('calculatePlatformFee', () => {
    it('should calculate 5% platform fee correctly', () => {
      const result = calculatePlatformFee(10000, 5);
      expect(result.platformFee).toBe(500);
      expect(result.sellerAmount).toBe(9500);
    });

    it('should calculate 10% platform fee correctly', () => {
      const result = calculatePlatformFee(10000, 10);
      expect(result.platformFee).toBe(1000);
      expect(result.sellerAmount).toBe(9000);
    });

    it('should use default 5% when not specified', () => {
      const result = calculatePlatformFee(10000);
      expect(result.platformFee).toBe(500);
      expect(result.sellerAmount).toBe(9500);
    });

    it('should handle edge cases', () => {
      const result = calculatePlatformFee(1, 5);
      expect(result.platformFee).toBe(0); // Rounds down
      expect(result.sellerAmount).toBe(1);
    });
  });

  describe('generateReference', () => {
    it('should generate reference with default prefix', () => {
      const ref = generateReference();
      expect(ref).toMatch(/^TXN_\d+_[A-Z0-9]+$/);
    });

    it('should generate reference with custom prefix', () => {
      const ref = generateReference('ORDER');
      expect(ref).toMatch(/^ORDER_\d+_[A-Z0-9]+$/);
    });

    it('should generate unique references', () => {
      const ref1 = generateReference();
      const ref2 = generateReference();
      expect(ref1).not.toBe(ref2);
    });
  });
});
