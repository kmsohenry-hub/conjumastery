/* global process */

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url);
const BUDGETS = {
  html: 30 * 1024,
  css: 30 * 1024,
  js: 180 * 1024,
};

const files = await readdir(DIST.pathname, { recursive: true });
const assets = [];

for (const relative of files) {
  const path = join(DIST.pathname, relative);
  const info = await stat(path);
  if (!info.isFile()) continue;

  const extension = relative.endsWith('.html')
    ? 'html'
    : relative.endsWith('.css')
      ? 'css'
      : relative.endsWith('.js')
        ? 'js'
        : null;
  if (extension) assets.push({ relative, extension, size: info.size });
}

const violations = assets.filter(({ extension, size }) => size > BUDGETS[extension]);
for (const asset of assets) {
  const budget = BUDGETS[asset.extension];
  process.stdout.write(
    `${asset.relative}: ${(asset.size / 1024).toFixed(1)} KiB / ${(budget / 1024).toFixed(0)} KiB\n`,
  );
}

if (violations.length) {
  console.error('Performance budget exceeded:');
  for (const violation of violations) {
    console.error(
      `- ${violation.relative}: ${(violation.size / 1024).toFixed(1)} KiB > ${(BUDGETS[violation.extension] / 1024).toFixed(0)} KiB`,
    );
  }
  process.exit(1);
}
