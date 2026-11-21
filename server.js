/* global process */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { createGitHubMiddleware } from './server/githubMiddleware.js';

const DIST_DIR = resolve(process.cwd(), 'dist');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function applyStaticHeaders(res, filePath, distRoot) {
  const mime = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
  const rel = filePath.slice(distRoot.length).replaceAll('\\', '/');
  if (rel.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (rel === '/index.html' || rel === '/sw.js' || filePath.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}

function isWithinDirectory(candidatePath, baseDir) {
  return candidatePath === baseDir || candidatePath.startsWith(baseDir + sep);
}

const githubMiddleware = createGitHubMiddleware();

export function createAppServer({ distDir = DIST_DIR, middleware = githubMiddleware } = {}) {
  const normalizedDistDir = resolve(distDir);
  const indexHtmlPath = join(normalizedDistDir, 'index.html');

  return createServer(async (req, res) => {
    const reqUrl = req.url || '/';
    if (reqUrl.startsWith('/api/github')) {
      await middleware(req, res);
      return;
    }

    const method = (req.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      res.statusCode = 405;
      res.setHeader('Allow', 'GET, HEAD');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Method Not Allowed');
      return;
    }

    let decodedPathname;
    try {
      const parsed = new URL(reqUrl, 'http://localhost');
      decodedPathname = decodeURIComponent(parsed.pathname);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Bad Request');
      return;
    }

    if (decodedPathname.includes('\0')) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Bad Request');
      return;
    }

    const relative = decodedPathname === '/' ? 'index.html' : decodedPathname.replace(/^\/+/, '');
    const resolved = resolve(normalizedDistDir, relative);
    const targetPath = isWithinDirectory(resolved, normalizedDistDir) ? resolved : indexHtmlPath;

    try {
      const info = await stat(targetPath);
      const filePath = info.isDirectory() ? join(targetPath, 'index.html') : targetPath;
      if (!isWithinDirectory(filePath, normalizedDistDir)) {
        throw new Error('Path outside dist directory');
      }
      const content = await readFile(filePath);
      res.statusCode = 200;
      applyStaticHeaders(res, filePath, normalizedDistDir);
      res.end(method === 'HEAD' ? undefined : content);
    } catch {
      try {
        const fallback = await readFile(indexHtmlPath);
        res.statusCode = 200;
        applyStaticHeaders(res, indexHtmlPath, normalizedDistDir);
        res.end(method === 'HEAD' ? undefined : fallback);
      } catch {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(method === 'HEAD' ? undefined : 'Not found');
      }
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createAppServer();
  server.listen(PORT, HOST);
}
