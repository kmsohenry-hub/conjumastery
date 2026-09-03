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
