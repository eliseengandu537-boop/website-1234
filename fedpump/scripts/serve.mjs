import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const target = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    const contents = await fs.readFile(target);
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(contents);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Page not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Fedpump preview: http://127.0.0.1:${port}`));
