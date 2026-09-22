#!/usr/bin/env node
// Dependency-free static server for the repo root (Node built-ins only: http, fs, zlib, path, crypto).
// Replaces `python3 -m http.server` for this project – that server was HTTP/1.0, one request per
// connection, uncompressed, and had no caching headers, which a HAR capture over Tailscale showed
// costing ~85 s to first worksheet (see docs/performance-plan.md, step 2). This one adds HTTP/1.1
// keep-alive, gzip for text assets (cached in memory), and ETag/Last-Modified 304s.
//
// Usage:
//   node tools/serve.js         (or) npm run serve
//   SPM_HOST=127.0.0.1 SPM_PORT=8000 node tools/serve.js
//
// Binds to this machine's Tailscale IPv4 address (from `tailscale ip -4`) by default, like
// vite.config.js. Set SPM_HOST to override. Port defaults to 8282; set SPM_PORT to override.
//
// Serves the repo root, so `/site/` maps to `site/index.html` (URLs keep working as before). `/`
// redirects to `/site/`. A directory URL without a trailing slash gets a 301 to add one. Path
// traversal outside the repo root, dotfiles, `node_modules`, and `*.har` files are all blocked (404).
const http = require('http');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PORT = +process.env.SPM_PORT || 8282;

function tailscaleIp() {
  try {
    return execSync('tailscale ip -4', { encoding: 'utf8' }).trim().split('\n')[0];
  } catch (e) {
    throw new Error('Could not get the Tailscale IP (`tailscale ip -4` failed) – is Tailscale running? Or set SPM_HOST.');
  }
}
const HOST = process.env.SPM_HOST || tailscaleIp();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.json', '.txt']);

// path+mtime+size -> { gz: Buffer }
const gzipCache = new Map();

function gzipFor(filePath, stat, raw) {
  const key = filePath + ':' + stat.mtimeMs + ':' + stat.size;
  const hit = gzipCache.get(key);
  if (hit) return hit;
  const gz = zlib.gzipSync(raw, { level: 9 });
  gzipCache.set(key, gz);
  return gz;
}

function safeJoin(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const resolved = path.join(ROOT, normalized);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

function isBlocked(resolved) {
  const rel = path.relative(ROOT, resolved);
  const parts = rel.split(path.sep);
  if (parts.some((p) => p.startsWith('.'))) return true; // dotfiles/dotdirs
  if (parts.includes('node_modules')) return true;
  if (rel.toLowerCase().endsWith('.har')) return true;
  return false;
}

function weakEtag(stat) {
  const hash = crypto.createHash('sha1').update(stat.mtimeMs + ':' + stat.size).digest('hex').slice(0, 16);
  return 'W/"' + hash + '"';
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': Buffer.byteLength('Not found') });
  res.end('Not found');
}

function handle(req, res) {
  const start = process.hrtime.bigint();
  const method = req.method;
  const urlPath = req.url || '/';

  function logAndEnd(status, bytes) {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`${method} ${urlPath} ${status} ${bytes} ${ms.toFixed(1)}ms`);
  }

  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, HEAD' });
    res.end('Method not allowed');
    logAndEnd(405, 0);
    return;
  }

  if (urlPath === '/') {
    res.writeHead(301, { Location: '/site/' });
    res.end();
    logAndEnd(301, 0);
    return;
  }

  let resolved = safeJoin(urlPath);
  if (!resolved || isBlocked(resolved)) {
    send404(res);
    logAndEnd(404, 9);
    return;
  }

  fs.stat(resolved, (err, stat) => {
    if (err) {
      send404(res);
      logAndEnd(404, 9);
      return;
    }

    if (stat.isDirectory()) {
      const pathname = urlPath.split('?')[0];
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: pathname + '/' });
        res.end();
        logAndEnd(301, 0);
        return;
      }
      const indexPath = path.join(resolved, 'index.html');
      fs.stat(indexPath, (err2, indexStat) => {
        if (err2) {
          send404(res);
          logAndEnd(404, 9);
          return;
        }
        serveFile(req, res, indexPath, indexStat, logAndEnd);
      });
      return;
    }

    serveFile(req, res, resolved, stat, logAndEnd);
  });
}

function serveFile(req, res, filePath, stat, logAndEnd) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const etag = weakEtag(stat);
  const lastModified = stat.mtime.toUTCString();

  const inm = req.headers['if-none-match'];
  const ims = req.headers['if-modified-since'];
  let notModified = false;
  if (inm) {
    notModified = inm === etag;
  } else if (ims) {
    const imsDate = new Date(ims);
    notModified = !isNaN(imsDate) && stat.mtime.getTime() <= imsDate.getTime() + 999;
  }

  const baseHeaders = {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    ETag: etag,
    'Last-Modified': lastModified,
    Vary: 'Accept-Encoding',
  };

  if (notModified) {
    res.writeHead(304, baseHeaders);
    res.end();
    logAndEnd(304, 0);
    return;
  }

  const canCompress = COMPRESSIBLE.has(ext);
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const wantsGzip = canCompress && /\bgzip\b/.test(acceptEncoding);

  if (!wantsGzip) {
    const headers = Object.assign({}, baseHeaders, { 'Content-Length': stat.size });
    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      logAndEnd(200, 0);
      return;
    }
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { res.destroy(); logAndEnd(500, 0); });
    stream.pipe(res);
    res.on('finish', () => logAndEnd(200, stat.size));
    return;
  }

  fs.readFile(filePath, (err, raw) => {
    if (err) {
      send404(res);
      logAndEnd(404, 9);
      return;
    }
    const gz = gzipFor(filePath, stat, raw);
    const headers = Object.assign({}, baseHeaders, { 'Content-Encoding': 'gzip', 'Content-Length': gz.length });
    res.writeHead(200, headers);
    if (req.method === 'HEAD') {
      res.end();
      logAndEnd(200, 0);
      return;
    }
    res.end(gz);
    logAndEnd(200, gz.length);
  });
}

const server = http.createServer(handle);
server.keepAliveTimeout = 60000; // ms; Node default is 5000, too short for repeat requests over a slow/high-RTT link
server.headersTimeout = 61000; // must be > keepAliveTimeout

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT} at http://${HOST}:${PORT}/site/`);
});

module.exports = server;
