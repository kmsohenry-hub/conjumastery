/* global process */
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const distDir = resolve(process.cwd(), 'dist');

afterEach(() => {
  if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });
});

describe('production service worker & PWA build integrity', () => {
  it('emits sw.js with build-hashed cache name, root manifest, icons, and every runtime asset in precache', async () => {
    await build();

    const serviceWorkerPath = resolve(distDir, 'sw.js');
    const manifestPath = resolve(distDir, 'manifest.webmanifest');
    expect(existsSync(serviceWorkerPath)).toBe(true);
    expect(existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(Array.isArray(manifest.icons) && manifest.icons.length).toBeGreaterThanOrEqual(2);
    for (const icon of manifest.icons) {
      expect(existsSync(resolve(distDir, icon.src)), `Missing built PWA icon: ${icon.src}`).toBe(
        true,
      );
    }

    const indexHtml = readFileSync(resolve(distDir, 'index.html'), 'utf8');
    expect(indexHtml).toMatch(/href=["'](?:\.\/)?manifest\.webmanifest["']/);

    const serviceWorker = readFileSync(serviceWorkerPath, 'utf8');
    expect(serviceWorker).toMatch(/const CACHE_NAME = "conjumaster-v2\.0\.0-[0-9a-f]{8}";/);

    const files = [
      'index.html',
      'manifest.webmanifest',
      'icons/icon-192.png',
      'icons/icon-512.png',
      ...readdirSync(resolve(distDir, 'assets')).filter((fileName) => !fileName.endsWith('.map')),
    ];

    expect(serviceWorker).toContain('const APP_SHELL = ["./","./index.html"');
    for (const fileName of files) {
      const relativePath =
        fileName.includes('/') || fileName === 'index.html' || fileName === 'manifest.webmanifest'
          ? `./${fileName}`
          : `./assets/${fileName}`;
      expect(serviceWorker).toContain(relativePath);
    }
  });
});
