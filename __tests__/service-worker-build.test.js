/* global process, Buffer */
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { createAppServer } from '../server.js';

const distDir = resolve(process.cwd(), 'dist');

function httpGet(port, path, headers = {}) {
  return new Promise((resolvePromise, reject) => {
    const req = httpRequest(
      { hostname: '127.0.0.1', port, path, method: 'GET', headers },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolvePromise({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

afterEach(() => {
  if (existsSync(distDir)) rmSync(distDir, { recursive: true, force: true });
});

describe('production service worker & PWA build integrity', () => {
  it('emits sw.js with build-hashed cache name, root manifest, icons, every runtime asset in precache, and serves cleanly via server.js', async () => {
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

    // Production server smoke check against the real built dist/ artifacts
    const server = createAppServer({ distDir });
    await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
    const port = server.address().port;

    try {
      const home = await httpGet(port, '/');
      expect(home.status).toBe(200);
      expect(home.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(home.headers['x-frame-options']).toBe('DENY');
      expect(home.headers['content-security-policy']).toContain("frame-ancestors 'none'");
      expect(home.body.toString('utf8')).toContain('manifest.webmanifest');

      const servedManifest = await httpGet(port, '/manifest.webmanifest');
      expect(servedManifest.status).toBe(200);
      expect(servedManifest.headers['content-type']).toBe(
        'application/manifest+json; charset=utf-8',
      );
      expect(JSON.parse(servedManifest.body.toString('utf8')).short_name).toBe('ConjuMaster');

      const servedIcon = await httpGet(port, '/icons/icon-192.png');
      expect(servedIcon.status).toBe(200);
      expect(servedIcon.headers['content-type']).toBe('image/png');
      expect(servedIcon.body.length).toBeGreaterThan(100);

      const servedSw = await httpGet(port, '/sw.js');
      expect(servedSw.status).toBe(200);
      expect(servedSw.headers['cache-control']).toBe('no-cache');
      expect(servedSw.body.toString('utf8')).toMatch(/conjumaster-v2\.0\.0-[0-9a-f]{8}/);

      const missingAsset = await httpGet(port, '/assets/does-not-exist.js');
      expect(missingAsset.status).toBe(404);

      const forwardedApi = await httpGet(port, '/api/github/status', {
        'x-forwarded-for': '203.0.113.10',
      });
      expect(forwardedApi.status).toBe(403);
    } finally {
      await new Promise((resolvePromise) => server.close(resolvePromise));
    }
  });
});
