// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

/**
 * Throttle queue for YouTube API requests.
 *
 * Serializes throttle decisions to prevent race conditions with concurrent requests.
 * Uses exponential backoff (power of 2) when quota consumption exceeds the threshold.
 */

import { quotaTracker, QuotaTracker } from './quotaTracker';
import { THROTTLE_THRESHOLD, RESERVE_QUOTA } from '../../config/throttle';

/**
 * Maximum wait time in milliseconds.
 * With RESERVE_QUOTA >= 60, this ensures at least 1 request/second can proceed.
 */
const MAX_WAIT_MS = 1000;

/**
 * Simple sleep utility.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ThrottleQueue ensures that API requests are rate-limited according to
 * the configured throttle settings.
 *
 * How it works:
 * 1. Requests enter the queue via execute()
 * 2. A mutex ensures only one throttle decision is made at a time
 * 3. If throttling is needed, the request waits before proceeding
 * 4. Quota is recorded before the request executes
 * 5. The actual request can overlap with the next throttle decision
 */
export class ThrottleQueue {
  private mutex: Promise<void> = Promise.resolve();
  private tracker: QuotaTracker;

  constructor(tracker: QuotaTracker = quotaTracker) {
    this.tracker = tracker;
  }

  /**
   * Executes a request through the throttle queue.
   *
   * @param quotaCost - The quota cost of this request (typically 1)
   * @param request - The async function that performs the actual API call
   * @returns The result of the request
   */
  async execute<T>(quotaCost: number, request: () => Promise<T>): Promise<T> {
    // Serialize throttle decisions through the mutex
    await this.acquireSlot(quotaCost);

    // Record quota consumption before executing
    this.tracker.record(quotaCost);

    // Execute the actual request
    // Note: execution can overlap with next throttle decision
    return request();
  }

  /**
   * Acquires a slot in the queue, waiting if necessary.
   * Uses a mutex pattern to serialize throttle decisions.
   */
  private async acquireSlot(quotaCost: number): Promise<void> {
    // Chain onto the mutex to serialize decisions
    const previousMutex = this.mutex;
    let resolveSlot: () => void;

    this.mutex = new Promise<void>((resolve) => {
      resolveSlot = resolve;
    });

    // Wait for previous slot to be processed
    await previousMutex;

    // Calculate wait time based on current state
    const waitTime = this.calculateWait(quotaCost);

    if (waitTime > 0) {
      await sleep(waitTime);
    }

    // Release the slot for the next request
    resolveSlot!();
  }

  /**
   * Calculates the wait time based on exponential backoff.
   *
   * Formula: waitMs = min(1000, utilization² × 1000)
   *
   * Where utilization = (afterRequest - threshold) / reserveQuota
   *
   * @param quotaCost - The quota cost of the pending request
   * @returns Wait time in milliseconds (0 to MAX_WAIT_MS)
   */
  private calculateWait(quotaCost: number): number {
    const consumed = this.tracker.countLast60Seconds();
    const afterRequest = consumed + quotaCost;

    // Below threshold: no throttling
    if (afterRequest <= THROTTLE_THRESHOLD) {
      return 0;
    }

    // Calculate utilization of reserve quota
    // Clamp to 1.0 to handle edge cases
    const utilizationRatio = Math.min(1, (afterRequest - THROTTLE_THRESHOLD) / RESERVE_QUOTA);

    // Exponential backoff: power of 2 (quadratic)
    const waitMs = Math.pow(utilizationRatio, 2) * MAX_WAIT_MS;

    return Math.min(MAX_WAIT_MS, Math.round(waitMs));
  }
}

/**
 * Singleton instance for the application.
 */
export const throttleQueue = new ThrottleQueue();
