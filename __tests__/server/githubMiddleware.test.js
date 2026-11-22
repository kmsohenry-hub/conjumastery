// @vitest-environment node
/* global Buffer */

import { EventEmitter } from 'node:events';
import { describe, expect, test, vi } from 'vitest';
import { createGitHubMiddleware } from '../../server/githubMiddleware.js';

function mockReq({
  method = 'GET',
  url = '/api/github/status',
  body = null,
  headers = {},
  remoteAddress = '127.0.0.1',
} = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.socket = { remoteAddress };
  req[Symbol.asyncIterator] = async function* () {
    if (body !== null) {
      yield Buffer.from(typeof body === 'string' ? body : JSON.stringify(body), 'utf8');
    }
  };
  return req;
}

function mockRes() {
  const headers = {};
  let body = '';
  return {
    statusCode: 200,
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    end(chunk = '') {
      body += chunk;
    },
    get json() {
      return body ? JSON.parse(body) : null;
    },
    get headers() {
      return headers;
    },
  };
}

describe('server githubMiddleware', () => {
  test('passes through non-github requests including similar prefixes', async () => {
    const middleware = createGitHubMiddleware({});
    const next1 = vi.fn();
    await middleware(mockReq({ url: '/index.html' }), mockRes(), next1);
    expect(next1).toHaveBeenCalledOnce();

    const next2 = vi.fn();
    await middleware(mockReq({ url: '/api/github-other' }), mockRes(), next2);
    expect(next2).toHaveBeenCalledOnce();
  });

  test('blocks non-loopback or forwarded read and write requests with 403', async () => {
    const middleware = createGitHubMiddleware({});
    const res1 = mockRes();
    await middleware(
      mockReq({ method: 'POST', url: '/api/github/branches', remoteAddress: '203.0.113.5' }),
      res1,
    );
    expect(res1.statusCode).toBe(403);

    const res2 = mockRes();
    await middleware(
      mockReq({
        method: 'PUT',
        url: '/api/github/contents',
        headers: { 'x-forwarded-for': '203.0.113.5' },
      }),
      res2,
    );
    expect(res2.statusCode).toBe(403);

    const res3 = mockRes();
    await middleware(
      mockReq({ method: 'GET', url: '/api/github/status', remoteAddress: '203.0.113.5' }),
      res3,
    );
    expect(res3.statusCode).toBe(403);

    const res4 = mockRes();
    await middleware(
      mockReq({
        method: 'GET',
        url: '/api/github/contents?owner=private&repo=secret&path=README.md',
        headers: { 'x-forwarded-for': '203.0.113.5' },
      }),
      res4,
    );
    expect(res4.statusCode).toBe(403);
  });

  test('routes status, branches, contents, commits, pulls, merge, and actions cleanly', async () => {
    const mockService = {
      getStatus: vi.fn().mockResolvedValue({ configured: true, authenticated: true }),
      listBranches: vi.fn().mockResolvedValue([{ name: 'main' }]),
      createBranch: vi.fn().mockResolvedValue({ ref: 'refs/heads/fix/a', sha: '123' }),
      getContent: vi.fn().mockResolvedValue({ path: 'README.md', content: 'ok' }),
      upsertFile: vi.fn().mockResolvedValue({ path: 'a.txt', commitSha: 'c1' }),
      createCommit: vi.fn().mockResolvedValue({ commitSha: 'c2' }),
      listPullRequests: vi.fn().mockResolvedValue([{ number: 1 }]),
      createPullRequest: vi.fn().mockResolvedValue({ number: 2 }),
      updatePullRequest: vi.fn().mockResolvedValue({ number: 2, title: 'Updated' }),
      mergePullRequest: vi.fn().mockResolvedValue({ merged: true }),
      listActionRuns: vi.fn().mockResolvedValue([{ id: 10 }]),
      listRunJobs: vi.fn().mockResolvedValue([{ id: 20 }]),
    };

    const middleware = createGitHubMiddleware(mockService);

    const checks = [
      [
        { method: 'GET', url: '/api/github/status' },
        200,
        { configured: true, authenticated: true },
      ],
      [{ method: 'GET', url: '/api/github/branches' }, 200, { branches: [{ name: 'main' }] }],
      [
        { method: 'POST', url: '/api/github/branches', body: { branch: 'fix/a' } },
        201,
        { ref: 'refs/heads/fix/a', sha: '123' },
      ],
      [
        { method: 'GET', url: '/api/github/contents?path=README.md&ref=main' },
        200,
        { path: 'README.md', content: 'ok' },
      ],
      [
        {
          method: 'PUT',
          url: '/api/github/contents',
          body: { path: 'a.txt', content: 'x', message: 'msg', branch: 'fix/a' },
        },
        200,
        { path: 'a.txt', commitSha: 'c1' },
      ],
      [
        {
          method: 'POST',
          url: '/api/github/commits',
          body: { branch: 'fix/a', message: 'msg', files: [{ path: 'a.txt', content: 'x' }] },
        },
        201,
        { commitSha: 'c2' },
      ],
      [{ method: 'GET', url: '/api/github/pulls?state=open' }, 200, { pulls: [{ number: 1 }] }],
      [
        { method: 'POST', url: '/api/github/pulls', body: { title: 't', head: 'fix/a' } },
        201,
        { number: 2 },
      ],
      [
        { method: 'PATCH', url: '/api/github/pulls/2', body: { title: 'Updated' } },
        200,
        { number: 2, title: 'Updated' },
      ],
      [
        { method: 'PUT', url: '/api/github/pulls/2/merge', body: { mergeMethod: 'squash' } },
        200,
        { merged: true },
      ],
      [{ method: 'GET', url: '/api/github/actions/runs?branch=main' }, 200, { runs: [{ id: 10 }] }],
      [{ method: 'GET', url: '/api/github/actions/runs/10/jobs' }, 200, { jobs: [{ id: 20 }] }],
      [{ method: 'GET', url: '/api/github/unknown' }, 404, { error: 'Unknown GitHub API route' }],
    ];

    for (const [reqOpts, expectedStatus, expectedJson] of checks) {
      const res = mockRes();
      await middleware(mockReq(reqOpts), res);
      expect(res.statusCode).toBe(expectedStatus);
      expect(res.json).toEqual(expectedJson);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
    }
  });

  test('returns 400 on invalid or non-object JSON payloads and propagates service error status', async () => {
    const middleware = createGitHubMiddleware({
      createBranch: vi.fn().mockRejectedValue(Object.assign(new Error('nope'), { status: 422 })),
    });

    const badJsonRes = mockRes();
    await middleware(
      mockReq({ method: 'POST', url: '/api/github/branches', body: '{bad' }),
      badJsonRes,
    );
    expect(badJsonRes.statusCode).toBe(400);

    for (const nonObjectBody of ['[]', 'null', '"hello"', '42']) {
      const res = mockRes();
      await middleware(
        mockReq({ method: 'POST', url: '/api/github/branches', body: nonObjectBody }),
        res,
      );
      expect(res.statusCode).toBe(400);
      expect(res.json.error).toBe('Request body must be a JSON object');
    }

    const errRes = mockRes();
    await middleware(
      mockReq({ method: 'POST', url: '/api/github/branches', body: { branch: 'x' } }),
      errRes,
    );
    expect(errRes.statusCode).toBe(422);
    expect(errRes.json.error).toBe('nope');
  });

  test('enforces 2 MiB body cap (413), blocks Forwarded writes, allows IPv6 loopback, and handles empty bodies', async () => {
    const createBranch = vi.fn().mockResolvedValue({ ref: 'refs/heads/a', sha: '1' });
    const middleware = createGitHubMiddleware({
      createBranch,
      listBranches: vi.fn().mockRejectedValue(new Error('unexpected')),
    });

    // Forwarded header rejected on write
    const fwdRes = mockRes();
    await middleware(
      mockReq({
        method: 'POST',
        url: '/api/github/branches',
        headers: { forwarded: 'for=203.0.113.9' },
      }),
      fwdRes,
    );
    expect(fwdRes.statusCode).toBe(403);

    // IPv6 loopback ::1 and IPv4-mapped ::ffff:127.0.0.1 allowed with empty body
    const ipv6Res = mockRes();
    await middleware(
      mockReq({ method: 'POST', url: '/api/github/branches', remoteAddress: '::1' }),
      ipv6Res,
    );
    expect(ipv6Res.statusCode).toBe(201);

    const mappedRes = mockRes();
    await middleware(
      mockReq({ method: 'POST', url: '/api/github/branches', remoteAddress: '::ffff:127.0.0.1' }),
      mappedRes,
    );
    expect(mappedRes.statusCode).toBe(201);

    // Oversized body (> 2 MiB) rejected with 413
    const hugeBody = 'a'.repeat(2 * 1024 * 1024 + 16);
    const largeRes = mockRes();
    await middleware(
      mockReq({ method: 'POST', url: '/api/github/branches', body: hugeBody }),
      largeRes,
    );
    expect(largeRes.statusCode).toBe(413);

    // Error without explicit HTTP status defaults to 400
    const fallbackErrRes = mockRes();
    await middleware(mockReq({ method: 'GET', url: '/api/github/branches' }), fallbackErrRes);
    expect(fallbackErrRes.statusCode).toBe(400);
    expect(fallbackErrRes.json.error).toBe('unexpected');

    // Non-GitHub URL without next callback does not throw
    await expect(middleware(mockReq({ url: '/style.css' }), mockRes())).resolves.toBeUndefined();
  });
});
