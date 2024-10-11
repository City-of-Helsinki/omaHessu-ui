import { configDefaults, UserConfig, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import eslint from 'vite-plugin-eslint';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import dotenv from 'dotenv';

const USE_TEST_ENV = process.env.NODE_ENV === 'test';
const defaultNodeEnv = USE_TEST_ENV ? 'test' : 'development';

/* @ts-ignore */
import.meta.env = {};

import.meta.env.NODE_ENV = process.env.NODE_ENV || defaultNodeEnv;

dotenv.config({
  processEnv: import.meta.env,
  ...(USE_TEST_ENV
    ? { path: ['.env', '.env.test'] }
    : { path: ['.env', `.env.${import.meta.env.NODE_ENV}`, '.env.local'] }),
  override: true,
});

export default defineConfig({
  base: '/',
  envPrefix: 'REACT_APP_',
  build: {
    outDir: './build',
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [
    react(),
    nodePolyfills(),
    eslint(),
    sentryVitePlugin({
      disable: !import.meta.env.REACT_APP_SENTRY_DSN && !import.meta.env.REACT_APP_ENVIRONMENT,
      org: 'city-of-helsinki',
      project: 'helsinki-profile-ui',
      url: 'https://sentry.test.hel.ninja',
      authToken: import.meta.env.REACT_APP_SENTRY_AUTH_TOKEN,
      telemetry: false,
      sourcemaps: {
        assets: ['./build/assets/*.js', './build/assets/*.js.map'],
        filesToDeleteAfterUpload: './build/assets/*.js.map',
      },
    }),
  ] as UserConfig['plugins'],
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    reporters: ['verbose'],
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*'],
      provider: 'istanbul',
    },
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
