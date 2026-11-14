/* Local dev server (no dependencies):  node server.js
   Serves the static site and /api/chat using the same handler Vercel uses.
   Put ANTHROPIC_API_KEY in your shell or a .env file first. */
const http = require('http'), fs = require('fs'), path = require('path');
try { fs.readFileSync('.env', 'utf8').split('\n').forEach(l => { const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ''); }); } catch (e) {}
const chat = require('./api/chat.js');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/api/chat') {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', () => { try { req.body = JSON.parse(raw || '{}'); } catch (e) { req.body = {}; } chat(req, res); });
    return;
  }
  let file = path.join(__dirname, url === '/' ? 'index.html' : url);
  if (!file.startsWith(__dirname) || file.includes(path.sep + 'api' + path.sep)) { res.statusCode = 403; return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => console.log('Study Buddy running at http://localhost:' + PORT));
