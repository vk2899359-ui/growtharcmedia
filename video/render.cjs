// usage: node render.js <outDir> <fps> [startFrame endFrame] [t1,t2,... for stills]
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const [,, out, fpsA, a, b, stills] = process.argv; const fps = +fpsA || 30;
const srv = http.createServer((q, r) => { const f = path.join(__dirname, q.url.split('?')[0].slice(1) || 'scene.html'); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': f.endsWith('.json') ? 'application/json' : 'text/html' }); r.end(d); } }); });
srv.listen(0, async () => {
  const port = srv.address().port; fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  pg.on('pageerror', e => console.error('PAGEERR', e.message)); pg.on('console', m => m.type() === 'error' && console.error('CONSOLE', m.text()));
  await pg.goto(`http://localhost:${port}/scene.html`); await pg.waitForFunction('window.READY'); await pg.evaluate(() => document.fonts.ready);
  if (stills) { for (const t of stills.split(',')) { await pg.evaluate(t => render(t), +t); await pg.screenshot({ path: `${out}/still_${t}.jpg`, type: 'jpeg', quality: 90 }); } }
  else for (let i = +a; i < +b; i++) { await pg.evaluate(t => render(t), i / fps); await pg.screenshot({ path: `${out}/f${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 }); }
  await br.close(); srv.close();
});
