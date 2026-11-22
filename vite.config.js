import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { createGitHubMiddleware } from './server/githubMiddleware.js';

export function createGitHubApiPlugin() {
  const middleware = createGitHubMiddleware();
  return {
    name: 'github-server-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export function createServiceWorkerPlugin() {
  const template = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  const publicPwaAssets = ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
  return {
    name: 'service-worker-build',
    generateBundle(_options, bundle) {
      const emittedFiles = Object.keys(bundle)
        .filter((fileName) => fileName !== 'sw.js' && !fileName.endsWith('.map'))
        .sort();
      const staticPublicFiles = publicPwaAssets.filter((relPath) =>
        existsSync(new URL(`./public/${relPath}`, import.meta.url)),
      );
      const precacheFiles = Array.from(
        new Set([
          './',
          './index.html',
          ...staticPublicFiles.map((fileName) => `./${fileName}`),
          ...emittedFiles.map((fileName) => `./${fileName}`),
        ]),
      );

      const hash = createHash('sha256');
      for (const fileName of emittedFiles) {
        hash.update(fileName);
        const item = bundle[fileName];
        if (item?.type === 'chunk' && typeof item.code === 'string') {
          hash.update(item.code);
        } else if (item?.type === 'asset' && item.source) {
          hash.update(item.source);
        }
      }
      for (const relPath of staticPublicFiles) {
        hash.update(relPath);
        hash.update(readFileSync(new URL(`./public/${relPath}`, import.meta.url)));
      }
      const cacheVersion = `conjumaster-v2.0.0-${hash.digest('hex').slice(0, 8)}`;

      const source = template
        .replace("/* __CACHE_NAME__ */ 'conjumaster-v2.0.0'", JSON.stringify(cacheVersion))
        .replace('/* __PRECACHE_MANIFEST__ */ []', JSON.stringify(precacheFiles));

      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [createServiceWorkerPlugin(), createGitHubApiPlugin()],
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser', // Minification en production via terser
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/src/data/exerciseTemplates.js')) {
            return 'exercise-templates';
          }
          if (normalized.includes('/src/data/')) {
            return 'curriculum-data';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: ['__tests__/**/*.test.{js,mjs,cjs}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },
      exclude: ['node_modules/', 'dist/', 'coverage/', '**/*.config.js', '**/*.setup.js'],
    },
  },
  optimizeDeps: {
    include: [],
  },
});
