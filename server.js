/* global process */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
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

const githubMiddleware = createGitHubMiddleware();

export function createAppServer({ distDir = DIST_DIR, middleware = githubMiddleware } = {}) {
  return createServer(async (req, res) => {
    const reqUrl = req.url || '/';
    if (reqUrl.startsWith('/api/github')) {
      await middleware(req, res);
      return;
    }

    const pathname = new URL(reqUrl, 'http://localhost').pathname;
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const resolved = resolve(distDir, relative);
    const targetPath = resolved.startsWith(distDir) ? resolved : join(distDir, 'index.html');

    try {
      const info = await stat(targetPath);
      const filePath = info.isDirectory() ? join(targetPath, 'index.html') : targetPath;
      const content = await readFile(filePath);
      const mime = MIME_TYPES[extname(filePath)] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', mime);
      res.end(content);
    } catch {
      try {
        const fallback = await readFile(join(distDir, 'index.html'));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(fallback);
      } catch {
        res.statusCode = 404;
        res.end('Not found');
      }
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createAppServer();
  server.listen(PORT, HOST);
}
