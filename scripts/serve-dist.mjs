// Minimal static server for QA that mirrors how a static host actually serves
// this build — no SPA fallback.
//
// `vite preview` falls back to index.html for any unmatched path, so a broken
// nested route (/blog/<slug>) silently returned the homepage with a 200 and the
// QA sweep passed. This server resolves an exact file, then <path>/index.html,
// and otherwise returns a real 404 — so routing bugs surface locally instead of
// in production.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
};

async function resolveFile(pathname) {
  // Reject traversal before touching the filesystem.
  const clean = decodeURIComponent(pathname.split('?')[0]);
  if (clean.includes('\0') || clean.includes('..')) return null;

  const candidates = [];
  const direct = join(root, clean);
  if (extname(clean)) {
    candidates.push(direct);
  } else {
    candidates.push(join(direct, 'index.html'));
    candidates.push(direct + '.html');
  }
  if (clean === '/') candidates.unshift(join(root, 'index.html'));

  for (const file of candidates) {
    if (!resolve(file).startsWith(root)) continue;
    try {
      const info = await stat(file);
      if (info.isFile()) return file;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url, 'http://localhost').pathname);

  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const body = await readFile(file);
  const type = TYPES[extname(file)] || 'application/octet-stream';

  // Media elements request byte ranges. Answering a Range request with a plain
  // 200 and the whole body makes Chrome's media stack treat the response as an
  // error, so <video> would fail here for a reason that never applies on a real
  // host — masking whether the file actually plays.
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : body.length - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= body.length) {
      res.writeHead(416, { 'content-range': `bytes */${body.length}` });
      res.end();
      return;
    }

    const slice = body.subarray(start, end + 1);
    res.writeHead(206, {
      'content-type': type,
      'content-length': slice.length,
      'content-range': `bytes ${start}-${end}/${body.length}`,
      'accept-ranges': 'bytes',
    });
    res.end(req.method === 'HEAD' ? undefined : slice);
    return;
  }

  res.writeHead(200, {
    'content-type': type,
    'content-length': body.length,
    'accept-ranges': 'bytes',
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(port, '127.0.0.1', () => {
  console.log(`serve-dist: http://127.0.0.1:${port} (root: ${root})`);
});
