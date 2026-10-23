/* Generates the industry and location hub pages.
 *
 * Routes are extensionless directories — /industries/<slug>/index.html — so a
 * static host serves them at the clean URL the SEO playbook specifies, and
 * they survive refresh, back/forward and direct entry like every other page
 * on the site. No new layout: each page is assembled from the classes the
 * hand-authored pages already use.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hubs, SERVICE_LINKS } from '../src/data/hubs.js';
import { agency } from '../src/data/about.js';
import { SITE, esc, head, header, footer, modal } from './lib/page-chrome.mjs';
import {
  organizationNode,
  faqPageNode,
  serviceNode,
  breadcrumbNode,
  graph,
} from './lib/seo-schema.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const GROUP_LABEL = {
  industries: 'Industries We Scale',
  locations: 'Locations',
};

/* --------------------------------------------------------------------------
   Sections
   -------------------------------------------------------------------------- */

const hero = (hub) => `
      <section class="case-hero-section">
        <div class="site-container">
          <span class="section-label text-pink">${esc(hub.label)}</span>
          <div class="case-hero-title" role="presentation">${hub.display}<span class="dot-yellow">.</span></div>
          <h1 class="page-seo-h1">${esc(hub.h1)}</h1>
          <p class="case-hero-tagline">${esc(hub.lede)}</p>

          <div class="about-proof-row">
            ${hub.stats
              .map(
                (s) => `<div class="about-proof">
              <span class="about-proof-value">${esc(s.value)}</span>
              <span class="about-proof-label">${esc(s.label)}</span>
            </div>`
              )
              .join('\n            ')}
          </div>
        </div>
      </section>`;

const contentSection = (s, i) => `
      <section class="section-editorial${i % 2 ? ' bg-secondary-panel border-t-line' : ''}">
        <div class="site-container">
          <div class="editorial-grid">
            <div class="grid-left">
              <span class="section-label">${esc(s.label)}</span>
              <h2 class="editorial-heading">${esc(s.heading)}</h2>
              <div class="editorial-prose mt-6">
                ${s.body.map((p) => `<p>${esc(p)}</p>`).join('\n                ')}
              </div>
            </div>
            <div class="grid-right">
              ${
                s.bullets
                  ? `<span class="section-label text-pink">${esc(s.bulletLabel)}</span>
              <ul class="capability-list text-xl mb-8">
                ${s.bullets
                  .map((b) => `<li><i class="fas fa-asterisk text-pink"></i> ${esc(b)}</li>`)
                  .join('\n                ')}
              </ul>`
                  : ''
              }
            </div>
          </div>
        </div>
      </section>`;

const casesSection = (hub) => `
      <section class="section-editorial border-t-line">
        <div class="site-container">
          <span class="section-label text-yellow">(PROOF)</span>
          <h2 class="editorial-heading">Brands we have already done this for.</h2>
          <div class="about-clients-grid mt-12">
            ${hub.cases
              .map(
                (c) => `<a href="${esc(c.href)}" class="about-client about-client-linked">
              <div class="about-client-meta">
                <h3 class="about-client-name">${esc(c.name)}</h3>
                <p class="about-client-industry">${esc(c.sector)}</p>
                <p class="about-client-site">${esc(c.line)}</p>
              </div>
              <span class="about-client-cta">View case study <i class="fas fa-arrow-right"></i></span>
            </a>`
              )
              .join('\n            ')}
          </div>
        </div>
      </section>`;

const servicesSection = (hub) => `
      <section class="section-editorial bg-secondary-panel border-t-line">
        <div class="site-container">
          <span class="section-label text-pink">(THE WORK ITSELF)</span>
          <h2 class="editorial-heading">The services this runs on.</h2>
          <div class="about-clients-grid mt-12">
            ${hub.services
              .map((slug) => {
                const s = SERVICE_LINKS[slug];
                return `<a href="/services/${esc(slug)}.html" class="about-client about-client-linked">
              <div class="about-client-meta">
                <h3 class="about-client-name">${esc(s.name)}</h3>
                <p class="about-client-site">${esc(s.line)}</p>
              </div>
              <span class="about-client-cta">See the service <i class="fas fa-arrow-right"></i></span>
            </a>`;
              })
              .join('\n            ')}
          </div>
        </div>
      </section>`;

const faqSection = (hub) => `
      <section class="section-editorial faq-section" id="faq">
        <div class="site-container">
          <span class="section-label text-yellow">(BUYER FAQ)</span>
          <h2 class="editorial-heading">Questions buyers actually ask.</h2>
          <div class="faq-list">
            ${hub.faqs
              .map(
                ({ q, a }) => `<details class="faq-item">
              <summary>
                <span>${esc(q)}</span>
                <span class="faq-marker" aria-hidden="true"></span>
              </summary>
              <p class="faq-answer">${esc(a)}</p>
            </details>`
              )
              .join('\n            ')}
          </div>
        </div>
      </section>`;

const ctaSection = (hub) => `
      <section class="section-cta border-t-line">
        <div class="site-container text-center">
          <span class="section-label text-yellow">(READY WHEN YOU ARE)</span>
          <h2 class="cta-massive-statement uppercase">LET'S TALK NUMBERS.</h2>
          <div class="cta-actions-row mt-8">
            <button type="button" class="btn-cta btn-large open-modal-btn" data-service="${esc(
              hub.nav
            )} Growth Audit">
              <span>Book a Growth Audit</span>
              <i class="fas fa-arrow-right icon-arrow"></i>
            </button>
            <a href="https://api.whatsapp.com/send?phone=${esc(
              agency.phoneRaw
            )}" target="_blank" rel="noopener" class="btn-secondary-action ml-4">
              <span>WhatsApp ${esc(agency.phone)}</span>
              <i class="fab fa-whatsapp ml-2"></i>
            </a>
          </div>
        </div>
      </section>`;

/* --------------------------------------------------------------------------
   Schema
   -------------------------------------------------------------------------- */

function hubSchema(hub, route) {
  const service = serviceNode(route, {
    name: hub.h1,
    description: hub.description,
    serviceType:
      hub.group === 'industries' ? 'Digital Marketing' : 'Performance Marketing',
  });

  // A city page says which city it serves; it does not claim an address there.
  // Gurugram is an office, so it carries the region too — Mumbai and Bengaluru
  // are markets served from Gurugram and Goa, and nothing here pretends
  // otherwise.
  if (hub.city) {
    service.areaServed = {
      '@type': 'City',
      name: hub.city,
      ...(hub.region
        ? { containedInPlace: { '@type': 'AdministrativeArea', name: hub.region } }
        : {}),
    };
  }

  return graph([
    organizationNode(),
    {
      '@type': 'WebPage',
      '@id': `${SITE}${route}#webpage`,
      url: `${SITE}${route}`,
      name: hub.title,
      description: hub.description,
      inLanguage: 'en-IN',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#organization` },
    },
    service,
    faqPageNode(route, hub.faqs),
    breadcrumbNode(route, [
      { name: GROUP_LABEL[hub.group] },
      { name: hub.nav },
    ]),
  ]);
}

/* --------------------------------------------------------------------------
   Emit
   -------------------------------------------------------------------------- */

for (const hub of hubs) {
  const route = `/${hub.group}/${hub.slug}`;
  const service = `${hub.nav} Inquiry`;

  const page = `${head({
    title: hub.title,
    description: hub.description,
    canonical: route,
    image: `${SITE}/og-image.png`,
    extraMeta: '    <meta property="og:type" content="website" />',
    schema: [hubSchema(hub, route)],
  })}
${header(service)}
    <main class="case-study-page">
${hero(hub)}
${hub.sections.map(contentSection).join('\n')}
${casesSection(hub)}
${servicesSection(hub)}
${faqSection(hub)}
${ctaSection(hub)}
    </main>
${footer()}
${modal(service)}`;

  const dir = resolve(root, hub.group, hub.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'index.html'), page);
}

console.log(
  `build-hubs: wrote ${hubs.length} hub pages (` +
    `${hubs.filter((h) => h.group === 'industries').length} industries, ` +
    `${hubs.filter((h) => h.group === 'locations').length} locations)`
);
