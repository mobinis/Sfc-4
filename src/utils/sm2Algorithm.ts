/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Used for Feynman active recall teach-back cards and wisdom retention
 */

export interface SM2State {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  lastReviewDate: string;
  nextReviewDate: string;
}

export interface SM2CalculationResult {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string;
  isDue: boolean;
}

export class SM2Algorithm {
  /**
   * Calculate next SM-2 review parameters based on user recall grade (0-5)
   * @param previous Current item SM-2 state
   * @param grade 0 (blackout) to 5 (perfect recall)
   */
  static calculate(
    previous: Partial<SM2State> = {},
    grade: number
  ): SM2CalculationResult {
    const clampedGrade = Math.max(0, Math.min(5, Math.round(grade)));
    let repetitions = previous.repetitions || 0;
    let intervalDays = previous.intervalDays || 1;
    let easeFactor = previous.easeFactor || 2.5;

    // 1. Calculate new Ease Factor (EF)
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const qDiff = 5 - clampedGrade;
    const newEaseFactor = easeFactor + (0.1 - qDiff * (0.08 + qDiff * 0.02));
    easeFactor = Math.max(1.3, Number(newEaseFactor.toFixed(2)));

    // 2. Calculate repetition count and interval
    if (clampedGrade >= 3) {
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitions += 1;
    } else {
      // Failed recall: reset repetitions back to beginning
      repetitions = 0;
      intervalDays = 1;
    }

    // 3. Compute next due date
    const now = new Date();
    now.setDate(now.getDate() + intervalDays);
    const nextReviewDate = now.toISOString().split('T')[0];

    return {
      repetitions,
      intervalDays,
      easeFactor,
      nextReviewDate,
      isDue: false
    };
  }

  /**
   * Check if a flashcard / learn item is due for review today
   */
  static isCardDue(nextReviewDate?: string): boolean {
    if (!nextReviewDate) return true;
    const todayStr = new Date().toISOString().split('T')[0];
    return nextReviewDate <= todayStr;
  }
}
