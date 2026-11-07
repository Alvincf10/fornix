import { describe, expect, it } from 'vitest';
import {
  averageCheckpointProgress,
  isProgressEligible,
} from './progress-math.js';

describe('progress-math', () => {
  it('treats Draft and Cancelled as ineligible', () => {
    expect(isProgressEligible('Active')).toBe(true);
    expect(isProgressEligible('Completed')).toBe(true);
    expect(isProgressEligible('Draft')).toBe(false);
    expect(isProgressEligible('Cancelled')).toBe(false);
  });

  it('returns 0 when no eligible checkpoints', () => {
    expect(
      averageCheckpointProgress([
        { progress: 50, status: 'Draft' },
        { progress: 80, status: 'Cancelled' },
      ]),
    ).toBe(0);
  });

  it('uses simple mean when no weights', () => {
    expect(
      averageCheckpointProgress([
        { progress: 20, status: 'Active' },
        { progress: 40, status: 'Active' },
        { progress: 100, status: 'Draft' },
      ]),
    ).toBe(30);
  });

  it('uses weighted average when any weight > 0', () => {
    expect(
      averageCheckpointProgress([
        { progress: 100, weight: 3, status: 'Completed' },
        { progress: 0, weight: 1, status: 'Active' },
      ]),
    ).toBe(75);
  });

  it('defaults missing weight to 1 when weights are present', () => {
    expect(
      averageCheckpointProgress([
        { progress: 100, weight: 1, status: 'Completed' },
        { progress: 0, status: 'Active' },
      ]),
    ).toBe(50);
  });
});
