import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

export function createServiceWorkerPlugin() {
  const template = readFileSync(new URL('./sw.js', import.meta.url), 'utf8');
  return {
    name: 'service-worker-build',
    generateBundle(_options, bundle) {
      const precacheFiles = [
        './',
        './index.html',
        ...Object.keys(bundle)
          .filter((fileName) => fileName !== 'sw.js' && !fileName.endsWith('.map'))
          .map((fileName) => `./${fileName}`),
      ];

      const source = template.replace(
        '/* __PRECACHE_MANIFEST__ */ []',
        JSON.stringify(precacheFiles),
      );

      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [createServiceWorkerPlugin()],
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
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
      exclude: ['node_modules/', 'dist/', 'coverage/', '**/*.config.js', '**/*.setup.js'],
    },
  },
  optimizeDeps: {
    include: [],
  },
});
