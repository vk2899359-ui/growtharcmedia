// Generates the static blog pages from src/data/blog.js.
//
// URL structure is inherited from the previous site and must not change:
//   /blog           -> blog/index.html
//   /blog/<slug>    -> blog/<slug>/index.html
// Vercel serves a directory's index.html at the extensionless path, so these
// files reproduce the old URLs exactly and old links keep resolving.
//
// Run via `npm run build` (prebuild step) — Vite needs the HTML on disk before
// it can treat each page as a rollup input.

import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts, blogCategories } from '../src/data/blog.js';
import { SITE, esc, jsonLd, head, header, footer, modal } from './lib/page-chrome.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* --------------------------------------------------------------------------
   Route mapping
   The posts were written against the previous site's routes. Several of those
   pages do not exist here, so every internal link is remapped to a real page
   rather than shipped as a dead link. Anything unmapped falls back to the
   services overview, which is always a valid destination.
   -------------------------------------------------------------------------- */

const ROUTE_MAP = {
  '/contact': '/#contact',
  '/about': '/about',
  '/services': '/#services',
  '/work': '/work.html',
  '/digital-marketing-agency': '/#services',
  '/services/performance-marketing': '/services/performance-marketing.html',
  '/services/meta-ads': '/services/performance-marketing.html',
  '/services/google-ads': '/services/performance-marketing.html',
  '/services/social-media-management': '/services/digital-marketing.html',
  '/services/content-creation': '/services/creative-content.html',
  '/services/branding': '/services/brand-identity.html',
  '/services/website-development': '/services/web-development.html',
  '/services/ecommerce-development': '/services/web-development.html',
  '/services/seo': '/services/digital-marketing.html',
  '/services/digital-marketing': '/services/digital-marketing.html',
  '/services/ai-automation': '/#services',
  '/services/geo-generative-engine-optimization': '/#services',
  '/services/lead-generation': '/services/performance-marketing.html',
  '/services/mobile-app-development': '/services/web-development.html',
};

const knownSlugs = new Set(blogPosts.map((p) => p.slug));

function mapRoute(href) {
  if (!href) return '/#services';
  const clean = href.trim();
  if (clean.startsWith('/blog/')) {
    return knownSlugs.has(clean.slice('/blog/'.length)) ? clean : '/blog';
  }
  if (clean === '/blog') return clean;
  return ROUTE_MAP[clean] || '/#services';
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

const byNewest = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/* --------------------------------------------------------------------------
   Article body
   -------------------------------------------------------------------------- */

function renderSection(section) {
  const { type, content, caption } = section;

  if (type === 'paragraph') return `<p class="blog-paragraph">${esc(content)}</p>`;

  if (type === 'heading') return `<h2 class="blog-heading">${esc(content)}</h2>`;

  if (type === 'list') {
    const items = content.map((i) => `<li><span class="blog-bullet"></span>${esc(i)}</li>`).join('\n            ');
    return `<ul class="blog-list">\n            ${items}\n          </ul>`;
  }

  if (type === 'quote') return `<blockquote class="blog-quote"><p>${esc(content)}</p></blockquote>`;

  if (type === 'image') {
    return `<figure class="blog-figure">
            <img src="${esc(content)}" alt="${esc(caption || '')}" loading="lazy" decoding="async" />
            ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}
          </figure>`;
  }

  if (type === 'relatedLinks') {
    const items = content
      .map((item) => {
        const [label, href] = item.split('|');
        return `<li><a href="${esc(mapRoute(href))}"><span class="blog-bullet"></span>${esc(label)}</a></li>`;
      })
      .join('\n              ');
    return `<aside class="blog-related">
            <p class="blog-related-title">Related Reading</p>
            <ul>
              ${items}
            </ul>
          </aside>`;
  }

  return '';
}

/* --------------------------------------------------------------------------
   Pages
   -------------------------------------------------------------------------- */

function postPage(post, all) {
  const canonical = `/blog/${post.slug}`;
  const sameCategory = all.filter((p) => p.slug !== post.slug && p.category === post.category);
  const related = (sameCategory.length ? sameCategory : all.filter((p) => p.slug !== post.slug)).slice(0, 3);

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: post.heroImage,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'en-IN',
      wordCount: post.content
        .flatMap((s) => (Array.isArray(s.content) ? s.content : [s.content]))
        .join(' ')
        .split(/\s+/).length,
      timeRequired: `PT${post.readingTime}M`,
      articleSection: post.category,
      author: { '@type': 'Person', name: post.author, url: `${SITE}/#about` },
      publisher: { '@id': `${SITE}/#organization` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': SITE + canonical },
      keywords: post.tags.join(', '),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: SITE + canonical },
      ],
    },
  ];

  const service = `Blog Inquiry: ${post.category}`;

  return `${head({
    title: `${post.title} | GrowthArc Media`,
    description: post.excerpt,
    canonical,
    image: post.heroImage,
    extraMeta: `    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${esc(post.date)}" />
    <meta property="article:author" content="${esc(post.author)}" />
    <meta property="article:section" content="${esc(post.category)}" />
${post.tags.map((t) => `    <meta property="article:tag" content="${esc(t)}" />`).join('\n')}`,
    schema,
  })}
${header(service)}
    <main class="case-study-page blog-post-page">

      <section class="case-hero-section">
        <div class="site-container">
          <nav class="blog-crumb" aria-label="Breadcrumb">
            <a href="/blog">Blog</a>
            <span aria-hidden="true">/</span>
            <span class="text-pink">${esc(post.category)}</span>
          </nav>

          <h1 class="blog-post-title">${esc(post.title)}</h1>

          <div class="blog-meta-row">
            <span class="blog-category-pill">${esc(post.category)}</span>
            <span>${esc(post.author)}</span>
            <span aria-hidden="true">&middot;</span>
            <span>${post.readingTime} min read</span>
            <span aria-hidden="true">&middot;</span>
            <time datetime="${esc(post.date)}">${esc(fmtDate(post.date))}</time>
          </div>

          <figure class="blog-hero-frame">
            <img src="${esc(post.heroImage)}" alt="${esc(post.title)}" loading="eager" decoding="async" fetchpriority="high" />
          </figure>
        </div>
      </section>

      <section class="section-editorial blog-body-section">
        <div class="site-container">
          <div class="blog-layout">
            <article class="blog-article">
              ${post.content.map(renderSection).join('\n\n              ')}

              <div class="blog-tags">
                ${post.tags.map((t) => `<span class="blog-tag">${esc(t)}</span>`).join('\n                ')}
              </div>

              <div class="blog-cta">
                <h3 class="blog-cta-title">Ready to apply these strategies?</h3>
                <p class="blog-cta-copy">GrowthArc Media helps businesses implement exactly these kinds of growth strategies. Let's talk about your business.</p>
                <button type="button" class="btn-cta open-modal-btn" data-service="${esc(service)}">
                  <span>Get a Free Strategy Call</span>
                  <i class="fas fa-arrow-right icon-arrow"></i>
                </button>
              </div>
            </article>

            <aside class="blog-sidebar">
              <div class="blog-side-card blog-side-dark">
                <h3>About GrowthArc</h3>
                <p>We're a performance-driven creative agency helping businesses grow through bold digital marketing, web development, and AI automation.</p>
                <button type="button" class="btn-cta w-full text-center open-modal-btn" data-service="${esc(service)}">Work With Us</button>
              </div>

              <div class="blog-side-card">
                <h3>Our Services</h3>
                <ul class="blog-side-list">
                  <li><a href="/services/brand-strategy.html"><span class="blog-bullet"></span>Brand Strategy</a></li>
                  <li><a href="/services/brand-identity.html"><span class="blog-bullet"></span>Brand Identity</a></li>
                  <li><a href="/services/creative-content.html"><span class="blog-bullet"></span>Creative &amp; Content</a></li>
                  <li><a href="/services/digital-marketing.html"><span class="blog-bullet"></span>Digital Marketing</a></li>
                  <li><a href="/services/performance-marketing.html"><span class="blog-bullet"></span>Performance Marketing</a></li>
                  <li><a href="/services/web-development.html"><span class="blog-bullet"></span>Web Development</a></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      ${
        related.length
          ? `<section class="section-editorial bg-secondary-panel blog-more-section">
        <div class="site-container">
          <h2 class="editorial-heading mb-40">More Articles</h2>
          <div class="blog-grid">
            ${related.map(cardMarkup).join('\n            ')}
          </div>
        </div>
      </section>`
          : ''
      }

    </main>
${footer()}
${modal(service)}`;
}

/* --------------------------------------------------------------------------
   GrowthArc reels
   These are GrowthArc's own video files, served from this repo. They appear
   on the blog index only — no other page's media is touched.
   -------------------------------------------------------------------------- */

const REELS = [
  ['hero-reel.mp4', 'Brand Reel', '/og-image.png'],
  ['about-reel.mp4', 'Inside The Studio', '/team-boardroom.webp'],
  ['services-hero.mp4', 'What We Do', '/images/superup.png'],
  ['services-reel.mp4', 'Creative & Campaigns', '/images/gemhub.png'],
  ['work-reel.mp4', 'Work In Motion', '/team-marketing-mafias.webp'],
];

function reelStrip() {
  return `
      <section class="section-editorial blog-reels-section">
        <div class="site-container">
          <div class="section-header-block mb-40">
            <span class="section-label text-yellow">(GROWTHARC REELS)</span>
            <h2 class="editorial-heading uppercase">Work In Motion</h2>
          </div>
          <div class="blog-reels-grid">
            ${REELS.map(([file, label, poster]) => `<figure class="blog-reel">
              <div class="blog-reel-frame">
                <video src="/videos/${file}" poster="${poster}" loop muted playsinline preload="none" data-lazy-video aria-label="${esc(label)}"></video>
              </div>
              <figcaption>${esc(label)}</figcaption>
            </figure>`).join('\n            ')}
          </div>
        </div>
      </section>
`;
}

function cardMarkup(post) {
  return `<a href="/blog/${esc(post.slug)}" class="blog-card">
              <div class="blog-card-media">
                <img src="${esc(post.heroImage)}" alt="${esc(post.title)}" loading="lazy" decoding="async" />
              </div>
              <div class="blog-card-body">
                <p class="blog-card-category">${esc(post.category)}</p>
                <h3 class="blog-card-title">${esc(post.title)}</h3>
                <p class="blog-card-meta">${esc(fmtDate(post.date))} &middot; ${post.readingTime} min read</p>
              </div>
            </a>`;
}

function indexPage(posts) {
  const service = 'Blog Inquiry: General';
  const description =
    'Practical guides on performance marketing, Meta Ads, Google Ads, SEO, GEO and AI automation for Indian businesses — written by the GrowthArc Media team.';

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE}/blog#blog`,
      name: 'GrowthArc Media Blog',
      description,
      url: `${SITE}/blog`,
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE}/#organization` },
      blogPost: posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.excerpt,
        url: `${SITE}/blog/${p.slug}`,
        datePublished: p.date,
        image: p.heroImage,
        author: { '@type': 'Person', name: p.author },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}/blog` },
      ],
    },
  ];

  const used = new Set(posts.map((p) => p.category));
  const chips = blogCategories.filter((c) => c === 'All' || used.has(c));

  return `${head({
    title: 'Blog — Growth, Performance Marketing & GEO Insights | GrowthArc Media',
    description,
    canonical: '/blog',
    image: `${SITE}/og-image.png`,
    extraMeta: '    <meta property="og:type" content="website" />',
    schema,
  })}
${header(service)}
    <main class="case-study-page">

      <section class="case-hero-section">
        <div class="site-container">
          <span class="section-label text-yellow">(INSIGHTS &amp; GUIDES)</span>
          <h1 class="case-hero-title">THE BLOG<span class="dot-pink">.</span></h1>
          <p class="case-hero-tagline">${esc(description)}</p>

          <div class="blog-filter-row" role="list">
            ${chips.map((c, i) => `<button type="button" class="blog-chip${i === 0 ? ' active' : ''}" data-category="${esc(c)}" role="listitem">${esc(c)}</button>`).join('\n            ')}
          </div>
        </div>
      </section>

${reelStrip()}
      <section class="section-editorial bg-secondary-panel">
        <div class="site-container">
          <div class="blog-grid blog-grid-index" id="blogGrid">
            ${posts.map(cardMarkup).join('\n            ')}
          </div>
          <p class="blog-empty hidden" id="blogEmpty">No articles in this category yet.</p>
        </div>
      </section>

      <section class="section-cta">
        <div class="site-container text-center">
          <span class="section-label text-yellow">(READY TO SCALE?)</span>
          <h2 class="cta-massive-statement uppercase">HAVE A BRAND THAT NEEDS TO GROW?</h2>
          <div class="cta-actions-row">
            <button type="button" class="btn-cta btn-large open-modal-btn" data-service="${esc(service)}">
              <span>Talk to an Expert</span>
              <i class="fas fa-arrow-right icon-arrow"></i>
            </button>
          </div>
        </div>
      </section>

    </main>
${footer()}
${modal(service)}`;
}

/* --------------------------------------------------------------------------
   Emit
   -------------------------------------------------------------------------- */

const posts = [...blogPosts].sort(byNewest);
const outDir = resolve(root, 'blog');

if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

writeFileSync(resolve(outDir, 'index.html'), indexPage(posts));

for (const post of posts) {
  const dir = resolve(outDir, post.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), postPage(post, posts));
}

console.log(`build-blog: wrote /blog and ${posts.length} post pages`);
