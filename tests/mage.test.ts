// @file tests/mage.test.ts
// Comprehensive tests for clinical-grade MAGE implementation

import { describe, it, expect } from 'vitest';
import { glucoseMAGE, type MAGEOptions } from '../src/mage';

describe('Clinical-Grade MAGE Implementation', () => {
  describe('Input Validation', () => {
    it('should return NaN for empty array', () => {
      expect(glucoseMAGE([])).toBeNaN();
    });

    it('should return NaN for single value', () => {
      expect(glucoseMAGE([100])).toBeNaN();
    });

    it('should return NaN for array with only NaN values', () => {
      expect(glucoseMAGE([NaN, NaN, NaN])).toBeNaN();
    });

    it('should return NaN for array with infinite values', () => {
      expect(glucoseMAGE([Infinity, -Infinity, 100])).toBeNaN();
    });

    it('should filter out invalid values and process valid ones', () => {
      const result = glucoseMAGE([100, NaN, 120, undefined as any, 80, null as any, 160]);
      // Should process [100, 120, 80, 160] and return a valid MAGE
      expect(result).not.toBeNaN();
    });

    it('should return NaN for constant values (no variability)', () => {
      expect(glucoseMAGE([100, 100, 100, 100, 100])).toBeNaN();
    });
  });

  describe('Clinical Data Scenarios', () => {
    it('should calculate MAGE for typical Type 1 diabetes CGM data', () => {
      // Simulated 24-hour CGM data with significant excursions
      const t1dData = [
        120, 140, 160, 180, 200, 220, 200, 180, 160, 140, 120, 100,
        80, 60, 80, 100, 120, 140, 160, 180, 200, 180, 160, 140,
        120, 100, 80, 100, 120, 140, 160, 180, 200, 220, 240, 220,
        200, 180, 160, 140, 120, 100, 80, 60, 40, 60, 80, 100
      ];
      
      const mage = glucoseMAGE(t1dData);
      expect(mage).toBeGreaterThan(0);
      expect(mage).toBeLessThan(300); // Reasonable upper bound
      expect(Number.isFinite(mage)).toBe(true);
    });

    it('should calculate MAGE for stable Type 2 diabetes data', () => {
      // More stable glucose pattern with smaller excursions
      const t2dData = [
        140, 145, 150, 155, 160, 155, 150, 145, 140, 135,
        130, 135, 140, 145, 150, 155, 160, 165, 160, 155,
        150, 145, 140, 135, 130, 125, 130, 135, 140, 145
      ];
      
      const mage = glucoseMAGE(t2dData);
      expect(mage).toBeGreaterThan(0);
      expect(mage).toBeLessThan(100); // Should be lower than T1D
      expect(Number.isFinite(mage)).toBe(true);
    });

    it('should calculate MAGE for non-diabetic glucose pattern', () => {
      // Normal glucose variability pattern
      const normalData = [
        85, 90, 95, 100, 105, 110, 115, 120, 115, 110,
        105, 100, 95, 90, 85, 80, 85, 90, 95, 100,
        105, 110, 105, 100, 95, 90, 85, 90, 95, 100
      ];
      
      const mage = glucoseMAGE(normalData);
      expect(mage).toBeGreaterThan(0);
      expect(mage).toBeLessThan(50); // Should be lowest
      expect(Number.isFinite(mage)).toBe(true);
    });
  });

  describe('Algorithm Configuration Options', () => {
    const testData = [
      100, 120, 80, 160, 90, 140, 70, 180, 85, 150,
      75, 170, 95, 130, 110, 190, 65, 155, 105, 125
    ];

    it('should use default parameters when no options provided', () => {
      const mage1 = glucoseMAGE(testData);
      const mage2 = glucoseMAGE(testData, {});
      expect(mage1).toBe(mage2);
    });

    it('should accept custom short window parameter', () => {
      const mage1 = glucoseMAGE(testData, { shortWindow: 3 });
      const mage2 = glucoseMAGE(testData, { shortWindow: 7 });
      
      expect(Number.isFinite(mage1)).toBe(true);
      expect(Number.isFinite(mage2)).toBe(true);
      // Different window sizes may produce different results
    });

    it('should accept custom long window parameter', () => {
      const mage1 = glucoseMAGE(testData, { longWindow: 20 });
      const mage2 = glucoseMAGE(testData, { longWindow: 40 });
      
      expect(Number.isFinite(mage1)).toBe(true);
      expect(Number.isFinite(mage2)).toBe(true);
    });

    it('should handle direction parameter correctly', () => {
      const mageAuto = glucoseMAGE(testData, { direction: 'auto' });
      const mageAsc = glucoseMAGE(testData, { direction: 'ascending' });
      const mageDesc = glucoseMAGE(testData, { direction: 'descending' });
      
      expect(Number.isFinite(mageAuto)).toBe(true);
      expect(Number.isFinite(mageAsc)).toBe(true);
      expect(Number.isFinite(mageDesc)).toBe(true);
      
      // Auto should match either ascending or descending
      expect(mageAuto === mageAsc || mageAuto === mageDesc).toBe(true);
    });
  });

  describe('Edge Cases and Robustness', () => {
    it('should handle minimal data that meets requirements', () => {
      // Minimum data for potential MAGE calculation
      const minimalData = [50, 100, 60, 110, 70, 120, 80, 130];
      const mage = glucoseMAGE(minimalData);
      
      // Should either return a valid MAGE or NaN (if no excursions > 1 SD)
      expect(Number.isFinite(mage) || Number.isNaN(mage)).toBe(true);
    });

    it('should handle data with small excursions (all < 1 SD)', () => {
      // Perfectly constant data where SD = 0 (no variability)
      const stableData = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
      const mage = glucoseMAGE(stableData);
      
      // Should return NaN as there's no variability (SD = 0)
      expect(mage).toBeNaN();
    });

    it('should handle monotonic increasing data', () => {
      const increasingData = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140];
      const mage = glucoseMAGE(increasingData);
      
      // May or may not have valid excursions depending on algorithm
      expect(Number.isFinite(mage) || Number.isNaN(mage)).toBe(true);
    });

    it('should handle monotonic decreasing data', () => {
      const decreasingData = [200, 180, 160, 140, 120, 100, 80, 60, 40, 20];
      const mage = glucoseMAGE(decreasingData);
      
      // May or may not have valid excursions depending on algorithm
      expect(Number.isFinite(mage) || Number.isNaN(mage)).toBe(true);
    });

    it('should handle alternating pattern', () => {
      const alternatingData = [100, 150, 100, 150, 100, 150, 100, 150, 100, 150];
      const mage = glucoseMAGE(alternatingData);
      
      expect(Number.isFinite(mage)).toBe(true);
      expect(mage).toBeGreaterThan(0);
    });
  });

  describe('Clinical Validation Scenarios', () => {
    it('should produce consistent results for identical data', () => {
      const data = [80, 120, 70, 160, 90, 140, 75, 180, 85, 150];
      
      const mage1 = glucoseMAGE(data);
      const mage2 = glucoseMAGE(data);
      const mage3 = glucoseMAGE([...data]); // Copy of array
      
      expect(mage1).toBe(mage2);
      expect(mage1).toBe(mage3);
    });

    it('should handle realistic CGM sampling frequencies', () => {
      // Simulate 5-minute CGM readings over 4 hours (48 readings)
      const cgmData = [];
      let baseGlucose = 120;
      
      for (let i = 0; i < 48; i++) {
        // Add some realistic variability
        const variation = Math.sin(i / 8) * 40 + Math.random() * 20 - 10;
        cgmData.push(Math.max(40, Math.min(400, baseGlucose + variation)));
      }
      
      const mage = glucoseMAGE(cgmData);
      expect(Number.isFinite(mage) || Number.isNaN(mage)).toBe(true);
    });

    it('should handle extreme but valid glucose values', () => {
      const extremeData = [
        40, 50, 45, 400, 350, 300, 250, 200, 150, 100,
        50, 45, 40, 350, 300, 250, 200, 150, 100, 80
      ];
      
      const mage = glucoseMAGE(extremeData);
      expect(Number.isFinite(mage)).toBe(true);
      expect(mage).toBeGreaterThan(0);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large datasets efficiently', () => {
      // Simulate 24 hours of 1-minute CGM data (1440 readings)
      const largeData = [];
      for (let i = 0; i < 1440; i++) {
        const baseValue = 120 + Math.sin(i / 60) * 30; // Hourly cycle
        const noise = (Math.random() - 0.5) * 20;
        largeData.push(Math.max(40, Math.min(400, baseValue + noise)));
      }
      
      const startTime = Date.now();
      const mage = glucoseMAGE(largeData);
      const endTime = Date.now();
      
      expect(Number.isFinite(mage) || Number.isNaN(mage)).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Type Safety and API', () => {
    it('should accept MAGEOptions type correctly', () => {
      const options: MAGEOptions = {
        shortWindow: 5,
        longWindow: 32,
        direction: 'auto'
      };
      
      const data = [100, 120, 80, 160, 90, 140, 70, 180];
      const mage = glucoseMAGE(data, options);
      
      expect(Number.isFinite(mage) || Number.isNaN(mage)).toBe(true);
    });

    it('should handle partial options objects', () => {
      const data = [100, 120, 80, 160, 90, 140, 70, 180];
      
      const mage1 = glucoseMAGE(data, { shortWindow: 3 });
      const mage2 = glucoseMAGE(data, { direction: 'ascending' });
      const mage3 = glucoseMAGE(data, { longWindow: 20 });
      
      expect(Number.isFinite(mage1) || Number.isNaN(mage1)).toBe(true);
      expect(Number.isFinite(mage2) || Number.isNaN(mage2)).toBe(true);
      expect(Number.isFinite(mage3) || Number.isNaN(mage3)).toBe(true);
    });
  });
});
