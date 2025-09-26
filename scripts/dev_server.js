#!/usr/bin/env node
/**
 * Minimal static dev server with:
 * - ETag + caching control
 * - Basic 404 fallback
 * - Content-Type detection
 * - Prevent directory listing
 * - Adds small security headers
 */
import http from 'http';
import { stat, readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import url from 'url';

const root = process.cwd();
const PORT = process.env.PORT || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function etag(buffer){
  return 'W/"' + crypto.createHash('sha1').update(buffer).digest('base64').substring(0,20) + '"';
}

const server = http.createServer(async (req,res) => {
  try {
    const parsed = url.parse(req.url || '/');
    let pathname = decodeURIComponent(parsed.pathname);
    if(pathname.endsWith('/')) pathname += 'index.html';
    if(pathname.includes('..')) { res.writeHead(400); return res.end('Bad path'); }
    const filePath = path.join(root, pathname.replace(/^\//,''));
    const st = await stat(filePath).catch(()=>null);
    if(!st || !st.isFile()) {
      if(path.extname(filePath) === '.html'){ res.writeHead(404, {'content-type':'text/html'}); return res.end('<h1>404</h1>'); }
      // Try SPA style fallback to index.html if exists
      const idx = path.join(root,'index.html');
      const hasIdx = await stat(idx).catch(()=>null);
      if(hasIdx){
        const buf = await readFile(idx);
        const tag = etag(buf);
        if(req.headers['if-none-match'] === tag){ res.writeHead(304); return res.end(); }
        res.writeHead(200, {'content-type':'text/html; charset=utf-8','etag':tag,'cache-control':'no-cache'});
        return res.end(buf);
      }
      res.writeHead(404); return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    // Cache policy: immutable for assets except JSON (data) & HTML/JS which we no-cache for dev
    const isData = ext === '.json';
    const isHtml = ext === '.html';
    const isJs = ext === '.js' || ext === '.mjs';
    const cacheControl = (isData || isHtml || isJs) ? 'no-cache' : 'public, max-age=31536000, immutable';
    const buf = await readFile(filePath);
    const tag = etag(buf);
    if(req.headers['if-none-match'] === tag){ res.writeHead(304); return res.end(); }
    res.writeHead(200, {
      'content-type': mime,
      'etag': tag,
      'cache-control': cacheControl,
      'x-dev-server': 'simple-static',
      'referrer-policy': 'no-referrer',
      'cross-origin-opener-policy': 'same-origin'
    });
    res.end(buf);
  } catch (e){
    console.error('Dev server error', e);
    res.writeHead(500); res.end('Internal error');
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
