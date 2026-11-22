/* global Buffer */

import { createGitHubService } from './githubService.js';

const MAX_BODY_BYTES = 2 * 1024 * 1024;

function isLoopbackRequest(req) {
  if (req.headers['x-forwarded-for'] || req.headers['forwarded']) {
    return false;
  }
  const addr = req.socket?.remoteAddress || '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const err = new Error('Request payload too large');
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Invalid JSON payload');
    err.status = 400;
    throw err;
  }
}

export function createGitHubMiddleware(service = createGitHubService()) {
  return async function githubApiMiddleware(req, res, next) {
    const rawUrl = req.url || '/';
    const isGitHubRoute =
      rawUrl === '/api/github' ||
      rawUrl.startsWith('/api/github/') ||
      rawUrl.startsWith('/api/github?');
    if (!isGitHubRoute) {
      if (typeof next === 'function') {
        next();
      }
      return;
    }

    const parsedUrl = new URL(rawUrl, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const method = (req.method || 'GET').toUpperCase();

    if (!isLoopbackRequest(req)) {
      sendJson(res, 403, {
        error: 'GitHub API access is restricted to local server access',
      });
      return;
    }

    try {
      const owner = parsedUrl.searchParams.get('owner') || undefined;
      const repo = parsedUrl.searchParams.get('repo') || undefined;

      if (method === 'GET' && pathname === '/api/github/status') {
        const status = await service.getStatus({ owner, repo });
        sendJson(res, 200, status);
        return;
      }

      if (method === 'GET' && pathname === '/api/github/branches') {
        const branches = await service.listBranches({ owner, repo });
        sendJson(res, 200, { branches });
        return;
      }

      if (method === 'POST' && pathname === '/api/github/branches') {
        const body = await readJsonBody(req);
        const created = await service.createBranch({
          branch: body.branch,
          fromBranch: body.fromBranch,
          owner: body.owner || owner,
          repo: body.repo || repo,
        });
        sendJson(res, 201, created);
        return;
      }

      if (method === 'GET' && pathname === '/api/github/contents') {
        const filePath = parsedUrl.searchParams.get('path') || '';
        const ref = parsedUrl.searchParams.get('ref') || undefined;
        const data = await service.getContent({ path: filePath, ref, owner, repo });
        sendJson(res, 200, data);
        return;
      }

      if (method === 'PUT' && pathname === '/api/github/contents') {
        const body = await readJsonBody(req);
        const result = await service.upsertFile({
          path: body.path,
          content: body.content,
          message: body.message,
          branch: body.branch,
          sha: body.sha,
          owner: body.owner || owner,
          repo: body.repo || repo,
        });
        sendJson(res, 200, result);
        return;
      }

      if (method === 'POST' && pathname === '/api/github/commits') {
        const body = await readJsonBody(req);
        const result = await service.createCommit({
          branch: body.branch,
          message: body.message,
          files: body.files,
          baseSha: body.baseSha,
          owner: body.owner || owner,
          repo: body.repo || repo,
        });
        sendJson(res, 201, result);
        return;
      }

      if (method === 'GET' && pathname === '/api/github/pulls') {
        const state = parsedUrl.searchParams.get('state') || 'open';
        const pulls = await service.listPullRequests({ state, owner, repo });
        sendJson(res, 200, { pulls });
        return;
      }

      if (method === 'POST' && pathname === '/api/github/pulls') {
        const body = await readJsonBody(req);
        const created = await service.createPullRequest({
          title: body.title,
          head: body.head,
          base: body.base,
          body: body.body,
          owner: body.owner || owner,
          repo: body.repo || repo,
        });
        sendJson(res, 201, created);
        return;
      }

      const prMatch = pathname.match(/^\/api\/github\/pulls\/(\d+)$/);
      if (method === 'PATCH' && prMatch) {
        const body = await readJsonBody(req);
        const updated = await service.updatePullRequest({
          pullNumber: Number(prMatch[1]),
          title: body.title,
          body: body.body,
          state: body.state,
          owner: body.owner || owner,
          repo: body.repo || repo,
        });
        sendJson(res, 200, updated);
        return;
      }

      const mergeMatch = pathname.match(/^\/api\/github\/pulls\/(\d+)\/merge$/);
      if (method === 'PUT' && mergeMatch) {
        const body = await readJsonBody(req);
        const merged = await service.mergePullRequest({
          pullNumber: Number(mergeMatch[1]),
          commitTitle: body.commitTitle,
          mergeMethod: body.mergeMethod,
          owner: body.owner || owner,
          repo: body.repo || repo,
        });
        sendJson(res, 200, merged);
        return;
      }

      if (method === 'GET' && pathname === '/api/github/actions/runs') {
        const branch = parsedUrl.searchParams.get('branch') || undefined;
        const perPage = parsedUrl.searchParams.get('perPage') || undefined;
        const runs = await service.listActionRuns({ branch, perPage, owner, repo });
        sendJson(res, 200, { runs });
        return;
      }

      const jobsMatch = pathname.match(/^\/api\/github\/actions\/runs\/(\d+)\/jobs$/);
      if (method === 'GET' && jobsMatch) {
        const jobs = await service.listRunJobs({
          runId: Number(jobsMatch[1]),
          owner,
          repo,
        });
        sendJson(res, 200, { jobs });
        return;
      }

      sendJson(res, 404, { error: 'Unknown GitHub API route' });
    } catch (err) {
      const statusCode = Number.isInteger(err?.status) ? err.status : 400;
      sendJson(res, statusCode, {
        error: err?.message || 'GitHub API request failed',
        acceptedPermissions: err?.acceptedPermissions || undefined,
        oauthScopes: err?.oauthScopes || undefined,
      });
    }
  };
}
