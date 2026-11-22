/* global process */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function loadServiceWorker({ cacheKeys }) {
  const listeners = {};
  const deleted = [];
  const self = {
    addEventListener: vi.fn((event, handler) => {
      listeners[event] = handler;
    }),
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    location: { origin: 'https://example.test' },
  };
  const caches = {
    keys: vi.fn().mockResolvedValue(cacheKeys),
    delete: vi.fn((key) => {
      deleted.push(key);
      return Promise.resolve(true);
    }),
    open: vi.fn(),
    match: vi.fn(),
  };

  const source = readFileSync(resolve(process.cwd(), 'sw.js'), 'utf8').replace(
    '/* __PRECACHE_MANIFEST__ */ []',
    '[]',
  );
  vm.runInNewContext(source, { self, caches, URL });

  return { listeners, deleted, self, caches };
}

describe('service worker cache cleanup', () => {
  it('deletes only obsolete ConjuMaster caches', async () => {
    const { listeners, deleted } = loadServiceWorker({
      cacheKeys: ['conjumaster-v1.9.0', 'conjumaster-v2.0.0', 'other-app-cache'],
    });

    const event = { waitUntil: (promise) => promise };
    await listeners.activate(event);

    expect(deleted).toEqual(['conjumaster-v1.9.0']);
  });

  it('preserves third-party and unrelated caches', async () => {
    const { listeners, deleted } = loadServiceWorker({
      cacheKeys: ['workbox-precache-v1', 'other-app-cache', 'shared-data-cache'],
    });

    const event = { waitUntil: (promise) => promise };
    await listeners.activate(event);

    expect(deleted).toEqual([]);
  });
});

describe('service worker update lifecycle', () => {
  it('activates an update only after an explicit SKIP_WAITING message', async () => {
    const { listeners, self } = loadServiceWorker({ cacheKeys: [] });

    await listeners.message({ data: { type: 'SKIP_WAITING' } });

    expect(self.skipWaiting).toHaveBeenCalledOnce();
  });
});

describe('service worker fetch isolation', () => {
  it('never intercepts same-origin /api/ requests', () => {
    const { listeners } = loadServiceWorker({ cacheKeys: [] });
    const respondWith = vi.fn();

    listeners.fetch({
      request: {
        method: 'GET',
        url: 'https://example.test/api/github/status',
        mode: 'cors',
      },
      respondWith,
    });

    expect(respondWith).not.toHaveBeenCalled();
  });

  it('does not cache responses with Cache-Control: no-store', async () => {
    const put = vi.fn().mockResolvedValue(undefined);
    const { listeners, caches } = loadServiceWorker({ cacheKeys: [] });
    caches.match.mockResolvedValue(undefined);
    caches.open.mockResolvedValue({ put });

    const noStoreResponse = {
      status: 200,
      type: 'basic',
      headers: { get: (h) => (h.toLowerCase() === 'cache-control' ? 'no-store' : null) },
      clone: vi.fn(),
    };
    const fetchMock = vi.fn().mockResolvedValue(noStoreResponse);

    // Reload SW with mocked fetch in sandbox context
    const source = readFileSync(resolve(process.cwd(), 'sw.js'), 'utf8').replace(
      '/* __PRECACHE_MANIFEST__ */ []',
      '[]',
    );
    const fetchListeners = {};
    const selfObj = {
      addEventListener: vi.fn((event, handler) => {
        fetchListeners[event] = handler;
      }),
      skipWaiting: vi.fn(),
      clients: { claim: vi.fn() },
      location: { origin: 'https://example.test' },
    };
    vm.runInNewContext(source, { self: selfObj, caches, URL, fetch: fetchMock });

    let responsePromise;
    fetchListeners.fetch({
      request: {
        method: 'GET',
        url: 'https://example.test/data.json',
        mode: 'cors',
      },
      respondWith: (p) => {
        responsePromise = p;
      },
    });

    const result = await responsePromise;
    expect(result).toBe(noStoreResponse);
    expect(put).not.toHaveBeenCalled();
    expect(listeners.fetch).toBeTypeOf('function');
  });

  it('returns a 503 offline Response on uncached network failure and tolerates cache.put quota errors', async () => {
    const source = readFileSync(resolve(process.cwd(), 'sw.js'), 'utf8').replace(
      '/* __PRECACHE_MANIFEST__ */ []',
      '[]',
    );

    const quotaPut = vi.fn().mockRejectedValue(new Error('QuotaExceededError'));
    const caches = {
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(true),
      open: vi.fn().mockResolvedValue({ put: quotaPut }),
      match: vi.fn().mockResolvedValue(undefined),
    };

    const okResponse = {
      status: 200,
      type: 'basic',
      headers: { get: () => null },
      clone: vi.fn().mockReturnValue({ cloned: true }),
    };

    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline asset'))
      .mockRejectedValueOnce(new Error('offline nav'))
      .mockResolvedValueOnce(okResponse);

    const listeners = {};
    const selfObj = {
      addEventListener: vi.fn((event, handler) => {
        listeners[event] = handler;
      }),
      skipWaiting: vi.fn(),
      clients: { claim: vi.fn() },
      location: { origin: 'https://example.test' },
    };

    class FakeResponse {
      constructor(body, init) {
        this.body = body;
        this.status = init.status;
        this.statusText = init.statusText;
      }
    }

    vm.runInNewContext(source, {
      self: selfObj,
      caches,
      URL,
      fetch: fetchMock,
      Response: FakeResponse,
    });

    // 1. Offline uncached asset fetch returns 503 Response instead of undefined
    let offlineAssetPromise;
    listeners.fetch({
      request: { method: 'GET', url: 'https://example.test/missing.js', mode: 'cors' },
      respondWith: (p) => {
        offlineAssetPromise = p;
      },
    });
    const offlineAssetRes = await offlineAssetPromise;
    expect(offlineAssetRes.status).toBe(503);

    // 2. Offline uncached navigate fetch returns 503 Response instead of undefined
    let offlineNavPromise;
    listeners.fetch({
      request: { method: 'GET', url: 'https://example.test/', mode: 'navigate' },
      respondWith: (p) => {
        offlineNavPromise = p;
      },
    });
    const offlineNavRes = await offlineNavPromise;
    expect(offlineNavRes.status).toBe(503);

    // 3. Background cache.put rejection (quota full) does not break the returned network response
    let quotaPromise;
    listeners.fetch({
      request: { method: 'GET', url: 'https://example.test/app.js', mode: 'cors' },
      respondWith: (p) => {
        quotaPromise = p;
      },
    });
    const networkRes = await quotaPromise;
    expect(networkRes).toBe(okResponse);
    // Allow microtasks for background cache.put().catch() to settle without unhandled rejection
    await Promise.resolve();
    await Promise.resolve();
    expect(quotaPut).toHaveBeenCalledOnce();
  });
});
