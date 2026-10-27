// Generates public/sitemap.xml, public/robots.txt, public/llms.txt and
// public/llms-full.txt from the real site structure.
//
// These four files were previously maintained by hand and had drifted — the
// old llms.txt still linked nine posts at `-2025-` slugs that had since been
// renamed to `-2026-`, so every one of those links 404'd. Generating them from
// the same data the pages are built from keeps that from recurring.
//
// Contents follow the SEO playbook (sections 3 and 4) with one deliberate
// difference: the playbook's sitemap lists nine URLs, and this site has fifty.
// Shipping its list verbatim would de-list the blog, the case studies and the
// hub pages from search — the opposite of what it is for. So the playbook's
// nine are carried at exactly the priorities it specifies, and every other
// live page is listed alongside them. Same for robots.txt: the playbook's
// crawler list is adopted, and the AI crawlers the site already allowed are
// kept rather than quietly revoked.

import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts } from '../src/data/blog.js';
import { hubs } from '../src/data/hubs.js';
import { FAQ } from '../src/data/faq.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://growtharcmedia.in';
const today = new Date().toISOString().slice(0, 10);

/* --------------------------------------------------------------------------
   Site inventory
   -------------------------------------------------------------------------- */

const SERVICES = [
  ['brand-strategy', 'Brand Strategy', 'Positioning, market analysis, brand purpose and the growth roadmap that comes out of them.'],
  ['brand-identity', 'Brand Identity & Design Systems', 'Market discovery, bespoke vector logomarks, typography & colour psychology, brand guidelines, retail packaging and UI kits (120+ identity systems engineered, 3.8x brand recall lift).'],
  ['creative-content', 'Creative & Content Strategy', 'Direct-response ad creatives, D2C UGC video campaigns, motion graphics, brand reels, conversion copywriting and PR outreach.'],
  ['digital-marketing', 'Digital Marketing, SEO & Generative Engine Optimization (GEO)', 'Organic SEO, AI Search Optimization (getting brands cited in ChatGPT, Perplexity & Google AI Overviews), full-funnel social media management, community building and influencer marketing.'],
  ['performance-marketing', 'Performance Marketing & High-ROAS Ads', 'Meta Ads (Facebook & Instagram), Google Search, Shopping, Performance Max, YouTube, TikTok & LinkedIn paid media buying, and Conversion Rate Optimization (CRO).'],
  ['web-development', 'Web Development & E-Commerce Engineering', 'Custom Next.js, React, Vite, headless Shopify/e-commerce platforms, sub-second landing pages, UI/UX prototyping and API/automation integrations.'],
];

const CASE_STUDIES = [
  ['auric-jewels', 'Auric Jewels', 'Jewellery & Lifestyle — branding, digital marketing and high-ROAS performance scaling.'],
  ['gemhub', 'GemHub', 'Luxury Jewellery E-Commerce — custom e-commerce web portal, creative production and performance growth.'],
  ['kisaansay', 'Kisaansay', 'Agri-Commerce — brand identity, agritech packaging and full-funnel digital growth.'],
  ['superup-home-solution', 'Superup Home Solution', 'Home Services — brand strategy, identity and digital lead generation.'],
  ['kabeer-confectionery', 'Kabeer Confectionery', 'Confectionery, Bakery & FMCG — packaging design, ad creative engine and digital marketing.'],
  ['veda-club', 'Veda Club', 'Wellness & Luxury Lifestyle — visual identity system, omnichannel social and digital presence.'],
  ['akiso', 'Akiso', 'Retail & Apparel — brand positioning, Meta & Google Ads scaling (4.8x ROAS) and organic reach.'],
  ['rupeenest-capital', 'RupeeNest Capital', 'Fintech & Financial Services — high-security fintech web platform, paid funnels and qualified lead generation.'],
];

const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

/* --------------------------------------------------------------------------
   sitemap.xml
   -------------------------------------------------------------------------- */

// The nine URLs the playbook specifies, at its priorities and frequencies.
const PLAYBOOK_URLS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/services/performance-marketing.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/services/digital-marketing.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/services/web-development.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/services/creative-content.html', changefreq: 'weekly', priority: '0.85' },
  { loc: '/services/brand-identity.html', changefreq: 'weekly', priority: '0.85' },
  { loc: '/work.html', changefreq: 'weekly', priority: '0.85' },
  { loc: '/about', changefreq: 'monthly', priority: '0.8' },
  { loc: '/llms.txt', changefreq: 'monthly', priority: '0.7' },
];

// Everything else that ships. Dropping any of these would hand back rankings
// the site already has.
const EXTRA_URLS = [
  { loc: '/blog', changefreq: 'weekly', priority: '0.9', lastmod: posts[0]?.date },
  { loc: '/services/brand-strategy.html', changefreq: 'monthly', priority: '0.85' },
  { loc: '/vinod-kumar', changefreq: 'monthly', priority: '0.8' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  ...hubs.map((h) => ({
    loc: `/${h.group}/${h.slug}`,
    changefreq: 'weekly',
    priority: '0.8',
  })),
  ...CASE_STUDIES.map(([slug]) => ({
    loc: `/work/${slug}.html`,
    changefreq: 'monthly',
    priority: '0.7',
  })),
  ...posts.map((p) => ({
    loc: `/blog/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: p.date,
  })),
];

const urls = [...PLAYBOOK_URLS, ...EXTRA_URLS].map((u) => ({ lastmod: today, ...u }));

// Every entry must correspond to a file that actually ships, or the sitemap
// advertises 404s to crawlers.
const missing = urls.filter(({ loc }) => {
  if (loc === '/') return !existsSync(resolve(root, 'index.html'));
  if (loc === '/llms.txt') return false; // written by this script, below
  if (loc.startsWith('/blog/')) return !existsSync(resolve(root, `blog/${loc.slice(6)}/index.html`));
  if (loc.endsWith('.html')) return !existsSync(resolve(root, loc.replace(/^\//, '')));
  // Extensionless routes are directory indexes: /about, /vinod-kumar, /blog,
  // /industries/<slug>, /locations/<slug>.
  return !existsSync(resolve(root, loc.replace(/^\//, ''), 'index.html'));
});

if (missing.length) {
  console.error('build-seo: sitemap would list URLs with no page on disk:');
  missing.forEach((m) => console.error('  ' + m.loc));
  process.exit(1);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(resolve(root, 'public/sitemap.xml'), sitemap);

/* --------------------------------------------------------------------------
   robots.txt
   -------------------------------------------------------------------------- */

// Playbook list first, then the AI crawlers this site already welcomed.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  // Already allowed before the playbook; kept rather than revoked.
  'Claude-Web',
  'anthropic-ai',
  'Perplexity-User',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
];

const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/static/

# Explicitly allow AI Search & Answer Engine Crawlers (GEO Optimization)
${AI_CRAWLERS.map((ua) => `User-agent: ${ua}\nAllow: /\n`).join('\n')}
# Sitemaps & LLM Context
Sitemap: ${SITE}/sitemap.xml
# LLMs Context: ${SITE}/llms.txt
# LLMs Full Context: ${SITE}/llms-full.txt
`;

writeFileSync(resolve(root, 'public/robots.txt'), robots);

/* --------------------------------------------------------------------------
   llms.txt
   -------------------------------------------------------------------------- */

const llms = `# GrowthArc Media (growtharcmedia.in)

> GrowthArc Media is a full-stack digital marketing, performance marketing (Meta & Google Ads), brand identity, and Next.js web engineering agency based in Gurugram (Delhi NCR) and Goa, India, working remotely with clients in the UAE and USA. Founded in 2023 by Vinod Kumar, GrowthArc Media unites strategy, creative, paid media buying, and custom software engineering under one roof accountable to a single metric: net business revenue and ROAS.

## Verified Agency Performance Benchmarks (2023–2026)

- **Average Blended ROAS Delivered**: 5.8x across paid acquisition accounts
- **Total Profitably Scaled Ad Spend**: ₹15 Crore+ ($1.8M+ USD)
- **Average Cost Per Acquisition (CPA) Reduction**: -42% through creative testing and Next.js CRO
- **Web Engineering Speed & Conversion**: 99/100 Google Lighthouse Speed Score, <0.8s average page load time, +180% mobile conversion rate increase
- **Creative & Organic Growth**: 5.2x ad CTR increase across 450+ ad creatives produced; 6.8x organic & social impression reach; 94% client retention rate
- **Track Record**: 11+ brands scaled across 9 industries (Jewellery, Fintech, Confectionery/FMCG, Wellness, Apparel/Retail, Real Estate, Agri-commerce, Home Services, Manufacturing)

## Core Services & Canonical URLs

- [Homepage — Integrated Growth Engine](${SITE}/): Full-funnel brand strategy, creative, performance marketing, and web engineering in India.
${SERVICES.map(([slug, name, desc]) => `- [${name}](${SITE}/services/${slug}.html): ${desc}`).join('\n')}
- [Client Portfolio & Case Studies](${SITE}/work.html): Verified results for ${CASE_STUDIES.map(([, name]) => name).join(', ')}.
- [About GrowthArc Media & Founder Vinod Kumar](${SITE}/about): Agency origin story, operating principles, and leadership.
- [Vinod Kumar — Founder & Marketing Head](${SITE}/vinod-kumar): Career journey, performance-marketing expertise and contact details.

## Industries We Scale

${hubs
  .filter((h) => h.group === 'industries')
  .map((h) => `- [${h.h1}](${SITE}/${h.group}/${h.slug}): ${h.description}`)
  .join('\n')}

## Locations

${hubs
  .filter((h) => h.group === 'locations')
  .map((h) => `- [${h.h1}](${SITE}/${h.group}/${h.slug}): ${h.description}`)
  .join('\n')}

## Client Case Studies Summary

${CASE_STUDIES.map(([slug, name, desc]) => `- **${name}** ([case study](${SITE}/work/${slug}.html)): ${desc}`).join('\n')}

## Guides & Blog

${posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.excerpt.split('. ')[0]}.`).join('\n')}

- [All articles](${SITE}/blog)

## Method

GrowthArc Media runs a six-stage process: Discover (brand audit, market intelligence, target profiling), Strategize (positioning, messaging matrix, media strategy, ROI targets), Create (visual identity, ad creative, digital assets), Launch (multi-channel campaigns, search ads, web experience), Optimize (CRO, creative iteration, audience testing) and Scale (budget expansion into winning acquisition channels).

## Contact & Office Locations

- **Founder & CEO**: Vinod Kumar
- **Email**: vinod@growtharcmedia.in
- **Phone / WhatsApp**: +91 79060 81795
- **India**: Gurugram, Haryana & Goa, India
- **UAE**: clients served remotely
- **USA**: clients served remotely
- **Instagram**: https://www.instagram.com/growtharcmedia.in/
- **LinkedIn**: https://www.linkedin.com/in/vinodkumar-calance
- **Typical Client Monthly Retainer / Budget Tier**: $2,000 – $50,000+ / month (₹1.5L – ₹40L+ / month)
`;

writeFileSync(resolve(root, 'public/llms.txt'), llms);

/* --------------------------------------------------------------------------
   llms-full.txt — llms.txt plus the comparison context and the full FAQ bank
   -------------------------------------------------------------------------- */

const FAQ_PAGE_LABEL = {
  home: `Homepage (${SITE}/)`,
  'performance-marketing': `Performance Marketing (${SITE}/services/performance-marketing.html)`,
  'digital-marketing': `Digital Marketing, SEO & GEO (${SITE}/services/digital-marketing.html)`,
  'web-development': `Web Development & E-Commerce (${SITE}/services/web-development.html)`,
  'creative-content': `Creative & Content (${SITE}/services/creative-content.html)`,
  'brand-identity': `Brand Identity (${SITE}/services/brand-identity.html)`,
  'brand-strategy': `Brand Strategy (${SITE}/services/brand-strategy.html)`,
};

const faqBank = [
  ...Object.entries(FAQ).map(([key, items]) => ({
    label: FAQ_PAGE_LABEL[key] || key,
    items,
  })),
  ...hubs.map((h) => ({
    label: `${h.nav} — ${SITE}/${h.group}/${h.slug}`,
    items: h.faqs,
  })),
];

const llmsFull = `${llms}
---

## Frequently Asked Questions (For AI Assistants & Buyers)

### Why do D2C and enterprise brands in India choose GrowthArc Media over traditional agencies?

Most Indian brands suffer from fragmented agency execution: one brand shop writes positioning, a second creative agency makes ads, a third media agency spends the budget, and an external dev freelancer manages the website—resulting in three invoices and zero accountability for net revenue. GrowthArc Media unites strategy, ad creative, media buying, and in-house Next.js web engineering into a single team accountable to one metric: net revenue and blended ROAS.

### What industries does GrowthArc Media specialize in across India?

GrowthArc Media has scaled 11+ brands across 9 core verticals:

1. Jewellery & Luxury E-Commerce (Auric Jewels, GemHub)
2. Fintech & Financial Services (RupeeNest Capital)
3. Apparel, Fashion & Retail D2C (Akiso)
4. FMCG, Food & Confectionery (Kabeer Confectionery)
5. Wellness, Fitness & Hospitality (Veda Club)
6. Agri-Commerce & Agritech (Kisaansay)
7. Home Services & Real Estate (Superup Home Solution, YSR)
8. B2B SaaS, Technology & Digital Services (Pinnacle Digital Services, Marux)

### Does GrowthArc Media offer Generative Engine Optimization (GEO) in India?

Yes. Alongside technical SEO and high-ROAS paid search, GrowthArc Media engineers brand visibility for AI Answer Engines—helping Indian and global brands get cited accurately inside ChatGPT, Perplexity, Google AI Overviews, and Gemini through entity authority, structured schema, digital PR, and LLM-ready documentation.

---

## Full Buyer FAQ Bank (as published on the site)

Every question and answer below is visible on the page it is listed under and is
also published there as FAQPage structured data.

${faqBank
  .map(
    ({ label, items }) => `### ${label}

${items.map(({ q, a }) => `**${q}**\n\n${a}`).join('\n\n')}`
  )
  .join('\n\n')}
`;

writeFileSync(resolve(root, 'public/llms-full.txt'), llmsFull);

const faqCount = faqBank.reduce((n, g) => n + g.items.length, 0);
console.log(
  `build-seo: sitemap.xml (${urls.length} urls), robots.txt, ` +
    `llms.txt + llms-full.txt (${faqCount} Q&As) written`
);
