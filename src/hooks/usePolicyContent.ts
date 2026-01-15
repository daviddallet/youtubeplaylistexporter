// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchPolicyContent, isPolicyEnabled, type PolicyType } from '../services/policy';

interface UsePolicyContentResult {
  content: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load policy content with language fallback.
 * Automatically uses the current i18n language.
 *
 * @param type - The policy type (terms or privacy)
 * @returns Object with content, loading state, and error
 */
export function usePolicyContent(type: PolicyType): UsePolicyContentResult {
  const { i18n } = useTranslation();
  const enabled = useMemo(() => isPolicyEnabled(type), [type]);

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(
    enabled ? null : new Error(`Policy type "${type}" is disabled`)
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function loadContent() {
      setLoading(true);
      setError(null);

      try {
        const lang = i18n.language.split('-')[0]; // Handle cases like 'en-US' -> 'en'
        const text = await fetchPolicyContent(type, lang);
        if (!cancelled) {
          setContent(text);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load policy content'));
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [type, i18n.language, enabled]);

  return { content, loading, error };
}
