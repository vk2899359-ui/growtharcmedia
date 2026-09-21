// Full-site QA sweep for growtharcmedia.in
//
// Checks every page at every supported breakpoint for console/runtime errors,
// blank renders, horizontal overflow, unreachable header controls, dead links
// and anchors, video-container scale stability under wheel scrolling, the
// refresh/back/forward/direct-URL/new-tab lifecycle, and the modal + drawer.
//
// Usage:  npm run build && npm run preview   (in one shell)
//         npm run qa                          (in another)
//
// Set BASE to point at a different origin, CHROME_PATH to pin a browser binary.

import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://127.0.0.1:4173';
const BLOG_SLUGS = readdirSync(new URL('../blog/', import.meta.url), { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

const PAGES = [
  '/', '/work.html', '/blog',
  ...['brand-strategy','brand-identity','creative-content','digital-marketing','performance-marketing','web-development'].map(s=>`/services/${s}.html`),
  ...['auric-jewels','gemhub','kisaansay','superup-home-solution','kabeer-confectionery','veda-club','akiso','rupeenest-capital'].map(s=>`/work/${s}.html`),
  ...BLOG_SLUGS.map(s=>`/blog/${s}`),
];
const WIDTHS = [360, 375, 390, 768, 1024, 1280, 1440];

// External CDNs are unreachable from this sandbox; don't count them as site bugs.
const EXTERNAL = /fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare|doorsstudio\.com|api\.whatsapp|images\.unsplash\.com|instagram\.com|linkedin\.com/;

const problems = [];
const note = (p) => { problems.push(p); console.log('  ✗ ' + p); };

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}
);

// ---------- Pass 1: every page at every breakpoint ----------
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  console.log(`\n=== ${width}px ===`);
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push('JS: ' + e.message));
    page.on('console', m => { const loc = (m.location() && m.location().url) || ''; if (m.type() === 'error' && !EXTERNAL.test(m.text()) && !EXTERNAL.test(loc)) errs.push('console: ' + m.text() + ' @' + loc); });
    page.on('requestfailed', r => {
      const why = (r.failure() && r.failure().errorText) || '';
      // Media range requests are routinely aborted once enough is buffered.
      if (why === 'net::ERR_ABORTED') return;
      if (!EXTERNAL.test(r.url())) errs.push(`request failed: ${r.url()} (${why})`);
    });

    const resp = await page.goto(BASE + path, { waitUntil: 'load' });
    if (!resp || resp.status() >= 400) note(`${path} @${width} HTTP ${resp && resp.status()}`);
    await page.waitForTimeout(400);

    // blank / broken-render detection
    const info = await page.evaluate(() => {
      const b = document.body;
      const bg = getComputedStyle(b).backgroundColor;
      return {
        height: document.documentElement.scrollHeight,
        text: (b.innerText || '').trim().length,
        bg,
        hOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      };
    });
    if (info.height < 600) note(`${path} @${width} page height only ${info.height}px (blank?)`);
    if (info.text < 400) note(`${path} @${width} almost no text (${info.text} chars)`);
    if (/rgb\(2[0-9]{2}, *[0-9]+, *1[0-9]{2}\)/.test(info.bg) && !/252/.test(info.bg)) note(`${path} @${width} suspicious body bg ${info.bg}`);
    if (info.hOverflow) note(`${path} @${width} horizontal overflow (${info.scrollW} > ${info.innerW})`);

    const unreachable = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('#mobileMenuToggle, .whatsapp-icon-btn, .brand-logo, .header-actions .btn-cta').forEach(el => {
        if (getComputedStyle(el).display === 'none' || el.offsetParent === null) return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) { out.push(`${el.id || el.className} has zero size`); return; }
        if (r.right > window.innerWidth + 1 || r.left < -1) out.push(`${el.id || el.className} outside viewport (${Math.round(r.left)}..${Math.round(r.right)} of ${window.innerWidth})`);
      });
      return out;
    });
    for (const u of unreachable) note(`${path} @${width} ${u}`);

    if (width === 1440) {
      const badLd = await page.$$eval('script[type="application/ld+json"]', els => els.map(el => {
        try { JSON.parse(el.textContent); return null; } catch (e) { return e.message; }
      }).filter(Boolean));
      for (const b of badLd) note(`${path} invalid JSON-LD: ${b}`);
    }

    for (const e of errs) note(`${path} @${width} ${e}`);
    await page.close();
  }
  await ctx.close();
}

// ---------- Pass 2: link integrity (desktop) ----------
console.log('\n=== link integrity ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const internal = new Set();
  const hashLinks = new Map();
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    const links = await page.$$eval('a[href]', as => as.map(a => ({ href: a.getAttribute('href'), text: a.innerText.trim().slice(0,40) })));
    for (const { href, text } of links) {
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      if (href === '#' || href === '') note(`${path} placeholder link "${text}"`);
      const [p, hash] = href.split('#');
      if (p) internal.add(p);
      if (hash) hashLinks.set(`${p || path}#${hash}`, { from: path, target: p || path, hash });
    }
    // dead buttons: anything that looks clickable but has no handler hook
    const deadBtns = await page.$$eval('button', bs => bs
      .filter(b => b.type !== 'submit' && !b.id && !b.className.split(' ').some(c => ['open-modal-btn','mobile-menu-trigger','mobile-close','modal-close','blog-chip'].includes(c)))
      .map(b => b.innerText.trim().slice(0,40)));
    for (const b of deadBtns) note(`${path} button with no handler: "${b}"`);
  }
  for (const target of internal) {
    const r = await page.goto(BASE + target, { waitUntil: 'commit' });
    if (!r || r.status() >= 400) note(`internal link 404: ${target} (HTTP ${r && r.status()})`);
  }
  for (const [key, { from, target, hash }] of hashLinks) {
    await page.goto(BASE + target, { waitUntil: 'load' });
    const found = await page.evaluate(h => !!document.getElementById(h), hash);
    if (!found) note(`dead anchor ${key} (linked from ${from})`);
  }
  await ctx.close();
}

// ---------- Pass 3: video scale stability under wheel scroll ----------
console.log('\n=== video scale stability (homepage, 1440px) ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const measure = () => page.evaluate(() => {
    const out = {};
    document.querySelectorAll('.hero-video-frame, .service-video-frame, .sticky-media-panel, .method-video-frame').forEach((el, i) => {
      const r = el.getBoundingClientRect();
      out[el.className.split(' ')[0] + '#' + i] = { w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
    });
    return out;
  });

  const baseline = await measure();
  const seen = {};
  for (const k of Object.keys(baseline)) seen[k] = { min: baseline[k].w, max: baseline[k].w };

  // slow, fast and reverse wheel passes
  const passes = [ {d:200, n:40}, {d:900, n:15}, {d:-900, n:15}, {d:-200, n:40} ];
  for (const { d, n } of passes) {
    for (let i = 0; i < n; i++) {
      await page.mouse.wheel(0, d);
      await page.waitForTimeout(35);
      const m = await measure();
      for (const k of Object.keys(m)) {
        if (!seen[k]) seen[k] = { min: m[k].w, max: m[k].w };
        seen[k].min = Math.min(seen[k].min, m[k].w);
        seen[k].max = Math.max(seen[k].max, m[k].w);
      }
    }
  }
  for (const [k, v] of Object.entries(seen)) {
    const ratio = v.max / v.min;
    const verdict = ratio <= 1.035 ? 'OK' : 'TOO MUCH';
    console.log(`  ${k}: ${v.min}px → ${v.max}px  (${((ratio-1)*100).toFixed(2)}% swing) ${verdict}`);
    if (ratio > 1.035) note(`video container "${k}" scales ${((ratio-1)*100).toFixed(1)}% on scroll (limit 3.5%)`);
  }
  await ctx.close();
}

// ---------- Pass 4: navigation lifecycle ----------
console.log('\n=== refresh / back / forward / direct / new tab ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.click('a[href="/work.html"]');
  await page.waitForLoadState('load');
  if (!page.url().includes('/work.html')) note('nav to /work.html failed');

  await page.click('a[href="/work/gemhub.html"]');
  await page.waitForLoadState('load');
  await page.reload({ waitUntil: 'load' });
  let txt = (await page.innerText('body')).length;
  if (txt < 400) note('refresh on /work/gemhub.html produced near-empty page');

  await page.goBack({ waitUntil: 'load' });
  await page.goBack({ waitUntil: 'load' });
  if (!/\/$|index/.test(new URL(page.url()).pathname)) note(`back x2 landed on ${page.url()}`);
  await page.goForward({ waitUntil: 'load' });
  await page.goForward({ waitUntil: 'load' });

  // body must never be left scroll-locked after navigation
  const locked = await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
  if (locked) note('body left scroll-locked after back/forward');

  // new tab, direct URL
  const p2 = await ctx.newPage();
  const r2 = await p2.goto(BASE + '/services/web-development.html', { waitUntil: 'load' });
  if (!r2 || r2.status() >= 400) note('direct URL in new tab failed for /services/web-development.html');
  if ((await p2.innerText('body')).length < 400) note('new-tab direct load near-empty');
  await p2.close();

  for (const e of errs) note('lifecycle JS error: ' + e);
  await ctx.close();
}

// ---------- Pass 5: interactive controls ----------
console.log('\n=== modal + mobile drawer ===');
for (const [w, label] of [[1440,'desktop'],[390,'mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 880 } });
  for (const path of ['/', '/work.html', '/services/brand-identity.html', '/work/akiso.html']) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(250);

    if (w < 1024) {
      try { await page.click('#mobileMenuToggle', { timeout: 5000 }); } catch (e) { note(`${path} @${label} menu trigger not clickable: ${e.message.split('\n')[0]}`); }
      await page.waitForTimeout(350);
      const open = await page.evaluate(() => {
        const d = document.getElementById('mobileDrawer');
        return d && getComputedStyle(d).visibility === 'visible';
      });
      if (!open) note(`${path} @${label} mobile drawer did not open`);
      try { await page.click('#mobileMenuClose', { timeout: 5000 }); } catch (e) { note(`${path} @${label} close button not clickable: ${e.message.split('\n')[0]}`); }
      await page.waitForTimeout(300);
    }

    // pick a trigger that is actually visible at this breakpoint
    const trigger = page.locator('.open-modal-btn:visible').first();
    const hasTrigger = await trigger.count();
    if (!hasTrigger) note(`${path} @${label} no visible "Talk to an Expert" trigger`);
    if (hasTrigger) {
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click({ timeout: 8000 });
      await page.waitForTimeout(350);
      const modalOpen = await page.evaluate(() => {
        const m = document.getElementById('enquiryModal');
        return m && m.classList.contains('active') && getComputedStyle(m).visibility === 'visible';
      });
      if (!modalOpen) note(`${path} @${label} enquiry modal did not open`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const cleaned = await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');
      if (!cleaned) note(`${path} @${label} body still locked after closing modal`);
    }
    await page.close();
  }
  await ctx.close();
}

await browser.close();

console.log('\n================ RESULT ================');
if (!problems.length) console.log('PASS — 0 problems across ' + PAGES.length + ' pages x ' + WIDTHS.length + ' breakpoints');
else { console.log(problems.length + ' PROBLEM(S):'); problems.forEach((p,i)=>console.log(` ${i+1}. ${p}`)); }
process.exit(problems.length ? 1 : 0);
