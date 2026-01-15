// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

/**
 * Throttle configuration for YouTube API calls.
 *
 * Controls client-side rate limiting to spread quota consumption over time.
 */

/**
 * Number of quota points that can be consumed in the last 60 seconds
 * before throttling kicks in.
 *
 * Below this threshold: requests proceed immediately
 * Above this threshold: exponential backoff delays are applied
 */
export const THROTTLE_THRESHOLD = parseInt(import.meta.env.VITE_THROTTLE_THRESHOLD ?? '30', 10);

/**
 * Maximum quota points that can be consumed per minute.
 *
 * This should be at least 60 points above THROTTLE_THRESHOLD to ensure
 * that even at maximum throttling, at least 1 request per second can proceed.
 */
export const MAX_QUOTA_PER_MINUTE = parseInt(import.meta.env.VITE_MAX_QUOTA_PER_MINUTE ?? '90', 10);

/**
 * Reserve quota available after crossing the threshold.
 * Used for exponential backoff calculations.
 */
export const RESERVE_QUOTA = MAX_QUOTA_PER_MINUTE - THROTTLE_THRESHOLD;

// Runtime validation
if (RESERVE_QUOTA < 60) {
  console.warn(
    `[Throttle Config] RESERVE_QUOTA (${RESERVE_QUOTA}) is less than 60. ` +
      `This may cause delays exceeding 1 second. ` +
      `Consider increasing MAX_QUOTA_PER_MINUTE or decreasing THROTTLE_THRESHOLD.`
  );
}
