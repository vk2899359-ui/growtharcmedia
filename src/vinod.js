// Vinod Kumar — personal brand site.
//
// Self-contained: this page does not load the agency site's controller, so
// nothing here can affect / and nothing there can affect this.
//
// Rules:
//  • Native scrolling is never hijacked. Scroll is only read.
//  • Everything is visible without JavaScript — reveals are added by script,
//    so a failure leaves a fully readable page rather than a blank one.
//  • prefers-reduced-motion disables counters and reveals.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const prefersReduced = () => reduceMotion.matches;

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

/* --------------------------------------------------------------------------
   Sticky nav — background on scroll, active link by section
   -------------------------------------------------------------------------- */

function initNav() {
  const nav = document.getElementById('vkNav');
  const links = Array.from(document.querySelectorAll('.vk-nav-links a[href^="#"]'));
  if (!nav) return;

  const sections = links
    .map((a) => {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      return el ? { a, el } : null;
    })
    .filter(Boolean);

  let scrolled = false;
  let active = null;
  let queued = false;

  const update = () => {
    queued = false;

    const next = window.scrollY > 24;
    if (next !== scrolled) {
      scrolled = next;
      nav.classList.toggle('is-scrolled', next);
    }

    if (!sections.length) return;

    // The section whose top is closest to just under the nav wins.
    const line = window.innerHeight * 0.32;
    let best = sections[0];
    for (const s of sections) {
      const top = s.el.getBoundingClientRect().top;
      if (top - line <= 0) best = s;
    }

    // At the very bottom the last section can never win on top-edge alone.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      best = sections[sections.length - 1];
    }

    if (best !== active) {
      if (active) active.a.classList.remove('is-active');
      best.a.classList.add('is-active');
      active = best;
    }
  };

  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* --------------------------------------------------------------------------
   Number counters
   Each runs once, when its stat first reaches the viewport.
   -------------------------------------------------------------------------- */

function initCounters() {
  const nodes = Array.from(document.querySelectorAll('[data-count]'));
  if (!nodes.length) return;

  // Reduced motion, or no observer: show the final value immediately.
  const settle = (el) => {
    const to = Number(el.getAttribute('data-count'));
    el.textContent = `${to}${el.getAttribute('data-suffix') || ''}`;
  };

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    nodes.forEach(settle);
    return;
  }

  const run = (el) => {
    const to = Number(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (!Number.isFinite(to)) return settle(el);

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      // easeOutExpo — fast out of the gate, settles precisely on the number.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = `${Math.round(to * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  nodes.forEach((n) => {
    n.textContent = `0${n.getAttribute('data-suffix') || ''}`;
    io.observe(n);
  });
}

/* --------------------------------------------------------------------------
   Reveals
   Added by script so the page is fully visible when JS does not run.
   -------------------------------------------------------------------------- */

const REVEAL_SELECTOR = [
  '.vk-head',
  '.vk-hero-meta',
  '.vk-h1',
  '.vk-hero-sub',
  '.vk-hero-actions',
  '.vk-hero-roles',
  '.vk-stat',
  '.vk-about-body',
  '.vk-side',
  '.vk-arc',
  '.vk-tl-item',
  '.vk-wall-cell',
  '.vk-proof',
  '.vk-exp',
  '.vk-case',
  '.vk-stack-col',
  '.vk-story p',
  '.vk-story-pin',
  '.vk-cred',
  '.vk-fit',
  '.vk-rec, .vk-rec-empty',
  '.vk-contact-inner > *',
].join(', ');

function initReveals() {
  if (prefersReduced() || !('IntersectionObserver' in window)) return;

  const els = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
  if (!els.length) return;

  // Stagger within a parent, so a grid cascades instead of arriving as a block.
  const seen = new Map();
  els.forEach((el) => {
    el.classList.add('vk-reveal');
    const parent = el.parentElement;
    const i = seen.get(parent) || 0;
    seen.set(parent, i + 1);
    el.style.setProperty('--vk-delay', `${Math.min(i, 6) * 65}ms`);
  });

  const pending = new Set(els);
  const show = (el) => {
    el.classList.add('is-in');
    pending.delete(el);
    io.unobserve(el);
  };

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && show(e.target)),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );

  els.forEach((el) => io.observe(el));

  // Safety sweep: an observer only reports states the browser samples, so a
  // fast flick or an anchor jump can skip an element and strand it invisible.
  let last = 0;
  const sweep = () => {
    if (!pending.size) return;
    const now = performance.now();
    if (now - last < 120) return;
    last = now;
    const vh = window.innerHeight;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.95) show(el);
    });
  };

  window.addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });

  // Anything already on screen appears at once — no blank hero.
  requestAnimationFrame(() => {
    const vh = window.innerHeight;
    pending.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) show(el);
    });
  });
}

/* --------------------------------------------------------------------------
   Timeline
   Progressive enhancement: every entry is expanded in the HTML. Script
   collapses them and wires the toggles, so without JS the full history is
   readable rather than hidden behind a control that does nothing.
   -------------------------------------------------------------------------- */

function initTimeline() {
  const items = Array.from(document.querySelectorAll('.vk-tl-item'));
  if (!items.length) return;

  items.forEach((item, i) => {
    const head = item.querySelector('.vk-tl-head');
    const body = item.querySelector('.vk-tl-body');
    if (!head || !body) return;

    const open = i === 0; // current role starts open
    item.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', String(open));
    body.setAttribute('aria-hidden', String(!open));

    head.addEventListener('click', () => {
      const next = !item.classList.contains('is-open');
      item.classList.toggle('is-open', next);
      head.setAttribute('aria-expanded', String(next));
      body.setAttribute('aria-hidden', String(!next));
    });
  });
}

/* --------------------------------------------------------------------------
   Boot — at the end so every declaration above is initialised first.
   -------------------------------------------------------------------------- */

function boot() {
  initNav();
  initTimeline();
  initCounters();
  initReveals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
