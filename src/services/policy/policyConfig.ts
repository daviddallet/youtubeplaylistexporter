// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

/**
 * Policy configuration from environment variables.
 * Handles Terms of Service and Privacy Policy file loading.
 */

export type PolicyType = 'terms' | 'privacy';

interface PolicyConfig {
  terms: string;
  privacy: string;
}

/**
 * Get policy configuration from environment variables.
 * Returns the basename for each policy type, or 'none' if disabled.
 */
export function getPolicyConfig(): PolicyConfig {
  return {
    terms: import.meta.env.VITE_POLICY_TERMS || 'none',
    privacy: import.meta.env.VITE_POLICY_PRIVACY || 'none',
  };
}

/**
 * Check if a policy type is enabled (not set to 'none').
 */
export function isPolicyEnabled(type: PolicyType): boolean {
  const config = getPolicyConfig();
  return config[type] !== 'none';
}

/**
 * Check if any policy is enabled.
 */
export function isAnyPolicyEnabled(): boolean {
  return isPolicyEnabled('terms') || isPolicyEnabled('privacy');
}

/**
 * Get the URL path for a policy type.
 */
export function getPolicyPath(type: PolicyType): string {
  return type === 'terms' ? '/terms' : '/privacy';
}

/**
 * Build the URL for a policy markdown file.
 * Files are located in /legal/ directory relative to the app root.
 *
 * In dev mode, Vite serves from app/, so we need ../legal/ to reach the parent.
 * In production, files are copied to dist/legal/, so /legal/ works.
 *
 * @param type - The policy type (terms or privacy)
 * @param lang - The language code (e.g., 'en', 'fr')
 * @returns The URL to fetch the markdown file
 */
export function getPolicyFileUrl(type: PolicyType, lang: string): string {
  const config = getPolicyConfig();
  const basename = config[type];

  if (basename === 'none') {
    throw new Error(`Policy type "${type}" is disabled`);
  }

  // In dev mode, use relative path to parent directory
  // In production, files are copied to dist/legal/
  const isDev = import.meta.env.DEV;
  const basePath = isDev ? '../legal' : '/legal';

  return `${basePath}/${basename}.${lang}.md`;
}

/**
 * Fetch policy content with language fallback to English.
 *
 * @param type - The policy type (terms or privacy)
 * @param lang - The preferred language code
 * @returns The markdown content
 */
export async function fetchPolicyContent(type: PolicyType, lang: string): Promise<string> {
  const config = getPolicyConfig();
  if (config[type] === 'none') {
    throw new Error(`Policy type "${type}" is disabled`);
  }

  // Try preferred language first
  const preferredUrl = getPolicyFileUrl(type, lang);
  try {
    const response = await fetch(preferredUrl);
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Fall through to English fallback
  }

  // Fallback to English if preferred language not available
  if (lang !== 'en') {
    const englishUrl = getPolicyFileUrl(type, 'en');
    const response = await fetch(englishUrl);
    if (response.ok) {
      return await response.text();
    }
  }

  throw new Error(`Failed to load policy content for "${type}"`);
}
