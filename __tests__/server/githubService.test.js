// @vitest-environment node
/* global Buffer, Response */

import { describe, expect, test, vi } from 'vitest';
import { createGitHubService } from '../../server/githubService.js';

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(data === null ? '' : JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

describe('server githubService', () => {
  test('reports missing token without throwing on getStatus', async () => {
    const service = createGitHubService({ getToken: () => '' });
    const status = await service.getStatus();

    expect(status).toEqual({
      configured: false,
      authenticated: false,
      repository: 'kmsohenry-hub/conjumastery',
      error: 'GITHUB_TOKEN is missing in server process.env',
    });
  });

  test('verifies token status, scopes, and repo permissions without exposing token', async () => {
    const secret = 'ghp_super_secret_token_value';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ login: 'kmsohenry-hub', type: 'User' }, 200, {
          'x-oauth-scopes': 'repo, workflow',
          'x-ratelimit-remaining': '4999',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            default_branch: 'main',
            permissions: { admin: true, push: true, pull: true },
          },
          200,
          { 'x-ratelimit-remaining': '4998' },
        ),
      );

    const service = createGitHubService({
      getToken: () => `  ${secret}  `,
      fetchImpl: fetchMock,
    });

    const status = await service.getStatus();
    expect(status.configured).toBe(true);
    expect(status.authenticated).toBe(true);
    expect(status.user).toEqual({ login: 'kmsohenry-hub', type: 'User' });
    expect(status.oauthScopes).toEqual(['repo', 'workflow']);
    expect(status.permissions).toEqual({ admin: true, push: true, pull: true });
    expect(status.defaultBranch).toBe('main');
    expect(JSON.stringify(status)).not.toContain(secret);

    const [, firstInit] = fetchMock.mock.calls[0];
    expect(firstInit.headers.Authorization).toBe(`Bearer ${secret}`);
  });

  test('redacts token if GitHub or network errors ever echo it', async () => {
    const secret = 'ghp_leak_test_value';
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error(`failed with ${secret}`))
      .mockResolvedValueOnce(
        new Response(`unauthorized ${secret}`, { status: 401, statusText: 'Unauthorized' }),
      );

    const service = createGitHubService({ getToken: () => secret, fetchImpl: fetchMock });

    await expect(service.listBranches()).rejects.toThrow('failed with [REDACTED]');
    await expect(service.listBranches()).rejects.toThrow('unauthorized [REDACTED]');
  });

  test('validates repository identifiers, branch names, and file paths', async () => {
    const service = createGitHubService({ getToken: () => 'tok', fetchImpl: vi.fn() });

    await expect(service.getStatus({ owner: '../bad', repo: 'x' })).rejects.toThrow(
      'Invalid repository',
    );
    await expect(service.createBranch({ branch: 'bad..branch' })).rejects.toThrow(
      'Invalid branch name',
    );
    await expect(service.getContent({ path: '../secret' })).rejects.toThrow(
      'Invalid repository file path',
    );
  });

  test('decodes file content, lists directories, and creates branches/files/commits', async () => {
    const fetchMock = vi
      .fn()
      // getContent file
      .mockResolvedValueOnce(
        jsonResponse({
          name: 'README.md',
          path: 'README.md',
          sha: 'abc123',
          size: 5,
          encoding: 'base64',
          content: Buffer.from('hello', 'utf8').toString('base64'),
        }),
      )
      // getContent directory
      .mockResolvedValueOnce(
        jsonResponse([{ name: 'app.js', path: 'app.js', type: 'file', sha: 's1', size: 10 }]),
      )
      // createBranch -> repo metadata -> ref -> create ref
      .mockResolvedValueOnce(jsonResponse({ default_branch: 'main' }))
      .mockResolvedValueOnce(jsonResponse({ object: { sha: 'base-sha' } }))
      .mockResolvedValueOnce(
        jsonResponse({ ref: 'refs/heads/feat/x', object: { sha: 'base-sha' } }),
      )
      // upsertFile
      .mockResolvedValueOnce(
        jsonResponse({
          content: { path: 'a.txt', sha: 'new-file-sha' },
          commit: { sha: 'commit-1', html_url: 'https://github.com/c/1' },
        }),
      )
      // createCommit -> ref -> parent commit -> blob -> tree -> commit -> patch ref
      .mockResolvedValueOnce(jsonResponse({ object: { sha: 'parent-sha' } }))
      .mockResolvedValueOnce(jsonResponse({ tree: { sha: 'base-tree-sha' } }))
      .mockResolvedValueOnce(jsonResponse({ sha: 'blob-1' }))
      .mockResolvedValueOnce(jsonResponse({ sha: 'tree-1' }))
      .mockResolvedValueOnce(jsonResponse({ sha: 'commit-2', html_url: 'https://github.com/c/2' }))
      .mockResolvedValueOnce(jsonResponse({ ref: 'refs/heads/feat/x' }));

    const service = createGitHubService({ getToken: () => 'tok', fetchImpl: fetchMock });

    const file = await service.getContent({ path: 'README.md', ref: 'main' });
    expect(file.content).toBe('hello');

    const dir = await service.getContent({ path: 'src' });
    expect(dir).toHaveLength(1);

    const branch = await service.createBranch({ branch: 'feat/x' });
    expect(branch).toEqual({ ref: 'refs/heads/feat/x', sha: 'base-sha', fromBranch: 'main' });

    const upserted = await service.upsertFile({
      path: 'a.txt',
      content: 'abc',
      message: 'update a.txt',
      branch: 'feat/x',
      sha: 'old',
    });
    expect(upserted.commitSha).toBe('commit-1');

    const committed = await service.createCommit({
      branch: 'feat/x',
      message: 'batch commit',
      files: [
        { path: 'a.txt', content: 'updated' },
        { path: 'old.txt', content: null, delete: true },
      ],
    });
    expect(committed.commitSha).toBe('commit-2');
    expect(committed.treeSha).toBe('tree-1');
  });

  test('manages pull requests, merges, and GitHub Actions runs/jobs', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse([
          {
            number: 139,
            title: 'PR 139',
            state: 'open',
            head: { ref: 'chore/agent', sha: 'sha1' },
            base: { ref: 'main' },
            html_url: 'https://github.com/pr/139',
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          number: 140,
          title: 'Fix',
          state: 'open',
          html_url: 'https://github.com/pr/140',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          number: 140,
          title: 'Fix 2',
          state: 'open',
          html_url: 'https://github.com/pr/140',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ merged: true, sha: 'm1', message: 'Merged' }))
      .mockResolvedValueOnce(
        jsonResponse({
          workflow_runs: [
            {
              id: 11,
              name: 'CI',
              head_branch: 'main',
              head_sha: 'sha1',
              status: 'completed',
              conclusion: 'success',
              html_url: 'https://github.com/r/11',
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          jobs: [
            {
              id: 22,
              name: 'quality',
              status: 'completed',
              conclusion: 'success',
              steps: [{ name: 'test', status: 'completed', conclusion: 'success' }],
            },
          ],
        }),
      );

    const service = createGitHubService({ getToken: () => 'tok', fetchImpl: fetchMock });

    const prs = await service.listPullRequests({ state: 'open' });
    expect(prs[0].number).toBe(139);

    const createdPr = await service.createPullRequest({
      title: 'Fix',
      head: 'fix/x',
      base: 'main',
      body: 'details',
    });
    expect(createdPr.number).toBe(140);

    const updatedPr = await service.updatePullRequest({ pullNumber: 140, title: 'Fix 2' });
    expect(updatedPr.title).toBe('Fix 2');

    const merged = await service.mergePullRequest({ pullNumber: 140, commitTitle: 'Merge fix' });
    expect(merged.merged).toBe(true);

    const runs = await service.listActionRuns({ branch: 'main' });
    expect(runs[0].conclusion).toBe('success');

    const jobs = await service.listRunJobs({ runId: 11 });
    expect(jobs[0].steps[0].name).toBe('test');
  });

  test('throws 503 when token is missing on authenticated API operations', async () => {
    const service = createGitHubService({ getToken: () => '   ', fetchImpl: vi.fn() });
    await expect(service.listBranches()).rejects.toMatchObject({
      status: 503,
      message: expect.stringContaining('GITHUB_TOKEN is not configured'),
    });
  });

  test('handles partial auth/repo failures in getStatus and non-JSON API errors', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'Bad credentials' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'Not Found' }, 404))
      .mockResolvedValueOnce(
        new Response('<html>Gateway Timeout</html>', {
          status: 504,
          statusText: 'Gateway Timeout',
        }),
      );

    const service = createGitHubService({ getToken: () => 'tok_secret', fetchImpl: fetchMock });

    const status = await service.getStatus();
    expect(status.configured).toBe(true);
    expect(status.authenticated).toBe(false);
    expect(status.user).toBeNull();
    expect(status.userError).toBe('Bad credentials');
    expect(status.repoAccessible).toBe(false);
    expect(status.repoError).toBe('Not Found');
    expect(status.defaultBranch).toBeNull();
    expect(status.permissions).toBeNull();

    await expect(service.listBranches()).rejects.toMatchObject({
      status: 504,
      message: expect.stringContaining('Gateway Timeout'),
    });
  });

  test('enforces strict input validation across branch, file, commit, PR, and actions methods', async () => {
    const fetchMock = vi
      .fn()
      // getContent non-base64
      .mockResolvedValueOnce(
        jsonResponse({ name: 'big.bin', path: 'big.bin', sha: 's', size: 99, encoding: 'none' }),
      )
      // createBranch with explicit fromBranch (skips repo metadata GET)
      .mockResolvedValueOnce(jsonResponse({ object: { sha: 'explicit-sha' } }))
      .mockResolvedValueOnce(jsonResponse({ ref: 'refs/heads/fix/b', object: {} }))
      // upsertFile without sha
      .mockResolvedValueOnce(
        jsonResponse({ content: { path: 'b.txt', sha: 'sb' }, commit: { sha: 'cb' } }),
      )
      // createCommit with explicit baseSha, base64 encoding, and executable mode
      .mockResolvedValueOnce(jsonResponse({ tree: { sha: 'bt' } }))
      .mockResolvedValueOnce(jsonResponse({ sha: 'blob-b64' }))
      .mockResolvedValueOnce(jsonResponse({ sha: 't2' }))
      .mockResolvedValueOnce(jsonResponse({ sha: 'c3', html_url: 'https://github.com/c/3' }))
      .mockResolvedValueOnce(jsonResponse({ ref: 'refs/heads/fix/b' }))
      // listPullRequests invalid state falls back to open
      .mockResolvedValueOnce(jsonResponse([]))
      // updatePullRequest with body & state
      .mockResolvedValueOnce(
        jsonResponse({ number: 5, title: 'T', state: 'closed', html_url: 'https://github.com/5' }),
      )
      // mergePullRequest invalid mergeMethod falls back to squash
      .mockResolvedValueOnce(jsonResponse({ merged: true, sha: 'm2', message: 'ok' }))
      // listActionRuns clamps perPage
      .mockResolvedValueOnce(jsonResponse({ workflow_runs: [] }));

    const service = createGitHubService({ getToken: () => 'tok', fetchImpl: fetchMock });

    await expect(service.createBranch({ branch: '/leading' })).rejects.toThrow('Invalid branch');
    await expect(service.createBranch({ branch: 'trailing/' })).rejects.toThrow('Invalid branch');
    await expect(service.createBranch({ branch: '-dash-branch' })).rejects.toThrow(
      'Invalid branch',
    );
    await expect(service.createBranch({ branch: 'feat.lock' })).rejects.toThrow('Invalid branch');
    await expect(service.getContent({ path: '/abs/path' })).rejects.toThrow(
      'Invalid repository file path',
    );
    await expect(service.getContent({ path: 'dir/' })).rejects.toThrow(
      'Invalid repository file path',
    );
    await expect(service.getContent({ path: 'a\\b' })).rejects.toThrow(
      'Invalid repository file path',
    );
    await expect(service.getContent({ path: 'a//b' })).rejects.toThrow(
      'Invalid repository file path',
    );
    await expect(service.getContent({ path: 'a\0b' })).rejects.toThrow(
      'Invalid repository file path',
    );
    await expect(
      service.upsertFile({ path: 'a.txt', content: 123, message: 'm', branch: 'main' }),
    ).rejects.toThrow('File content must be a string');
    await expect(
      service.upsertFile({ path: 'a.txt', content: 'ok', message: '   ', branch: 'main' }),
    ).rejects.toThrow('Commit message is required');
    await expect(
      service.createCommit({ branch: 'main', message: '', files: [{ path: 'a', content: 'x' }] }),
    ).rejects.toThrow('Commit message is required');
    await expect(service.createCommit({ branch: 'main', message: 'm', files: [] })).rejects.toThrow(
      'At least one file entry is required',
    );
    await expect(
      service.createCommit({
        branch: 'main',
        message: 'm',
        baseSha: 'abc',
        files: [{ path: '../escape.js', content: 'x' }],
      }),
    ).rejects.toThrow('Invalid file entry path');
    await expect(
      service.createCommit({
        branch: 'main',
        message: 'm',
        baseSha: 'abc',
        files: [{ path: 'src/a.js', content: 'x', mode: '999999' }],
      }),
    ).rejects.toThrow('Invalid git file mode');
    await expect(
      service.createPullRequest({ title: '   ', head: 'fix/x', base: 'main' }),
    ).rejects.toThrow('Pull request title is required');
    await expect(service.updatePullRequest({ pullNumber: 0 })).rejects.toThrow(
      'Invalid pull request number',
    );
    await expect(service.mergePullRequest({ pullNumber: -3 })).rejects.toThrow(
      'Invalid pull request number',
    );
    await expect(service.listRunJobs({ runId: 'abc' })).rejects.toThrow('Invalid workflow run id');
    // All validation failures must fail fast before issuing any GitHub network request
    expect(fetchMock).not.toHaveBeenCalled();

    const nonBase64 = await service.getContent({ path: 'big.bin' });
    expect(nonBase64.content).toBeNull();

    const branchFrom = await service.createBranch({ branch: 'fix/b', fromBranch: 'develop' });
    expect(branchFrom).toEqual({
      ref: 'refs/heads/fix/b',
      sha: 'explicit-sha',
      fromBranch: 'develop',
    });

    const created = await service.upsertFile({
      path: 'b.txt',
      content: 'hi',
      message: 'add b',
      branch: 'fix/b',
    });
    expect(created.commitSha).toBe('cb');

    const commitRes = await service.createCommit({
      branch: 'fix/b',
      message: 'binary file',
      baseSha: 'explicit-sha',
      files: [{ path: 'bin/tool', content: 'YWJj', encoding: 'base64', mode: '100755' }],
    });
    expect(commitRes.commitSha).toBe('c3');

    await service.listPullRequests({ state: 'invalid_state' });
    expect(fetchMock.mock.calls[9][0]).toContain('state=open');

    const closedPr = await service.updatePullRequest({
      pullNumber: 5,
      body: 'closing',
      state: 'closed',
    });
    expect(closedPr.state).toBe('closed');

    const mergedPr = await service.mergePullRequest({
      pullNumber: 5,
      mergeMethod: 'invalid_method',
    });
    expect(mergedPr.merged).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[11][1].body).merge_method).toBe('squash');

    await service.listActionRuns({ perPage: 999 });
    expect(fetchMock.mock.calls[12][0]).toContain('per_page=50');
  });

  test('passes an AbortSignal timeout to fetch and maps timeout errors to HTTP 504', async () => {
    const timeoutErr = Object.assign(new Error('The operation timed out'), {
      name: 'TimeoutError',
    });
    const fetchMock = vi.fn().mockRejectedValueOnce(timeoutErr);
    const service = createGitHubService({
      getToken: () => 'tok',
      fetchImpl: fetchMock,
      timeoutMs: 250,
    });

    await expect(service.listBranches()).rejects.toMatchObject({
      message: 'GitHub API request timed out',
      status: 504,
    });
    expect(fetchMock.mock.calls[0][1].signal).toBeDefined();
  });
});
