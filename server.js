/* global process */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
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
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const HTML_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

const STATIC_ASSET_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.css',
  '.map',
  '.json',
  '.webmanifest',
  '.png',
  '.svg',
  '.ico',
  '.jpg',
  '.jpeg',
  '.webp',
  '.woff',
  '.woff2',
  '.txt',
  '.xml',
]);

function applySecurityHeaders(res) {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(header, value);
  }
}

function sendTextError(res, statusCode, message, method = 'GET') {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  applySecurityHeaders(res);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(method === 'HEAD' ? undefined : message);
}

function applyStaticHeaders(res, filePath, distRoot) {
  const mime = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  applySecurityHeaders(res);
  const rel = filePath.slice(distRoot.length).replaceAll('\\', '/');
  if (rel.startsWith('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (rel === '/index.html' || rel === '/sw.js' || filePath.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  if (filePath.endsWith('.html')) {
    res.setHeader('Content-Security-Policy', HTML_CSP);
  }
}

function isWithinDirectory(candidatePath, baseDir) {
  return candidatePath === baseDir || candidatePath.startsWith(baseDir + sep);
}

const githubMiddleware = createGitHubMiddleware();

export function createAppServer({ distDir = DIST_DIR, middleware = githubMiddleware } = {}) {
  const normalizedDistDir = resolve(distDir);
  const indexHtmlPath = join(normalizedDistDir, 'index.html');

  const server = createServer(async (req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    try {
      const reqUrl = req.url || '/';
      if (
        reqUrl === '/api/github' ||
        reqUrl.startsWith('/api/github/') ||
        reqUrl.startsWith('/api/github?')
      ) {
        await middleware(req, res);
        return;
      }

      if (method !== 'GET' && method !== 'HEAD') {
        res.setHeader('Allow', 'GET, HEAD');
        sendTextError(res, 405, 'Method Not Allowed', method);
        return;
      }

      let decodedPathname;
      try {
        const parsed = new URL(reqUrl, 'http://localhost');
        decodedPathname = decodeURIComponent(parsed.pathname);
      } catch {
        sendTextError(res, 400, 'Bad Request', method);
        return;
      }

      if (decodedPathname.includes('\0')) {
        sendTextError(res, 400, 'Bad Request', method);
        return;
      }

      const relative = decodedPathname === '/' ? 'index.html' : decodedPathname.replace(/^\/+/, '');
      const resolved = resolve(normalizedDistDir, relative);
      const inDist = isWithinDirectory(resolved, normalizedDistDir);
      const targetPath = inDist ? resolved : indexHtmlPath;

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
        const requestedExt = extname(decodedPathname).toLowerCase();
        const isTraversalProbe = reqUrl.includes('..') || /%2e%2e/i.test(reqUrl);
        if (inDist && !isTraversalProbe && STATIC_ASSET_EXTENSIONS.has(requestedExt)) {
          sendTextError(res, 404, 'Not found', method);
          return;
        }
        try {
          const fallback = await readFile(indexHtmlPath);
          res.statusCode = 200;
          applyStaticHeaders(res, indexHtmlPath, normalizedDistDir);
          res.end(method === 'HEAD' ? undefined : fallback);
        } catch {
          sendTextError(res, 404, 'Not found', method);
        }
      }
    } catch {
      if (!res.headersSent) {
        sendTextError(res, 500, 'Internal Server Error', method);
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  });

  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createAppServer();
  server.listen(PORT, HOST);
}
