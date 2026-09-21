// Generates the "Who We Are" page at /about.
//
// /about was a real URL on the previous site, so it is kept rather than
// invented — old links and anything indexed against it keep resolving.
// Emitted as about/index.html, which a static host serves at /about.

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { agency, proofPoints, clients, story, principles } from '../src/data/about.js';
import { SITE, esc, head, header, footer, modal } from './lib/page-chrome.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SERVICE = 'About Page Inquiry';

const DESCRIPTION =
  `GrowthArc Media is a digital marketing and performance agency founded in ${agency.founded} by ${agency.founder}. ` +
  `We unite brand strategy, creative, performance marketing and web engineering into one growth engine — ` +
  `and we have done it for ${clients.length} brands across jewellery, fintech, FMCG, wellness, retail and agri-commerce.`;

/* --------------------------------------------------------------------------
   Schema — AboutPage plus the founder, tied back to the Organization node
   the homepage already declares.
   -------------------------------------------------------------------------- */

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE}/about#aboutpage`,
    name: `Who We Are — ${agency.name}`,
    description: DESCRIPTION,
    url: `${SITE}/about`,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
    mainEntity: {
      '@type': 'Person',
      '@id': `${SITE}/#founder`,
      name: agency.founder,
      jobTitle: agency.founderRole,
      image: SITE + agency.founderImage,
      email: agency.email,
      telephone: '+91-7906081795',
      worksFor: { '@id': `${SITE}/#organization` },
      sameAs: [agency.instagram, agency.linkedin],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE}/about` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE}/about#clients`,
    name: 'GrowthArc Media clients',
    numberOfItems: clients.length,
    itemListElement: clients.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Organization',
        name: c.name,
        ...(c.website ? { url: `https://${c.website}` } : {}),
        description: c.industry,
      },
    })),
  },
];

/* --------------------------------------------------------------------------
   Sections
   -------------------------------------------------------------------------- */

const hero = () => `
      <section class="case-hero-section about-hero">
        <div class="site-container">
          <span class="section-label text-yellow">(WHO WE ARE)</span>
          <h1 class="case-hero-title">
            WE BUILD<br>GROWTH<span class="dot-pink">.</span>
          </h1>
          <p class="case-hero-tagline">${esc(DESCRIPTION)}</p>

          <div class="about-proof-row">
            ${proofPoints
              .map(
                (p) => `<div class="about-proof">
              <span class="about-proof-value">${esc(p.value)}</span>
              <span class="about-proof-label">${esc(p.label)}</span>
            </div>`
              )
              .join('\n            ')}
          </div>
        </div>
      </section>`;

const founderSection = () => `
      <section class="section-editorial bg-secondary-panel">
        <div class="site-container">
          <div class="editorial-grid">
            <div class="grid-left">
              <figure class="about-founder-frame">
                <img src="${esc(agency.founderImage)}" alt="${esc(agency.founder)}, ${esc(agency.founderRole)} of ${esc(agency.name)}" loading="lazy" decoding="async" />
              </figure>
            </div>
            <div class="grid-right">
              <span class="section-label">(FOUNDER)</span>
              <h2 class="editorial-heading">${esc(agency.founder)}</h2>
              <p class="about-founder-role">${esc(agency.founderRole)}</p>
              <div class="editorial-prose mt-6">
                <p>
                  GrowthArc Media started in ${agency.founded} out of a frustration Vinod kept running into
                  on the client side: a brand agency writing the positioning, a creative shop making the
                  ads, and a media buyer spending the budget &mdash; three invoices, three opinions, and
                  nobody accountable for the revenue at the end of it.
                </p>
                <p>
                  So the agency was built the other way round. One team owns the strategy, the creative,
                  the media and the code, and reports against one number: what the business actually
                  earned. That is still how every account runs today.
                </p>
              </div>
              <div class="action-row mt-8">
                <a href="${esc(agency.linkedin)}" target="_blank" rel="noopener" class="btn-secondary-action">
                  <i class="fab fa-linkedin-in"></i> Connect on LinkedIn
                </a>
                <a href="mailto:${esc(agency.email)}" class="btn-text-link">${esc(agency.email)}</a>
              </div>
            </div>
          </div>
        </div>
      </section>`;

const storySection = () => `
      <section class="section-editorial">
        <div class="site-container">
          <div class="section-header-block mb-80">
            <span class="section-label text-pink">(THE ARC)</span>
            <h2 class="editorial-heading uppercase">From ${agency.founded} To Now</h2>
          </div>
          <ol class="about-timeline">
            ${story
              .map(
                (s) => `<li class="about-timeline-item">
              <span class="about-timeline-year">${esc(s.year)}</span>
              <div class="about-timeline-body">
                <h3 class="about-timeline-title">${esc(s.title)}</h3>
                <p>${esc(s.body)}</p>
              </div>
            </li>`
              )
              .join('\n            ')}
          </ol>
        </div>
      </section>`;

const principlesSection = () => `
      <section class="section-editorial bg-secondary-panel">
        <div class="site-container">
          <div class="section-header-block mb-80">
            <span class="section-label text-green">(HOW WE WORK)</span>
            <h2 class="editorial-heading uppercase">Four Things We Do Not Bend On</h2>
          </div>
          <div class="about-principles-grid">
            ${principles
              .map(
                (p) => `<article class="about-principle">
              <i class="fas ${esc(p.icon)} ${esc(p.accent)} about-principle-icon"></i>
              <h3 class="about-principle-title">${esc(p.title)}</h3>
              <p class="about-principle-body">${esc(p.body)}</p>
            </article>`
              )
              .join('\n            ')}
          </div>
        </div>
      </section>`;

const clientCard = (c) => {
  const inner = `
                ${
                  c.logo
                    ? `<div class="about-client-logo"><img src="${esc(c.logo)}" alt="${esc(c.name)} logo" loading="lazy" decoding="async" /></div>`
                    : `<div class="about-client-logo about-client-initials"><span>${esc(
                        c.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      )}</span></div>`
                }
                <div class="about-client-meta">
                  <h3 class="about-client-name">${esc(c.name)}</h3>
                  <p class="about-client-industry">${esc(c.industry)}</p>
                  ${c.website ? `<p class="about-client-site">${esc(c.website)}</p>` : ''}
                </div>`;

  // Only the brands with a published case study become links — the rest would
  // be a link to nowhere.
  return c.caseStudy
    ? `<a href="${esc(c.caseStudy)}" class="about-client about-client-linked">${inner}
                <span class="about-client-cta">View case study <i class="fas fa-arrow-right"></i></span>
              </a>`
    : `<div class="about-client">${inner}
              </div>`;
};

const clientsSection = () => `
      <section class="section-editorial">
        <div class="site-container">
          <div class="section-header-block mb-80">
            <span class="section-label text-orange">(WHO WE HAVE GROWN)</span>
            <h2 class="editorial-heading uppercase">${clients.length} Brands, ${
              new Set(clients.map((c) => c.category)).size
            } Industries</h2>
            <p class="section-subtext">
              Jewellery, fintech, confectionery, wellness, apparel, real estate, agri-commerce and
              manufacturing. Different categories, same job: make the marketing pay for itself.
            </p>
          </div>
          <div class="about-clients-grid">
            ${clients.map(clientCard).join('\n            ')}
          </div>
          <div class="text-center mt-60">
            <a href="/work.html" class="btn-secondary-action">
              <span>See The Case Studies</span>
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>`;

const ctaSection = () => `
      <section class="section-cta">
        <div class="site-container text-center">
          <span class="section-label text-yellow">(START YOUR GROWTH ARC)</span>
          <h2 class="cta-massive-statement uppercase">LET'S BUILD<br><span class="text-gradient">WHAT'S NEXT.</span></h2>
          <div class="cta-actions-row">
            <button type="button" class="btn-cta btn-large open-modal-btn" data-service="${esc(SERVICE)}">
              <span>Talk to an Expert</span>
              <i class="fas fa-arrow-right icon-arrow"></i>
            </button>
            <a href="https://api.whatsapp.com/send?phone=${esc(agency.phoneRaw)}" target="_blank" rel="noopener" class="btn-secondary-action">
              <i class="fab fa-whatsapp text-green"></i> ${esc(agency.phone)}
            </a>
          </div>
        </div>
      </section>`;

/* --------------------------------------------------------------------------
   Emit
   -------------------------------------------------------------------------- */

const page = `${head({
  title: `Who We Are — Digital Marketing Agency Since ${agency.founded} | ${agency.name}`,
  description: DESCRIPTION,
  canonical: '/about',
  image: `${SITE}/og-image.png`,
  extraMeta: '    <meta property="og:type" content="profile" />',
  schema,
})}
${header(SERVICE)}
    <main class="case-study-page about-page">
${hero()}
${founderSection()}
${storySection()}
${principlesSection()}
${clientsSection()}
${ctaSection()}
    </main>
${footer()}
${modal(SERVICE)}`;

const dir = resolve(root, 'about');
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'index.html'), page);

console.log(`build-about: wrote /about (${clients.length} clients, ${story.length} milestones)`);
