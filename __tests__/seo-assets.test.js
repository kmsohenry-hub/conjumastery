import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppServer } from '../server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

describe('SEO crawlability and indexing assets', () => {
  test('robots.txt allows crawling and references the canonical sitemap', () => {
    const robots = fs.readFileSync(path.join(ROOT_DIR, 'public', 'robots.txt'), 'utf8');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://conjumastery.vercel.app/sitemap.xml');
  });

  test('sitemap.xml and sitemap-netlify.xml declare valid URL entries for both deployments', () => {
    const vercelSitemap = fs.readFileSync(path.join(ROOT_DIR, 'public', 'sitemap.xml'), 'utf8');
    const netlifySitemap = fs.readFileSync(
      path.join(ROOT_DIR, 'public', 'sitemap-netlify.xml'),
      'utf8',
    );

    expect(vercelSitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(vercelSitemap).toContain('<loc>https://conjumastery.vercel.app/</loc>');

    expect(netlifySitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(netlifySitemap).toContain('<loc>https://conjumastery.netlify.app/</loc>');
  });

  test('index.html exposes SEO metadata, Open Graph, Twitter Card, apple-touch-icon, canonical link, and verification tags', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    expect(html).toContain('<meta name="robots" content="index, follow" />');
    expect(html).toContain('<link rel="canonical" href="https://conjumastery.vercel.app/" />');
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta property="og:url" content="https://conjumastery.vercel.app/" />');
    expect(html).toContain('<meta name="twitter:card" content="summary" />');
    expect(html).toContain('<link rel="apple-touch-icon" href="icons/icon-192.png" />');
    expect(html).toContain('name="description"');
    expect(html).toContain('content="Ao0PW3Z1nU193rP3f1bMfoqTUAtOh81CKwCtv2AyCq4"');
    expect(html).toContain('content="a96gsFhr3t7HvbMZRkuJnywY8k_6W0ygjASKOQOMn6I"');
  });

  test('vercel.json and netlify.toml build dist/ with security headers and without altering routing', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));
    expect(vercel.buildCommand).toBe('npm run build');
    expect(vercel.outputDirectory).toBe('dist');
    expect(vercel.rewrites).toBeUndefined();
    expect(vercel.redirects).toBeUndefined();
    const vercelHeaderKeys = vercel.headers.flatMap((rule) => rule.headers.map((h) => h.key));
    expect(vercelHeaderKeys).toContain('X-Frame-Options');
    expect(vercelHeaderKeys).toContain('X-Content-Type-Options');
    expect(vercelHeaderKeys).toContain('Content-Security-Policy');

    const netlify = fs.readFileSync(path.join(ROOT_DIR, 'netlify.toml'), 'utf8');
    expect(netlify).toContain('command = "npm run build"');
    expect(netlify).toContain('publish = "dist"');
    expect(netlify).toContain('NODE_VERSION = "24"');
    expect(netlify).toContain('X-Frame-Options = "DENY"');
    expect(netlify).toContain('X-Content-Type-Options = "nosniff"');
    expect(netlify).toContain("frame-ancestors 'none'");
    expect(netlify).not.toContain('[[redirects]]');
  });

  test('createAppServer serves robots.txt and sitemap.xml with accurate MIME types', async () => {
    const tmpDist = fs.mkdtempSync(path.join(os.tmpdir(), 'conjumaster-seo-'));
    fs.writeFileSync(path.join(tmpDist, 'index.html'), '<!doctype html><html></html>', 'utf8');
    fs.copyFileSync(path.join(ROOT_DIR, 'public', 'robots.txt'), path.join(tmpDist, 'robots.txt'));
    fs.copyFileSync(
      path.join(ROOT_DIR, 'public', 'sitemap.xml'),
      path.join(tmpDist, 'sitemap.xml'),
    );

    const server = createAppServer({ distDir: tmpDist });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
      const robotsRes = await fetch(`http://127.0.0.1:${port}/robots.txt`);
      expect(robotsRes.status).toBe(200);
      expect(robotsRes.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(await robotsRes.text()).toContain('Allow: /');

      const sitemapRes = await fetch(`http://127.0.0.1:${port}/sitemap.xml`);
      expect(sitemapRes.status).toBe(200);
      expect(sitemapRes.headers.get('content-type')).toBe('application/xml; charset=utf-8');
      expect(await sitemapRes.text()).toContain('https://conjumastery.vercel.app/');
    } finally {
      await new Promise((resolve) => server.close(resolve));
      fs.rmSync(tmpDist, { recursive: true, force: true });
    }
  });
});
