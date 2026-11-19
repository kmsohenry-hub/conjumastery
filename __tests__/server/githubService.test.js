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
});
