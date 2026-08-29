import { describe, it, expect } from 'vitest';
import {
  calculateEstimated1RM,
  calculateSetVolume,
  calculateWorkoutDurationSeconds,
} from '../modules/progress/progress.calculator';

describe('Progress Calculator Utilities', () => {
  describe('Epley Estimated 1RM (calculateEstimated1RM)', () => {
    it('should calculate 1RM correctly for 100kg x 5 reps', () => {
      const result = calculateEstimated1RM(100, 5);
      expect(result).toBe(116.67);
    });

    it('should calculate 1RM correctly for 80kg x 8 reps', () => {
      const result = calculateEstimated1RM(80, 8);
      expect(result).toBe(101.33);
    });

    it('should calculate 1RM correctly for 100kg x 1 rep', () => {
      const result = calculateEstimated1RM(100, 1);
      expect(result).toBe(103.33);
    });

    it('should return null when weight is null', () => {
      const result = calculateEstimated1RM(null, 8);
      expect(result).toBeNull();
    });

    it('should return null when reps is null', () => {
      const result = calculateEstimated1RM(80, null);
      expect(result).toBeNull();
    });

    it('should return null when reps is 0', () => {
      const result = calculateEstimated1RM(80, 0);
      expect(result).toBeNull();
    });

    it('should return null when reps exceed 15 (> 15)', () => {
      const result = calculateEstimated1RM(80, 16);
      expect(result).toBeNull();
    });
  });

  describe('Set Volume (calculateSetVolume)', () => {
    it('should calculate set volume for 80kg x 8 reps as 640', () => {
      expect(calculateSetVolume(80, 8)).toBe(640);
    });

    it('should return 0 when weight is null', () => {
      expect(calculateSetVolume(null, 8)).toBe(0);
    });

    it('should return 0 when reps is null', () => {
      expect(calculateSetVolume(80, null)).toBe(0);
    });

    it('should return 0 when weight or reps is <= 0', () => {
      expect(calculateSetVolume(0, 8)).toBe(0);
      expect(calculateSetVolume(80, 0)).toBe(0);
    });
  });

  describe('Workout Duration (calculateWorkoutDurationSeconds)', () => {
    it('should calculate duration in seconds between two dates', () => {
      const start = new Date('2026-08-01T10:00:00Z');
      const end = new Date('2026-08-01T11:00:00Z');
      expect(calculateWorkoutDurationSeconds(start, end)).toBe(3600);
    });

    it('should return 0 if completedAt is missing/null', () => {
      const start = new Date('2026-08-01T10:00:00Z');
      expect(calculateWorkoutDurationSeconds(start, null)).toBe(0);
    });
  });
});
