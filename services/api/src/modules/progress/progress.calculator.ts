/**
 * Calculates estimated 1-Rep Max (1RM) using the Epley formula:
 * estimated1RM = weight * (1 + reps / 30)
 *
 * Rules:
 * - Requires weight > 0 and reps > 0
 * - Applicable for 1 <= reps <= 15
 * - Returns rounded float (2 decimal places) or null if inputs are invalid/out of range
 */
export function calculateEstimated1RM(weight: number | null | undefined, reps: number | null | undefined): number | null {
  if (weight === null || weight === undefined || weight <= 0) return null;
  if (reps === null || reps === undefined || reps <= 0 || reps > 15) return null;

  const estimated = weight * (1 + reps / 30);
  return Math.round(estimated * 100) / 100;
}

/**
 * Calculates weighted set volume:
 * volume = weight * reps
 *
 * Returns 0 if either weight or reps is null/invalid/negative.
 */
export function calculateSetVolume(weight: number | null | undefined, reps: number | null | undefined): number {
  if (weight === null || weight === undefined || weight <= 0) return 0;
  if (reps === null || reps === undefined || reps <= 0) return 0;

  return Math.round(weight * reps * 100) / 100;
}

/**
 * Calculates workout duration in seconds given startedAt and endedAt timestamps.
 * Returns 0 if endedAt is missing or earlier than startedAt.
 */
export function calculateWorkoutDurationSeconds(startedAt: Date | string, endedAt: Date | string | null | undefined): number {
  if (!endedAt) return 0;

  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  const end = typeof endedAt === 'string' ? new Date(endedAt) : endedAt;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}
