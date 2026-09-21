// Generates public/sitemap.xml and public/llms.txt from the real site structure.
//
// Both files were previously maintained by hand and had drifted — the old
// llms.txt still linked nine posts at `-2025-` slugs that had since been
// renamed to `-2026-`, so every one of those links 404'd. Generating them
// from the same data the pages are built from keeps that from recurring.

import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blogPosts } from '../src/data/blog.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://growtharcmedia.in';
const today = new Date().toISOString().slice(0, 10);

/* --------------------------------------------------------------------------
   Site inventory
   -------------------------------------------------------------------------- */

const SERVICES = [
  ['brand-strategy', 'Brand Strategy', 'Positioning, market analysis, brand purpose and the growth roadmap that comes out of them.'],
  ['brand-identity', 'Brand Identity', 'Logomarks, design systems, typography, naming and packaging — the whole visual identity.'],
  ['creative-content', 'Creative & Content', 'Ad creative production, brand copywriting, UGC and creator video, content strategy and PR.'],
  ['digital-marketing', 'Digital Marketing', 'Full-funnel social media management, organic search, community building and influencer relations.'],
  ['performance-marketing', 'Performance Marketing', 'Google Search Ads, Meta Ads, TikTok and LinkedIn, programmatic media buying and CRO.'],
  ['web-development', 'Web Development', 'Custom UI/UX, React and Vite web apps, e-commerce platforms, headless architecture and technical SEO.'],
];

const CASE_STUDIES = [
  ['auric-jewels', 'Auric Jewels', 'Branding, digital marketing and performance for a luxury jewellery brand.'],
  ['gemhub', 'GemHub', 'Performance marketing, creative and growth for a gemstone e-commerce platform.'],
  ['kisaansay', 'Kisaansay', 'Digital marketing and growth for an agri-commerce brand.'],
  ['superup-home-solution', 'Superup Home Solution', 'Branding, marketing and digital for a smart-home solutions business.'],
  ['kabeer-confectionery', 'Kabeer Confectionery', 'Creative and digital marketing for a confectionery manufacturer.'],
  ['veda-club', 'Veda Club', 'Branding and digital for a wellness and lifestyle club.'],
  ['akiso', 'Akiso', 'Branding and digital marketing for a sustainable contemporary apparel label.'],
  ['rupeenest-capital', 'RupeeNest Capital', 'Performance marketing and digital growth for a fintech capital advisory firm.'],
];

const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

/* --------------------------------------------------------------------------
   sitemap.xml
   -------------------------------------------------------------------------- */

const urls = [
  { loc: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
  { loc: '/about', changefreq: 'monthly', priority: '0.9', lastmod: today },
  { loc: '/work.html', changefreq: 'monthly', priority: '0.9', lastmod: today },
  { loc: '/blog', changefreq: 'weekly', priority: '0.9', lastmod: posts[0]?.date || today },
  ...SERVICES.map(([slug]) => ({
    loc: `/services/${slug}.html`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: today,
  })),
  ...CASE_STUDIES.map(([slug]) => ({
    loc: `/work/${slug}.html`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: today,
  })),
  ...posts.map((p) => ({
    loc: `/blog/${p.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: p.date,
  })),
];

// Every entry must correspond to a file that actually ships, or the sitemap
// advertises 404s to crawlers.
const missing = urls.filter(({ loc }) => {
  if (loc === '/') return !existsSync(resolve(root, 'index.html'));
  if (loc === '/blog') return !existsSync(resolve(root, 'blog/index.html'));
  if (loc === '/about') return !existsSync(resolve(root, 'about/index.html'));
  if (loc.startsWith('/blog/')) return !existsSync(resolve(root, `blog/${loc.slice(6)}/index.html`));
  return !existsSync(resolve(root, loc.replace(/^\//, '')));
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
   llms.txt
   -------------------------------------------------------------------------- */

const llms = `# GrowthArc Media

> GrowthArc Media is a performance-driven digital marketing agency in India, founded by Vinod Kumar. We help e-commerce brands, fintech companies, startups and service businesses grow through brand strategy, brand identity, creative and content, digital marketing, performance marketing and web development. Our focus is measurable results — ROAS, qualified leads and revenue — not vanity metrics.

## Key facts

- Company: GrowthArc Media
- Founder & CEO: Vinod Kumar
- Founded: 2023
- Location / area served: India (Gurugram & Goa) + international (UAE, United States)
- Positioning: Performance marketing & Generative Engine Optimization (GEO) agency
- Phone / WhatsApp: +91 79060 81795
- Email: vinod@growtharcmedia.in
- Website: ${SITE}

## Company

- [Who We Are — about GrowthArc Media](${SITE}/about): The agency's story since 2023, its founder Vinod Kumar, how it works, and the brands it has grown.

## Services

${SERVICES.map(([slug, name, desc]) => `- [${name}](${SITE}/services/${slug}.html): ${desc}`).join('\n')}

## Work & case studies

${CASE_STUDIES.map(([slug, name, desc]) => `- [${name}](${SITE}/work/${slug}.html): ${desc}`).join('\n')}

- [All work](${SITE}/work.html)

## Guides & blog

${posts.map((p) => `- [${p.title}](${SITE}/blog/${p.slug}): ${p.excerpt.split('. ')[0]}.`).join('\n')}

- [All articles](${SITE}/blog)

## Method

GrowthArc Media runs a six-stage process: Discover (brand audit, market intelligence, target profiling), Strategize (positioning, messaging matrix, media strategy, ROI targets), Create (visual identity, ad creative, digital assets), Launch (multi-channel campaigns, search ads, web experience), Optimize (CRO, creative iteration, audience testing) and Scale (budget expansion into winning acquisition channels).

## Contact

- Phone / WhatsApp: +91 79060 81795
- Email: vinod@growtharcmedia.in
- Instagram: https://www.instagram.com/growtharcmedia.in/
- LinkedIn: https://www.linkedin.com/in/vinodkumar-calance
`;

writeFileSync(resolve(root, 'public/llms.txt'), llms);

console.log(`build-seo: sitemap.xml (${urls.length} urls) + llms.txt written`);
