// GrowthArc Media (growtharcmedia.in) — Interaction & Motion Controller
//
// Design rules this file follows:
//  • The browser's own wheel scrolling is never hijacked or smoothed.
//    Scroll position is only *read*; it drives reveals, parallax and crop.
//  • Exactly one element resizes on scroll: the hero frame, which expands to
//    the viewport and settles back. It lives in its own sticky track, so the
//    track reserves the space up front and nothing below it can be pushed.
//  • Every other media container holds its size. Movement there happens
//    *inside* the frame (crop/parallax), never by growing the frame.
//  • Every scroll-driven write happens once per animation frame, batched,
//    using transform/opacity only.
//  • A video that fails, is blocked, or never loads falls back to its poster.
//    Nothing on the page depends on a video succeeding.

import { resolveVideoSource } from './video-sources.js';
import { testimonials } from './data/testimonials.js';

/* --------------------------------------------------------------------------
   Environment
   -------------------------------------------------------------------------- */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');
const mobileViewport = window.matchMedia('(max-width: 768px)');

const reduceMotion = () => prefersReducedMotion.matches;
const isMobile = () => mobileViewport.matches;

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
const lerp = (a, b, t) => a + (b - a) * t;

/* --------------------------------------------------------------------------
   Single batched scroll loop
   Handlers register here instead of each adding their own scroll listener.
   -------------------------------------------------------------------------- */

const frameTasks = [];
let frameQueued = false;
let lastScrollY = window.scrollY;
let scrollVelocity = 0;

function onFrame(fn) {
  frameTasks.push(fn);
}

function runFrame() {
  frameQueued = false;
  const scrollY = window.scrollY;
  scrollVelocity = scrollY - lastScrollY;
  lastScrollY = scrollY;

  const ctx = {
    scrollY,
    velocity: scrollVelocity,
    viewportHeight: window.innerHeight,
  };

  for (const task of frameTasks) {
    try {
      task(ctx);
    } catch {
      // One misbehaving effect must never take the page down.
    }
  }
}

function queueFrame() {
  if (frameQueued) return;
  frameQueued = true;
  requestAnimationFrame(runFrame);
}

window.addEventListener('scroll', queueFrame, { passive: true });
window.addEventListener('resize', queueFrame, { passive: true });
window.addEventListener('orientationchange', queueFrame, { passive: true });

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */

function boot() {
  initTestimonials();
  initBlogFilter();
  initResilientVideo();
  initHeaderBehavior();
  initRevealChoreography();
  initHeroMediaMotion();
  initCapabilityStack();
  initPanelMediaParallax();
  initMarqueeMotion();
  initPinnedPortfolioSequence();
  initEnquiryModal();
  initMobileDrawer();
  initScrollToTop();
  initMagneticButtons();
  queueFrame();
}

/* --------------------------------------------------------------------------
   1. Resilient video
   Lazy playback, offscreen pause, and a poster fallback that always wins.
   -------------------------------------------------------------------------- */

function initResilientVideo() {
  const videos = Array.from(document.querySelectorAll('video'));
  if (!videos.length) return;

  videos.forEach(video => {
    // Route through the override map so sources can be swapped in one place.
    const resolved = resolveVideoSource(video.getAttribute('src'));
    if (resolved && resolved !== video.getAttribute('src')) {
      video.setAttribute('src', resolved);
    }

    // The poster is painted as a background too, so the frame is never empty
    // while the video is still downloading — or if it never arrives at all.
    if (video.poster) {
      video.style.backgroundImage = `url("${video.poster}")`;
      video.style.backgroundSize = 'cover';
      video.style.backgroundPosition = 'center';
    }

    video.addEventListener('error', () => maybeDegrade(video), { once: true });
  });

  const eager = videos.filter(v => v.hasAttribute('data-eager-video'));
  const lazy = videos.filter(v => !v.hasAttribute('data-eager-video'));

  eager.forEach(safePlay);

  if (!('IntersectionObserver' in window)) {
    // No observer support: just play everything and let the posters cover gaps.
    lazy.forEach(safePlay);
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.preload === 'none') video.preload = 'auto';
          safePlay(video);
        } else if (!video.paused) {
          video.pause();
        }
      });
    },
    { rootMargin: '200px 0px', threshold: 0.01 }
  );

  lazy.forEach(v => observer.observe(v));
}

function safePlay(video) {
  if (reduceMotion()) return; // honour the OS setting: hold on the poster frame
  const attempt = video.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {
      // Autoplay refused or the file is unreachable — the poster stands in.
    });
  }
}

// Swapping the element out is irreversible, so only do it for an error the
// source cannot recover from. A decode hiccup or an aborted range request
// leaves the poster showing underneath anyway — the frame is never empty.
function maybeDegrade(video) {
  const err = video.error;
  // No error object means nothing actually failed — leave the element alone.
  if (!err) return;

  const fatal =
    err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED ||
    err.code === MediaError.MEDIA_ERR_NETWORK;

  if (fatal) degradeToPoster(video);
}

function degradeToPoster(video) {
  if (!video.poster || !video.parentNode) return;
  const img = document.createElement('img');
  img.src = video.poster;
  img.alt = video.getAttribute('aria-label') || 'GrowthArc Media';
  img.className = `video-fallback-img ${video.className}`.trim();
  img.loading = 'lazy';
  img.decoding = 'async';
  video.parentNode.replaceChild(img, video);
}

/* --------------------------------------------------------------------------
   2. Header
   -------------------------------------------------------------------------- */

function initHeaderBehavior() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let scrolled = false;
  onFrame(({ scrollY }) => {
    const next = scrollY > 40;
    if (next !== scrolled) {
      scrolled = next;
      header.classList.toggle('scrolled', next);
    }
  });
}

/* --------------------------------------------------------------------------
   3. Reveal choreography
   Not a blanket fade. Each element type gets the reveal that suits it:
   headings unmask upward, body copy rises, media unmasks by clip-path,
   and list/grid children stagger.
   -------------------------------------------------------------------------- */

const REVEAL_TARGETS = [
  ['.editorial-heading, .case-hero-title, .cta-massive-statement, .hero-display-heading, .service-title', 'reveal-mask'],
  ['.section-label, .section-subheading, .hero-statement, .case-hero-tagline, .service-lead, .section-subtext, .editorial-prose p', 'reveal-rise'],
  ['.hero-video-frame, .service-video-frame, .sticky-media-panel, .method-video-frame, .case-hero-image-frame, .portfolio-image-frame, .portfolio-image-wrapper', 'reveal-unmask'],
  ['.capability-list li, .method-step-card, .metric-card, .network-node, .service-item-card, .portfolio-item-card, .footer-col', 'reveal-stagger'],
];

function initRevealChoreography() {
  if (reduceMotion() || !('IntersectionObserver' in window)) return;

  const seen = new Set();
  const elements = [];

  REVEAL_TARGETS.forEach(([selector, variant]) => {
    document.querySelectorAll(selector).forEach(el => {
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add('reveal', variant);
      elements.push(el);
    });
  });

  if (!elements.length) return;

  // Stagger is scoped to siblings so a long list cascades rather than
  // every element on the page sharing one global counter.
  const groupCounters = new Map();
  elements.forEach(el => {
    if (!el.classList.contains('reveal-stagger')) return;
    const parent = el.parentElement;
    const index = groupCounters.get(parent) || 0;
    groupCounters.set(parent, index + 1);
    el.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 70}ms`);
  });

  const pending = new Set(elements);

  const reveal = el => {
    el.classList.add('is-revealed');
    pending.delete(el);
    observer.unobserve(el);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.15 }
  );

  elements.forEach(el => observer.observe(el));

  // Safety sweep.
  //
  // An IntersectionObserver only reports states the browser actually samples.
  // A fast flick, a scrollbar drag or an in-page anchor jump can move the
  // viewport past an element between two frames, so it is never seen as
  // intersecting and would stay invisible forever. This sweep reveals
  // anything the viewport has reached or passed, whatever the observer saw.
  let lastSweep = 0;
  onFrame(({ viewportHeight }) => {
    if (!pending.size) return;
    const now = performance.now();
    if (now - lastSweep < 120) return;
    lastSweep = now;

    pending.forEach(el => {
      const rect = el.getBoundingClientRect();
      // Entered the viewport, or already scrolled above it.
      if (rect.top < viewportHeight * 0.92) reveal(el);
    });
  });

  // Anything already on screen at load reveals immediately — no blank hero.
  requestAnimationFrame(() => {
    const vh = window.innerHeight;
    pending.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh && rect.bottom > 0) reveal(el);
    });
  });
}

/* --------------------------------------------------------------------------
   4. Hero media motion
   The frame itself moves between 0.98 and 1.01 — perceptible, never
   disruptive. All the visible travel happens *inside* the frame, as crop.
   -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
   4. Cinematic hero
   The stage is a tall scroll track with a pinned viewport. Scroll drives the
   frame from its framed size out to the full viewport and back again — the
   media is object-fit: cover the whole way, so nothing is ever stretched.

   Only the frame's own box changes. It is position: sticky inside its own
   track, so growing it cannot move anything that follows: the track reserves
   its height up front.
   -------------------------------------------------------------------------- */

// Fraction of the track spent expanding, held at full size, and contracting.
const HERO_EXPAND_END = 0.36;
const HERO_HOLD_END = 0.62;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function initHeroMediaMotion() {
  const stage = document.getElementById('heroVideoStage');
  const frame = stage && stage.querySelector('.hero-video-frame');
  if (!stage || !frame) return;

  // Reduced motion keeps the plain framed video.
  if (reduceMotion()) {
    stage.classList.add('is-static');
    return;
  }

  const media = frame.querySelector('video, img');
  let rendered = -1;

  const write = (expand) => {
    if (Math.abs(expand - rendered) < 0.002) return;
    rendered = expand;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Framed size: the container width, at the section's 16:9 ratio.
    const gutter = vw <= 768 ? 20 : 32;
    const framedW = Math.min(vw - gutter * 2, 1440 - gutter * 2);
    const framedH = framedW * (9 / 16);

    const w = framedW + (vw - framedW) * expand;
    const h = framedH + (vh - framedH) * expand;
    const r = 28 * (1 - expand);

    stage.style.setProperty('--expand', expand.toFixed(4));
    stage.style.setProperty('--frame-w', `${w.toFixed(1)}px`);
    stage.style.setProperty('--frame-h', `${h.toFixed(1)}px`);
    stage.style.setProperty('--frame-r', `${r.toFixed(1)}px`);
  };

  write(0);

  onFrame(({ viewportHeight }) => {
    const rect = stage.getBoundingClientRect();
    const travel = stage.offsetHeight - viewportHeight;
    if (travel <= 0) return;

    if (rect.bottom < 0 || rect.top > viewportHeight) {
      write(rect.bottom < 0 ? 0 : 0);
      return;
    }

    const p = clamp(-rect.top / travel, 0, 1);

    // Expand, hold at full screen, then settle back into the frame.
    let expand;
    if (p <= HERO_EXPAND_END) {
      expand = easeInOut(p / HERO_EXPAND_END);
    } else if (p <= HERO_HOLD_END) {
      expand = 1;
    } else {
      expand = 1 - easeInOut((p - HERO_HOLD_END) / (1 - HERO_HOLD_END));
    }

    write(clamp(expand, 0, 1));

    // A touch of crop travel inside the frame while it is framed; none at
    // full screen, where any offset would expose an edge.
    if (media) {
      const drift = (1 - expand) * (isMobile() ? 6 : 12) * (p - 0.5) * 2;
      media.style.transform = `translate3d(0, ${drift.toFixed(2)}px, 0) scale(1.04)`;
    }
  });
}

/* --------------------------------------------------------------------------
   4b. Capability card stack
   Each card pins in turn and the next rides over it. Cards that have been
   passed recede on Z and tilt back, which is what makes the pile read as
   depth instead of as overlapping rectangles.
   -------------------------------------------------------------------------- */

function initCapabilityStack() {
  const list = document.querySelector('.service-panels-list');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll('.service-panel-row'));
  if (cards.length < 2) return;

  cards.forEach((card, i) => card.style.setProperty('--i', String(i)));

  if (reduceMotion()) return;

  const rendered = new Array(cards.length).fill(-1);

  onFrame(({ viewportHeight }) => {
    if (isMobile()) {
      // The stylesheet unpins the cards below 768px; clear anything stale.
      cards.forEach((card, i) => {
        if (rendered[i] !== 0) {
          card.style.setProperty('--depth', '0');
          rendered[i] = 0;
        }
      });
      return;
    }

    const listRect = list.getBoundingClientRect();
    if (listRect.bottom < -200 || listRect.top > viewportHeight + 200) return;

    for (let i = 0; i < cards.length; i += 1) {
      const card = cards[i];
      const next = cards[i + 1];

      // How far the following card has travelled over this one.
      let depth = 0;
      if (next) {
        const cardRect = card.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        const span = cardRect.height || 1;
        const covered = cardRect.top + span - nextRect.top;
        depth = clamp(covered / span, 0, 1);
      }

      if (Math.abs(depth - rendered[i]) < 0.005) continue;
      rendered[i] = depth;
      card.style.setProperty('--depth', depth.toFixed(4));
    }
  });
}

/* --------------------------------------------------------------------------
   5. Panel & service media parallax
   Same rule: subtle inner movement, container untouched.
   -------------------------------------------------------------------------- */

function initPanelMediaParallax() {
  if (reduceMotion() || isMobile()) return;

  const frames = Array.from(
    document.querySelectorAll('.service-video-frame, .sticky-media-panel, .method-video-frame')
  );
  if (!frames.length) return;

  const pairs = frames
    .map(frame => ({ frame, media: frame.querySelector('video, img') }))
    .filter(p => p.media);

  pairs.forEach(({ media }) => {
    media.style.willChange = 'transform';
  });

  onFrame(({ viewportHeight }) => {
    pairs.forEach(({ frame, media }) => {
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > viewportHeight + 100) return;

      const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
      const offset = (progress - 0.5) * 24; // ±12px of crop travel
      media.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.08)`;
    });
  });
}

/* --------------------------------------------------------------------------
   6. Marquee
   Continuous drift with a scroll-velocity nudge, wrapped on the measured
   group width so it loops seamlessly instead of snapping at a fixed offset.
   -------------------------------------------------------------------------- */

function initMarqueeMotion() {
  const track = document.getElementById('workMarqueeTrack');
  if (!track) return;

  const group = track.querySelector('.work-marquee-group');
  if (!group) return;

  if (reduceMotion()) {
    track.style.transform = 'translate3d(0, 0, 0)';
    return;
  }

  let groupWidth = group.getBoundingClientRect().width || 1;
  let offset = 0;
  let running = true;

  const remeasure = () => {
    groupWidth = group.getBoundingClientRect().width || groupWidth;
  };
  window.addEventListener('resize', remeasure, { passive: true });

  // Pause the marquee entirely when it is nowhere near the viewport.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { running = e.isIntersecting; }),
      { rootMargin: '150px 0px' }
    );
    io.observe(track);
  }

  const baseSpeed = isMobile() ? 0.35 : 0.6;

  const tick = () => {
    if (running) {
      offset -= baseSpeed + scrollVelocity * 0.25;
      // Wrap within one group so the duplicate group hides the seam.
      offset = ((offset % groupWidth) + groupWidth) % groupWidth - groupWidth;
      track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(() => {
    remeasure();
    tick();
  });
}

/* --------------------------------------------------------------------------
   7. Pinned portfolio sequence
   Scroll advances the sequence; it never fights the wheel. Below 768px the
   stylesheet unpins the section into a normal stacked list, so this does
   nothing there.
   -------------------------------------------------------------------------- */

function initPinnedPortfolioSequence() {
  const section = document.getElementById('pinnedPortfolioSection');
  if (!section) return;

  const slides = Array.from(section.querySelectorAll('.portfolio-slide'));
  if (!slides.length) return;

  const counter = section.querySelector('.sequence-counter');
  const progress = section.querySelector('.sequence-progress-inner');
  const total = slides.length;
  const pad = n => String(n).padStart(2, '0');

  let lastActive = -1;

  const clearInlineStyles = () => {
    slides.forEach(slide => {
      slide.style.opacity = '';
      slide.style.transform = '';
      slide.style.pointerEvents = '';
    });
  };

  onFrame(({ viewportHeight }) => {
    // Stacked list layout on small screens — leave the DOM alone.
    if (isMobile()) {
      if (lastActive !== -1) {
        clearInlineStyles();
        lastActive = -1;
      }
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - viewportHeight;
    if (scrollable <= 0) return;

    const sequenceProgress = clamp(-rect.top / scrollable, 0, 1);
    const raw = sequenceProgress * total;
    const active = clamp(Math.floor(raw), 0, total - 1);

    if (progress) progress.style.width = `${(sequenceProgress * 100).toFixed(2)}%`;

    if (active !== lastActive) {
      lastActive = active;
      if (counter) counter.textContent = `${pad(active + 1)} / ${pad(total)}`;

      slides.forEach((slide, i) => {
        const isActive = i === active;
        const isPast = i < active;
        slide.classList.toggle('active', isActive);
        slide.style.opacity = isActive ? '1' : '0';
        slide.style.pointerEvents = isActive ? 'auto' : 'none';
        slide.style.transform = isActive
          ? 'scale(1) translate3d(0, 0, 0)'
          : isPast
            ? 'scale(0.94) translate3d(0, -36px, 0)'
            : 'scale(0.96) translate3d(0, 48px, 0)';
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        // Keep offscreen slides out of the tab order.
        slide.querySelectorAll('a').forEach(a => {
          if (isActive) a.removeAttribute('tabindex');
          else a.setAttribute('tabindex', '-1');
        });
      });
    }

    // Within-slide drift: the active card eases as its share of scroll elapses.
    const activeSlide = slides[active];
    if (activeSlide) {
      const within = clamp(raw - active, 0, 1);
      const drift = (within - 0.5) * 14;
      const media = activeSlide.querySelector('.slide-media-img');
      // Written as a custom property so the stylesheet's hover zoom still composes.
      if (media) media.style.setProperty('--drift-y', `${drift.toFixed(2)}px`);
    }
  });
}

/* --------------------------------------------------------------------------
   8. Enquiry modal
   -------------------------------------------------------------------------- */

function initEnquiryModal() {
  const modal = document.getElementById('enquiryModal');
  if (!modal) return;

  const closeBtn = document.getElementById('modalCloseBtn');
  const openBtns = document.querySelectorAll('.open-modal-btn');
  const serviceInput = document.getElementById('selectedServiceInput');
  const form = document.getElementById('enquiryForm');
  const successMsg = document.getElementById('formSuccessMessage');
  let lastFocused = null;
  let successTimer = null;

  const openModal = btn => {
    lastFocused = btn;
    if (serviceInput) {
      serviceInput.value = btn.getAttribute('data-service') || 'General Strategy Inquiry';
    }

    // The drawer and the modal both lock scrolling — never leave both open.
    const drawer = document.getElementById('mobileDrawer');
    if (drawer) drawer.classList.remove('active');

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (form) form.style.display = '';
    if (successMsg) successMsg.classList.add('hidden');

    const firstField = modal.querySelector('input:not([readonly]), textarea, select');
    if (firstField) firstField.focus({ preventScroll: true });
  };

  const closeModal = () => {
    if (successTimer) {
      clearTimeout(successTimer);
      successTimer = null;
    }
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  };

  openBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal(btn);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !modal.classList.contains('active')) return;
    closeModal();
  });

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      form.style.display = 'none';
      if (successMsg) successMsg.classList.remove('hidden');
      successTimer = setTimeout(() => {
        closeModal();
        form.reset();
      }, 3500);
    });
  }
}

/* --------------------------------------------------------------------------
   9. Mobile drawer
   -------------------------------------------------------------------------- */

function initMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  if (!drawer) return;

  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('mobileMenuClose');

  const closeDrawer = () => {
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
      const firstLink = drawer.querySelector('.mobile-link');
      if (firstLink) firstLink.focus({ preventScroll: true });
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) closeDrawer();
  });

  // Rotating to desktop width must not leave the body scroll-locked.
  mobileViewport.addEventListener('change', e => {
    if (!e.matches) closeDrawer();
  });
}

/* --------------------------------------------------------------------------
   10. Scroll to top
   -------------------------------------------------------------------------- */

function initScrollToTop() {
  const topBtn = document.getElementById('scrollTopBtn');
  if (!topBtn) return;

  topBtn.style.opacity = '0';
  topBtn.style.pointerEvents = 'none';

  let visible = false;
  onFrame(({ scrollY }) => {
    const next = scrollY > 500;
    if (next === visible) return;
    visible = next;
    topBtn.style.opacity = next ? '1' : '0';
    topBtn.style.pointerEvents = next ? 'auto' : 'none';
  });

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   11. Magnetic buttons
   Pointer-driven only, and expressed through a CSS variable so it composes
   with the stylesheet's own hover lift instead of overwriting it.
   -------------------------------------------------------------------------- */

function initMagneticButtons() {
  if (reduceMotion() || coarsePointer.matches) return;

  document.querySelectorAll('.btn-cta, .fab-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
      btn.style.setProperty('--magnet-x', `${x.toFixed(2)}px`);
      btn.style.setProperty('--magnet-y', `${y.toFixed(2)}px`);
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--magnet-x', '0px');
      btn.style.setProperty('--magnet-y', '0px');
    });
  });
}

/* --------------------------------------------------------------------------
   12. Blog category filter
   Progressive enhancement: every card is in the HTML and visible without JS,
   so the page is fully crawlable and works if this never runs.
   -------------------------------------------------------------------------- */

function initBlogFilter() {
  const grid = document.getElementById('blogGrid');
  const chips = document.querySelectorAll('.blog-chip');
  if (!grid || !chips.length) return;

  const cards = Array.from(grid.querySelectorAll('.blog-card'));
  const empty = document.getElementById('blogEmpty');

  const categoryOf = card => {
    const el = card.querySelector('.blog-card-category');
    return el ? el.textContent.trim() : '';
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const wanted = chip.getAttribute('data-category');
      chips.forEach(c => c.classList.toggle('active', c === chip));

      let shown = 0;
      cards.forEach(card => {
        const match = wanted === 'All' || categoryOf(card) === wanted;
        card.classList.toggle('hidden', !match);
        if (match) shown += 1;
      });

      if (empty) empty.classList.toggle('hidden', shown > 0);
    });
  });
}

/* --------------------------------------------------------------------------
   13. Client testimonials
   The section ships hidden and only appears once src/data/testimonials.js
   holds real, attributed quotes. No entries, no section — an empty
   "what our clients say" heading is worse than not asking the question.
   -------------------------------------------------------------------------- */

function initTestimonials() {
  const section = document.getElementById('testimonials');
  const grid = document.getElementById('testimonialGrid');
  if (!section || !grid || !testimonials.length) return;

  const esc = s =>
    String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  grid.innerHTML = testimonials
    .map(t => {
      const stars =
        typeof t.rating === 'number'
          ? `<div class="testimonial-stars" aria-label="${t.rating} out of 5">${'\u2605'.repeat(t.rating)}${'\u2606'.repeat(5 - t.rating)}</div>`
          : '';
      const company = t.caseStudy
        ? `<a href="${esc(t.caseStudy)}" class="testimonial-company">${esc(t.company)}</a>`
        : `<span class="testimonial-company">${esc(t.company)}</span>`;

      return `<figure class="testimonial-card">
        ${stars}
        <blockquote class="testimonial-quote">${esc(t.quote)}</blockquote>
        <figcaption class="testimonial-meta">
          <span class="testimonial-author">${esc(t.author)}</span>
          ${t.role ? `<span class="testimonial-role">${esc(t.role)}</span>` : ''}
          ${company}
          ${t.via ? `<span class="testimonial-via">via ${esc(t.via)}</span>` : ''}
        </figcaption>
      </figure>`;
    })
    .join('');

  section.classList.remove('hidden');
}

/* --------------------------------------------------------------------------
   Bootstrap
   Kept at the end of the module: `boot()` runs during module evaluation when
   the document has already parsed, so every declaration it touches must
   already be initialised.
   -------------------------------------------------------------------------- */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// Restoring from the bfcache must never leave the page dimmed or locked.
window.addEventListener('pageshow', () => {
  document.body.style.opacity = '1';
  document.body.style.overflow = '';
  queueFrame();
});
