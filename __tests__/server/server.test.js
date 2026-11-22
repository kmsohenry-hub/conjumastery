// @vitest-environment node
/* global Buffer */
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { createAppServer } from '../../server.js';

function rawHttpRequest(port, path, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', port, path, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

describe('production HTTP server (server.js)', () => {
  let rootDir;
  let distDir;
  let siblingSecretDir;
  let server;
  let port;
  const middlewareSpy = vi.fn(async (_req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ delegated: true }));
  });

  beforeAll(async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'conjumastery-srv-'));
    distDir = join(rootDir, 'dist');
    siblingSecretDir = join(rootDir, 'dist-secret');

    await mkdir(join(distDir, 'assets'), { recursive: true });
    await mkdir(join(distDir, 'nested'), { recursive: true });
    await mkdir(siblingSecretDir, { recursive: true });

    await writeFile(join(distDir, 'index.html'), '<!doctype html><title>SPA</title>');
    await writeFile(join(distDir, 'sw.js'), 'self.addEventListener("fetch", () => {});');
    await writeFile(join(distDir, 'robots.txt'), 'User-agent: *\nAllow: /\n');
    await writeFile(join(distDir, 'assets', 'main-abc123.js'), 'console.log("ok");');
    await writeFile(join(distDir, 'nested', 'index.html'), '<h1>Nested</h1>');
    await writeFile(join(distDir, 'file.unknownext'), 'raw-binary');
    await writeFile(join(siblingSecretDir, 'secret.txt'), 'TOP_SECRET_DATA');

    server = createAppServer({ distDir, middleware: middlewareSpy });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = server.address().port;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(rootDir, { recursive: true, force: true });
  });

  test('serves index.html with security headers and no-cache policy', async () => {
    const res = await rawHttpRequest(port, '/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.headers['cache-control']).toBe('no-cache');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['permissions-policy']).toContain('camera=()');
    expect(res.body).toContain('<title>SPA</title>');
  });

  test('applies immutable caching to hashed assets and no-cache to service worker', async () => {
    const asset = await rawHttpRequest(port, '/assets/main-abc123.js');
    expect(asset.status).toBe(200);
    expect(asset.headers['content-type']).toBe('application/javascript; charset=utf-8');
    expect(asset.headers['cache-control']).toBe('public, max-age=31536000, immutable');

    const sw = await rawHttpRequest(port, '/sw.js');
    expect(sw.status).toBe(200);
    expect(sw.headers['cache-control']).toBe('no-cache');

    const robots = await rawHttpRequest(port, '/robots.txt');
    expect(robots.status).toBe(200);
    expect(robots.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(robots.headers['cache-control']).toBe('public, max-age=3600');

    const unknownMime = await rawHttpRequest(port, '/file.unknownext');
    expect(unknownMime.status).toBe(200);
    expect(unknownMime.headers['content-type']).toBe('application/octet-stream');
  });

  test('supports HEAD with empty body and rejects non-GET/HEAD with 405', async () => {
    const head = await rawHttpRequest(port, '/assets/main-abc123.js', { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(head.headers['content-type']).toBe('application/javascript; charset=utf-8');
    expect(head.body).toBe('');

    const post = await rawHttpRequest(port, '/', { method: 'POST' });
    expect(post.status).toBe(405);
    expect(post.headers.allow).toBe('GET, HEAD');
  });

  test('blocks sibling-directory path traversal and encoded traversal attacks', async () => {
    const directTraversal = await rawHttpRequest(port, '/../dist-secret/secret.txt');
    expect(directTraversal.status).toBe(200);
    expect(directTraversal.body).not.toContain('TOP_SECRET_DATA');
    expect(directTraversal.body).toContain('<title>SPA</title>');

    const encodedTraversal = await rawHttpRequest(port, '/%2e%2e/dist-secret/secret.txt');
    expect(encodedTraversal.status).toBe(200);
    expect(encodedTraversal.body).not.toContain('TOP_SECRET_DATA');
    expect(encodedTraversal.body).toContain('<title>SPA</title>');
  });

  test('rejects malformed percent-encoding and null bytes with 400 Bad Request', async () => {
    const malformed = await rawHttpRequest(port, '/%E0%A4%A');
    expect(malformed.status).toBe(400);

    const nullByte = await rawHttpRequest(port, '/index.html%00.js');
    expect(nullByte.status).toBe(400);
  });

  test('serves nested directory index, falls back to SPA index on client routes, and returns 404 for missing static assets', async () => {
    const nested = await rawHttpRequest(port, '/nested');
    expect(nested.status).toBe(200);
    expect(nested.body).toContain('<h1>Nested</h1>');

    const spaRoute = await rawHttpRequest(port, '/lessons/present-simple');
    expect(spaRoute.status).toBe(200);
    expect(spaRoute.body).toContain('<title>SPA</title>');

    const missingAsset = await rawHttpRequest(port, '/assets/missing-chunk.js');
    expect(missingAsset.status).toBe(404);
    expect(missingAsset.headers['content-type']).toBe('text/plain; charset=utf-8');

    const missingIconHead = await rawHttpRequest(port, '/icons/missing.png', { method: 'HEAD' });
    expect(missingIconHead.status).toBe(404);
    expect(missingIconHead.body).toBe('');
  });

  test('delegates /api/github requests to the GitHub middleware', async () => {
    const apiRes = await rawHttpRequest(port, '/api/github/status');
    expect(apiRes.status).toBe(200);
    expect(JSON.parse(apiRes.body)).toEqual({ delegated: true });
    expect(middlewareSpy).toHaveBeenCalledOnce();
  });

  test('returns 404 when dist directory lacks index.html', async () => {
    const emptyDir = await mkdtemp(join(tmpdir(), 'conjumastery-empty-'));
    const emptyServer = createAppServer({ distDir: emptyDir, middleware: middlewareSpy });
    await new Promise((resolve) => emptyServer.listen(0, '127.0.0.1', resolve));
    const emptyPort = emptyServer.address().port;

    try {
      const res = await rawHttpRequest(emptyPort, '/missing');
      expect(res.status).toBe(404);
      const headRes = await rawHttpRequest(emptyPort, '/missing', { method: 'HEAD' });
      expect(headRes.status).toBe(404);
      expect(headRes.body).toBe('');
    } finally {
      await new Promise((resolve) => emptyServer.close(resolve));
      await rm(emptyDir, { recursive: true, force: true });
    }
  });
});
