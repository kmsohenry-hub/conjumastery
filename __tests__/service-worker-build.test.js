/* global process */
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const distDir = resolve(process.cwd(), 'dist');

afterEach(() => {
  if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });
});

describe('production service worker', () => {
  it('emits sw.js with every production runtime asset in its precache manifest', async () => {
    await build();

    const serviceWorkerPath = resolve(distDir, 'sw.js');
    expect(existsSync(serviceWorkerPath)).toBe(true);

    const serviceWorker = readFileSync(serviceWorkerPath, 'utf8');
    const files = [
      'index.html',
      ...readdirSync(resolve(distDir, 'assets')).filter((fileName) => !fileName.endsWith('.map')),
    ];

    expect(serviceWorker).toContain('const APP_SHELL = ["./","./index.html"');
    for (const fileName of files) {
      const relativePath = fileName === 'index.html' ? './index.html' : `./assets/${fileName}`;
      expect(serviceWorker).toContain(relativePath);
    }
  });
});
