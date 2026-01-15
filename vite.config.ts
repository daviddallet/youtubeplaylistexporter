// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

/// <reference types="vitest" />
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin to validate policy file configuration at build time.
 * - Ensures VITE_POLICY_TERMS and VITE_POLICY_PRIVACY env vars are set
 * - Validates that English (.en.md) files exist for configured basenames
 * - Allows "none" value to skip validation (for demo/dev mode)
 * - Skips validation in test mode
 */
function validatePolicyFiles(): Plugin {
  let termsBase: string | undefined;
  let privacyBase: string | undefined;
  let isTestMode = false;

  return {
    name: 'validate-policy-files',
    config(_, { mode }) {
      isTestMode = mode === 'test';
      // Load env vars using Vite's loadEnv
      const env = loadEnv(mode, __dirname, 'VITE_');
      termsBase = env.VITE_POLICY_TERMS;
      privacyBase = env.VITE_POLICY_PRIVACY;
    },
    buildStart() {
      // Skip validation in test mode
      if (isTestMode) {
        return;
      }

      // Check if env vars are set
      if (!termsBase) {
        throw new Error(
          'VITE_POLICY_TERMS environment variable is required. ' +
            'Set it to a policy file basename (e.g., "policy") or "none" to disable.'
        );
      }
      if (!privacyBase) {
        throw new Error(
          'VITE_POLICY_PRIVACY environment variable is required. ' +
            'Set it to a policy file basename (e.g., "policy") or "none" to disable.'
        );
      }

      // Validate files exist (unless set to "none")
      const legalDir = resolve(__dirname, '..', 'legal');

      if (termsBase !== 'none') {
        const termsEnFile = resolve(legalDir, `${termsBase}.en.md`);
        if (!existsSync(termsEnFile)) {
          throw new Error(
            `Terms policy file not found: ${termsEnFile}\n` +
              `VITE_POLICY_TERMS is set to "${termsBase}" but "${termsBase}.en.md" does not exist in the legal/ directory.`
          );
        }
      }

      if (privacyBase !== 'none') {
        const privacyEnFile = resolve(legalDir, `${privacyBase}.en.md`);
        if (!existsSync(privacyEnFile)) {
          throw new Error(
            `Privacy policy file not found: ${privacyEnFile}\n` +
              `VITE_POLICY_PRIVACY is set to "${privacyBase}" but "${privacyBase}.en.md" does not exist in the legal/ directory.`
          );
        }
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Lock the dev server to port 5173 for OAuth redirect consistency
  server: {
    port: 5173,
    strictPort: true, // Fail if port is already in use
    // Serve legal/ directory from parent folder in dev mode
    fs: {
      allow: ['..'],
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    validatePolicyFiles(),
    react(),
    // Copy legal files from parent directory to dist/legal during build
    viteStaticCopy({
      targets: [
        {
          src: '../legal/*.md',
          dest: 'legal',
        },
      ],
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'YouTube Playlist Exporter',
        short_name: 'YT Playlists',
        description: 'Export your YouTube playlists to CSV and JSON format',
        theme_color: '#FF0000',
        background_color: '#0F0F0F',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/youtube\/v3\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'youtube-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA in dev mode for testing
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
});
