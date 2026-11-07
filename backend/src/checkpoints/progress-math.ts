export type ProgressLike = {
  progress?: number | null;
  weight?: number | null;
  status?: string;
};

/** Exclude Draft and Cancelled from parent progress (PRD §8). */
export function isProgressEligible(status?: string): boolean {
  return status !== 'Draft' && status !== 'Cancelled';
}

/**
 * Weighted average when any checkpoint has weight > 0;
 * otherwise simple mean. Missing/invalid weights count as 1.
 */
export function averageCheckpointProgress(checkpoints: ProgressLike[]): number {
  const eligible = checkpoints.filter((cp) => isProgressEligible(cp.status));
  if (eligible.length === 0) {
    return 0;
  }

  const hasWeights = eligible.some(
    (cp) => typeof cp.weight === 'number' && cp.weight > 0,
  );

  if (!hasWeights) {
    const sum = eligible.reduce((acc, cp) => acc + (cp.progress ?? 0), 0);
    return sum / eligible.length;
  }

  let weightedSum = 0;
  let weightTotal = 0;
  for (const cp of eligible) {
    const weight = typeof cp.weight === 'number' && cp.weight > 0 ? cp.weight : 1;
    weightedSum += (cp.progress ?? 0) * weight;
    weightTotal += weight;
  }

  return weightTotal === 0 ? 0 : weightedSum / weightTotal;
}
