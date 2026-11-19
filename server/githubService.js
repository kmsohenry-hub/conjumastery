/* global process, Buffer */

const GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_OWNER = 'kmsohenry-hub';
const DEFAULT_REPO = 'conjumastery';
const SAFE_SEGMENT_RE = /^[A-Za-z0-9_.-]+$/;
const SAFE_BRANCH_RE = /^[A-Za-z0-9._/-]+$/;

function sanitizeText(text, token) {
  const str = String(text ?? '');
  if (!token) {
    return str;
  }
  return str.split(token).join('[REDACTED]');
}

function validateRepo(owner = DEFAULT_OWNER, repo = DEFAULT_REPO) {
  if (!SAFE_SEGMENT_RE.test(owner) || !SAFE_SEGMENT_RE.test(repo)) {
    throw new Error('Invalid repository owner or name');
  }
  return { owner, repo };
}

function validateBranchName(branch) {
  if (
    typeof branch !== 'string' ||
    !branch ||
    branch.includes('..') ||
    branch.startsWith('/') ||
    branch.endsWith('/') ||
    !SAFE_BRANCH_RE.test(branch)
  ) {
    throw new Error('Invalid branch name');
  }
  return branch;
}

function validateRepoPath(filePath) {
  if (
    typeof filePath !== 'string' ||
    !filePath ||
    filePath.startsWith('/') ||
    filePath.includes('..') ||
    filePath.includes('\0')
  ) {
    throw new Error('Invalid repository file path');
  }
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

export function createGitHubService({
  getToken = () => process.env.GITHUB_TOKEN,
  fetchImpl = fetch,
  owner: defaultOwner = DEFAULT_OWNER,
  repo: defaultRepo = DEFAULT_REPO,
} = {}) {
  function readToken() {
    const raw = getToken();
    const token = typeof raw === 'string' ? raw.trim() : '';
    if (!token) {
      const err = new Error('GITHUB_TOKEN is not configured in the server environment');
      err.status = 503;
      throw err;
    }
    return token;
  }

  async function request(method, apiPath, { body, allowStatuses = [] } = {}) {
    const token = readToken();
    const url = `${GITHUB_API_BASE}${apiPath}`;
    const headers = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'ConjuMaster-Server-GitHub-Integration',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const init = { method, headers };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetchImpl(url, init);
    } catch (networkErr) {
      const err = new Error(`GitHub network error: ${sanitizeText(networkErr?.message, token)}`);
      err.status = 502;
      throw err;
    }

    const rawText = await response.text();
    let parsed = null;
    if (rawText) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = { message: sanitizeText(rawText, token) };
      }
    }

    const scopesHeader = response.headers.get('x-oauth-scopes');
    const acceptedPermsHeader = response.headers.get('x-accepted-github-permissions');
    const rateRemaining = response.headers.get('x-ratelimit-remaining');

    if (!response.ok && !allowStatuses.includes(response.status)) {
      const detail = sanitizeText(parsed?.message || response.statusText, token);
      const err = new Error(`GitHub API ${response.status}: ${detail}`);
      err.status = response.status;
      err.acceptedPermissions = acceptedPermsHeader || null;
      err.oauthScopes = scopesHeader || null;
      throw err;
    }

    return {
      status: response.status,
      ok: response.ok,
      data: parsed,
      oauthScopes: scopesHeader
        ? scopesHeader
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      acceptedPermissions: acceptedPermsHeader || null,
      rateLimitRemaining: rateRemaining !== null ? Number(rateRemaining) : null,
    };
  }

  async function getStatus({ owner = defaultOwner, repo = defaultRepo } = {}) {
    const target = validateRepo(owner, repo);
    const hasToken = Boolean(typeof getToken() === 'string' && getToken().trim());
    if (!hasToken) {
      return {
        configured: false,
        authenticated: false,
        repository: `${target.owner}/${target.repo}`,
        error: 'GITHUB_TOKEN is missing in server process.env',
      };
    }

    const userRes = await request('GET', '/user', { allowStatuses: [401, 403] });
    const repoRes = await request('GET', `/repos/${target.owner}/${target.repo}`, {
      allowStatuses: [401, 403, 404],
    });

    return {
      configured: true,
      authenticated: userRes.ok,
      user: userRes.ok ? { login: userRes.data?.login, type: userRes.data?.type } : null,
      userStatus: userRes.status,
      userError: userRes.ok ? null : userRes.data?.message || null,
      oauthScopes: userRes.oauthScopes,
      rateLimitRemaining: repoRes.rateLimitRemaining ?? userRes.rateLimitRemaining,
      repository: `${target.owner}/${target.repo}`,
      repoStatus: repoRes.status,
      repoAccessible: repoRes.ok,
      repoError: repoRes.ok ? null : repoRes.data?.message || null,
      defaultBranch: repoRes.ok ? repoRes.data?.default_branch : null,
      permissions: repoRes.ok ? repoRes.data?.permissions || null : null,
    };
  }

  async function getContent({ path, ref, owner = defaultOwner, repo = defaultRepo }) {
    const target = validateRepo(owner, repo);
    const safePath = validateRepoPath(path);
    const query = ref ? `?ref=${encodeURIComponent(validateBranchName(ref))}` : '';
    const res = await request(
      'GET',
      `/repos/${target.owner}/${target.repo}/contents/${safePath}${query}`,
    );
    const item = res.data;
    if (Array.isArray(item)) {
      return item.map((entry) => ({
        name: entry.name,
        path: entry.path,
        type: entry.type,
        sha: entry.sha,
        size: entry.size,
      }));
    }
    const decoded =
      item?.encoding === 'base64' && typeof item.content === 'string'
        ? Buffer.from(item.content.replace(/\n/g, ''), 'base64').toString('utf8')
        : null;
    return {
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      encoding: item.encoding,
      content: decoded,
    };
  }

  async function listBranches({ owner = defaultOwner, repo = defaultRepo } = {}) {
    const target = validateRepo(owner, repo);
    const res = await request('GET', `/repos/${target.owner}/${target.repo}/branches?per_page=100`);
    return (res.data || []).map((b) => ({
      name: b.name,
      sha: b.commit?.sha,
      protected: Boolean(b.protected),
    }));
  }

  async function createBranch({ branch, fromBranch, owner = defaultOwner, repo = defaultRepo }) {
    const target = validateRepo(owner, repo);
    const safeBranch = validateBranchName(branch);
    let sourceBranch = fromBranch ? validateBranchName(fromBranch) : null;

    if (!sourceBranch) {
      const repoRes = await request('GET', `/repos/${target.owner}/${target.repo}`);
      sourceBranch = repoRes.data.default_branch;
    }

    const refRes = await request(
      'GET',
      `/repos/${target.owner}/${target.repo}/git/ref/heads/${encodeURIComponent(sourceBranch)}`,
    );
    const baseSha = refRes.data.object.sha;

    const createRes = await request('POST', `/repos/${target.owner}/${target.repo}/git/refs`, {
      body: {
        ref: `refs/heads/${safeBranch}`,
        sha: baseSha,
      },
    });
    return {
      ref: createRes.data.ref,
      sha: createRes.data.object?.sha || baseSha,
      fromBranch: sourceBranch,
    };
  }

  async function upsertFile({
    path,
    content,
    message,
    branch,
    sha,
    owner = defaultOwner,
    repo = defaultRepo,
  }) {
    const target = validateRepo(owner, repo);
    const safePath = validateRepoPath(path);
    const safeBranch = validateBranchName(branch);
    if (typeof content !== 'string') {
      throw new Error('File content must be a string');
    }
    if (typeof message !== 'string' || !message.trim()) {
      throw new Error('Commit message is required');
    }

    const body = {
      message: message.trim(),
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: safeBranch,
    };
    if (sha) {
      body.sha = sha;
    }

    const res = await request('PUT', `/repos/${target.owner}/${target.repo}/contents/${safePath}`, {
      body,
    });
    return {
      path: res.data.content?.path,
      sha: res.data.content?.sha,
      commitSha: res.data.commit?.sha,
      commitUrl: res.data.commit?.html_url,
    };
  }

  async function createCommit({
    branch,
    message,
    files,
    baseSha = null,
    owner = defaultOwner,
    repo = defaultRepo,
  }) {
    const target = validateRepo(owner, repo);
    const safeBranch = validateBranchName(branch);
    if (typeof message !== 'string' || !message.trim()) {
      throw new Error('Commit message is required');
    }
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('At least one file entry is required');
    }

    let parentSha = baseSha;
    if (!parentSha) {
      const refRes = await request(
        'GET',
        `/repos/${target.owner}/${target.repo}/git/ref/heads/${encodeURIComponent(safeBranch)}`,
      );
      parentSha = refRes.data.object.sha;
    }

    const commitRes = await request(
      'GET',
      `/repos/${target.owner}/${target.repo}/git/commits/${encodeURIComponent(parentSha)}`,
    );
    const baseTreeSha = commitRes.data.tree.sha;

    const treeEntries = [];
    for (const file of files) {
      if (!file || typeof file.path !== 'string' || !file.path || file.path.includes('..')) {
        throw new Error(`Invalid file entry path: ${file?.path}`);
      }
      if (file.delete || file.content === null) {
        treeEntries.push({
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: null,
        });
        continue;
      }
      const encoding = file.encoding === 'base64' ? 'base64' : 'utf-8';
      const blobRes = await request('POST', `/repos/${target.owner}/${target.repo}/git/blobs`, {
        body: {
          content: String(file.content ?? ''),
          encoding,
        },
      });
      treeEntries.push({
        path: file.path,
        mode: file.mode || '100644',
        type: 'blob',
        sha: blobRes.data.sha,
      });
    }

    const newTreeRes = await request('POST', `/repos/${target.owner}/${target.repo}/git/trees`, {
      body: {
        base_tree: baseTreeSha,
        tree: treeEntries,
      },
    });

    const newCommitRes = await request(
      'POST',
      `/repos/${target.owner}/${target.repo}/git/commits`,
      {
        body: {
          message: message.trim(),
          tree: newTreeRes.data.sha,
          parents: [parentSha],
        },
      },
    );

    const updatedRefRes = await request(
      'PATCH',
      `/repos/${target.owner}/${target.repo}/git/refs/heads/${encodeURIComponent(safeBranch)}`,
      {
        body: {
          sha: newCommitRes.data.sha,
          force: false,
        },
      },
    );

    return {
      branch: safeBranch,
      commitSha: newCommitRes.data.sha,
      treeSha: newTreeRes.data.sha,
      ref: updatedRefRes.data.ref,
      url: newCommitRes.data.html_url,
    };
  }

  async function listPullRequests({
    state = 'open',
    owner = defaultOwner,
    repo = defaultRepo,
  } = {}) {
    const target = validateRepo(owner, repo);
    const allowedState = ['open', 'closed', 'all'].includes(state) ? state : 'open';
    const res = await request(
      'GET',
      `/repos/${target.owner}/${target.repo}/pulls?state=${allowedState}&per_page=50`,
    );
    return (res.data || []).map((pr) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      head: pr.head?.ref,
      headSha: pr.head?.sha,
      base: pr.base?.ref,
      url: pr.html_url,
    }));
  }

  async function createPullRequest({
    title,
    head,
    base = 'main',
    body = '',
    owner = defaultOwner,
    repo = defaultRepo,
  }) {
    const target = validateRepo(owner, repo);
    const res = await request('POST', `/repos/${target.owner}/${target.repo}/pulls`, {
      body: {
        title: String(title || '').trim(),
        head: validateBranchName(head),
        base: validateBranchName(base),
        body: String(body || ''),
      },
    });
    return {
      number: res.data.number,
      title: res.data.title,
      state: res.data.state,
      url: res.data.html_url,
    };
  }

  async function updatePullRequest({
    pullNumber,
    title,
    body,
    state,
    owner = defaultOwner,
    repo = defaultRepo,
  }) {
    const target = validateRepo(owner, repo);
    const num = Number(pullNumber);
    if (!Number.isInteger(num) || num <= 0) {
      throw new Error('Invalid pull request number');
    }
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (body !== undefined) payload.body = body;
    if (state !== undefined) payload.state = state;

    const res = await request('PATCH', `/repos/${target.owner}/${target.repo}/pulls/${num}`, {
      body: payload,
    });
    return {
      number: res.data.number,
      title: res.data.title,
      state: res.data.state,
      url: res.data.html_url,
    };
  }

  async function mergePullRequest({
    pullNumber,
    commitTitle,
    mergeMethod = 'squash',
    owner = defaultOwner,
    repo = defaultRepo,
  }) {
    const target = validateRepo(owner, repo);
    const num = Number(pullNumber);
    if (!Number.isInteger(num) || num <= 0) {
      throw new Error('Invalid pull request number');
    }
    const method = ['merge', 'squash', 'rebase'].includes(mergeMethod) ? mergeMethod : 'squash';
    const payload = { merge_method: method };
    if (commitTitle) {
      payload.commit_title = commitTitle;
    }

    const res = await request('PUT', `/repos/${target.owner}/${target.repo}/pulls/${num}/merge`, {
      body: payload,
    });
    return {
      merged: Boolean(res.data.merged),
      sha: res.data.sha,
      message: res.data.message,
    };
  }

  async function listActionRuns({
    branch,
    perPage = 10,
    owner = defaultOwner,
    repo = defaultRepo,
  } = {}) {
    const target = validateRepo(owner, repo);
    const limit = Math.min(Math.max(Number(perPage) || 10, 1), 50);
    const branchParam = branch ? `&branch=${encodeURIComponent(validateBranchName(branch))}` : '';
    const res = await request(
      'GET',
      `/repos/${target.owner}/${target.repo}/actions/runs?per_page=${limit}${branchParam}`,
    );
    return (res.data?.workflow_runs || []).map((run) => ({
      id: run.id,
      name: run.name,
      headBranch: run.head_branch,
      headSha: run.head_sha,
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
    }));
  }

  async function listRunJobs({ runId, owner = defaultOwner, repo = defaultRepo }) {
    const target = validateRepo(owner, repo);
    const id = Number(runId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid workflow run id');
    }
    const res = await request(
      'GET',
      `/repos/${target.owner}/${target.repo}/actions/runs/${id}/jobs`,
    );
    return (res.data?.jobs || []).map((job) => ({
      id: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      steps: (job.steps || []).map((s) => ({
        name: s.name,
        status: s.status,
        conclusion: s.conclusion,
      })),
    }));
  }

  return {
    getStatus,
    getContent,
    listBranches,
    createBranch,
    upsertFile,
    createCommit,
    listPullRequests,
    createPullRequest,
    updatePullRequest,
    mergePullRequest,
    listActionRuns,
    listRunJobs,
  };
}
