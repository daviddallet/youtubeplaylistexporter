// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

/**
 * Tracks YouTube API quota consumption over a sliding 60-second window.
 *
 * Uses a Map<timestamp, count> structure for memory efficiency.
 * Automatically purges expired entries during count operations.
 */
export class QuotaTracker {
  private quotaBySecond = new Map<number, number>();

  /**
   * Records quota points consumed at the current second.
   * Multiple calls within the same second are aggregated.
   */
  record(points: number): void {
    const now = this.getCurrentSecond();
    this.quotaBySecond.set(now, (this.quotaBySecond.get(now) ?? 0) + points);
  }

  /**
   * Counts total quota points consumed in the last 60 seconds.
   * Also triggers cleanup of expired entries.
   */
  countLast60Seconds(): number {
    const cutoff = this.getCurrentSecond() - 60;
    let total = 0;

    for (const [timestamp, count] of this.quotaBySecond) {
      if (timestamp > cutoff) {
        total += count;
      }
    }

    // Opportunistic cleanup
    this.purgeExpired();

    return total;
  }

  /**
   * Removes entries older than 60 seconds.
   */
  purgeExpired(): void {
    const cutoff = this.getCurrentSecond() - 60;

    for (const timestamp of this.quotaBySecond.keys()) {
      if (timestamp <= cutoff) {
        this.quotaBySecond.delete(timestamp);
      }
    }
  }

  /**
   * Returns the current Unix timestamp in seconds.
   * Extracted for easier testing.
   */
  protected getCurrentSecond(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Returns the number of entries in the tracker (for debugging/testing).
   */
  get size(): number {
    return this.quotaBySecond.size;
  }

  /**
   * Clears all tracked quota (for testing).
   */
  clear(): void {
    this.quotaBySecond.clear();
  }
}

/**
 * Singleton instance for the application.
 */
export const quotaTracker = new QuotaTracker();
