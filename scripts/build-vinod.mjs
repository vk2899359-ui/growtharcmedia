// Generates the Vinod Kumar personal brand page at /vinod-kumar.
//
// Every string rendered here comes from src/data/vinod.js, which is itself
// transcribed from the CV. This file decides layout only — if a claim is not
// in the data file it does not appear on the page.

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  profile,
  heroStats,
  about,
  timeline,
  careerArc,
  proofPoints,
  expertise,
  caseStudies,
  stack,
  credentials,
  story,
  roleFit,
  recommendations,
} from '../src/data/vinod.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://growtharcmedia.in';
const PATH = '/vinod-kumar';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

const DESCRIPTION =
  `${profile.name} — ${profile.currentRole} at ${profile.currentCompany}. ` +
  '10+ years across multi-location retail marketing and full-stack digital growth. ' +
  'Meta Ads, Google Ads, ChatGPT Ads, AI content production and a team of 15. ' +
  'Built paid acquisition and the measurement stack from zero: 30% CPL reduction in 90 days.';

/* --------------------------------------------------------------------------
   Schema — a Person tied to their real employment history.
   -------------------------------------------------------------------------- */

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${SITE}${PATH}#page`,
    name: `${profile.name} — ${profile.currentRole}`,
    description: DESCRIPTION,
    url: SITE + PATH,
    inLanguage: 'en-IN',
    mainEntity: { '@id': `${SITE}${PATH}#person` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE}${PATH}#person`,
    name: profile.name,
    givenName: 'Vinod',
    familyName: 'Kumar',
    jobTitle: profile.currentRole,
    email: `mailto:${profile.email}`,
    telephone: '+91-7906081795',
    url: SITE + PATH,
    address: { '@type': 'PostalAddress', addressLocality: 'Gurgaon', addressRegion: 'Haryana', addressCountry: 'IN' },
    worksFor: { '@type': 'Organization', name: profile.currentCompany },
    alumniOf: credentials.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.place })),
    hasCredential: credentials.certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c,
    })),
    knowsLanguage: ['Hindi', 'English'],
    knowsAbout: [
      'Performance Marketing',
      'Meta Ads',
      'Google Ads',
      'ChatGPT Ads',
      'Generative Engine Optimization',
      'AI Content Production',
      'Marketing Automation',
      'Google Analytics 4',
      'Conversions API',
      'Retail Marketing',
      'Team Leadership',
    ],
    sameAs: [profile.linkedin],
    // Only the roles the CV states, with their stated dates.
    hasOccupation: timeline.map((t) => ({
      '@type': 'OrganizationRole',
      roleName: t.role,
      namedPosition: t.role,
      startDate: t.years,
      memberOf: { '@type': 'Organization', name: t.company },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: profile.name, item: SITE + PATH },
    ],
  },
];

/* --------------------------------------------------------------------------
   Sections
   -------------------------------------------------------------------------- */

const NAV = [
  ['#about', 'About'],
  ['#journey', 'Journey'],
  ['#results', 'Results'],
  ['#expertise', 'Expertise'],
  ['#work', 'Case Studies'],
  ['#stack', 'Stack'],
  ['#contact', 'Contact'],
];

const nav = () => `
    <nav class="vk-nav" id="vkNav" aria-label="Primary">
      <div class="vk-shell vk-nav-inner">
        <a href="#top" class="vk-brand">
          <span class="vk-brand-name">${esc(profile.name)}</span>
          <span class="vk-brand-role">${esc(profile.currentRole)} &middot; Performance Marketing</span>
        </a>

        <div class="vk-nav-links">
          ${NAV.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join('\n          ')}
        </div>

        <a href="#contact" class="vk-nav-cta">Let's Talk Growth</a>
      </div>
    </nav>`;

const hero = () => `
    <header class="vk-hero" id="top">
      <div class="vk-shell vk-hero-inner">
        <div class="vk-hero-meta">
          <span class="vk-chip vk-chip-live"><span class="vk-dot"></span>${esc(profile.availability)}</span>
          <span class="vk-chip">${esc(profile.location)}</span>
          <span class="vk-chip">${esc(profile.currentRole)} &middot; ${esc(profile.currentCompany)}</span>
        </div>

        <h1 class="vk-h1">Marketing That Turns Attention Into <em>Growth</em>.</h1>

        <p class="vk-hero-sub">${esc(profile.subheadline)}</p>

        <div class="vk-hero-actions">
          <a href="#journey" class="vk-btn vk-btn-primary">Explore My Journey</a>
          <a href="#contact" class="vk-btn vk-btn-ghost">Let's Talk Growth</a>
        </div>

        <div class="vk-hero-roles">
          ${profile.rolePills.map((r) => `<span class="vk-chip">${esc(r)}</span>`).join('\n          ')}
        </div>

        <div class="vk-stats">
          ${heroStats
            .map(
              (s) => `<div class="vk-stat">
            <div class="vk-stat-value"><span data-count="${s.value}" data-suffix="${esc(s.suffix)}">${s.value}${esc(s.suffix)}</span></div>
            <div class="vk-stat-label">${esc(s.label)}</div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </header>`;

const aboutSection = () => `
    <section class="vk-section vk-section-alt" id="about">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">About</span>
          <h2 class="vk-h2">Marketing from both sides of the counter.</h2>
        </div>

        <div class="vk-about-grid">
          <div class="vk-about-body">
            <p>${esc(about.lead)}</p>
            ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n            ')}
          </div>

          <div class="vk-sides">
            ${about.bothSides
              .map(
                (s) => `<div class="vk-side">
              <div class="vk-side-label">${esc(s.side)}</div>
              <p>${esc(s.body)}</p>
            </div>`
              )
              .join('\n            ')}
          </div>
        </div>

        <div class="vk-arc">
          ${careerArc
            .map((step, i) =>
              i === 0
                ? `<span class="vk-arc-step">${esc(step)}</span>`
                : `<span class="vk-arc-sep" aria-hidden="true">&rarr;</span>\n          <span class="vk-arc-step">${esc(step)}</span>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const journey = () => `
    <section class="vk-section" id="journey">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Professional Journey</span>
          <h2 class="vk-h2">Ten years, five companies, one direction.</h2>
          <p class="vk-lede">
            From a first social-media role in Kashipur to leading a team of 15 for a
            US-headquartered firm in Gurgaon. Select any role to open it.
          </p>
        </div>

        <div class="vk-timeline">
          ${timeline
            .map(
              (t) => `<article class="vk-tl-item" data-role="${esc(t.id)}">
            <button type="button" class="vk-tl-head" aria-expanded="false" aria-controls="tl-${esc(t.id)}">
              <span class="vk-tl-year">${esc(t.years)}</span>
              <span class="vk-tl-main">
                <span class="vk-tl-role">${esc(t.role)}</span>
                <span class="vk-tl-co">
                  <strong>${esc(t.company)}</strong>
                  <span aria-hidden="true">&middot;</span>
                  ${esc(t.location)}
                  <span aria-hidden="true">&middot;</span>
                  ${esc(t.sector)}
                </span>
              </span>
              <span class="vk-tl-right">
                ${t.current ? '<span class="vk-tl-now"><span class="vk-dot"></span>Current</span>' : ''}
                <span class="vk-tl-period">${esc(t.period)}</span>
                <span class="vk-tl-toggle" aria-hidden="true"></span>
              </span>
            </button>

            <div class="vk-tl-body" id="tl-${esc(t.id)}">
              <div>
                <div class="vk-tl-inner">
                  <div>
                    <p class="vk-tl-summary">${esc(t.summary)}</p>
                    <ul class="vk-tl-points">
                      ${t.points.map((p) => `<li>${esc(p)}</li>`).join('\n                      ')}
                    </ul>
                  </div>
                  <div class="vk-tl-aside">
                    <dl class="vk-tl-fact">
                      <dt>What I owned</dt>
                      <dd>${esc(t.owned)}</dd>
                    </dl>
                    <dl class="vk-tl-fact vk-tl-fact-gold">
                      <dt>Key contribution</dt>
                      <dd>${esc(t.highlight)}</dd>
                    </dl>
                    <dl class="vk-tl-fact">
                      <dt>Period</dt>
                      <dd>${esc(t.period)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const wall = () => `
    <section class="vk-section vk-section-alt" id="companies">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Where I've Built Experience</span>
          <h2 class="vk-h2">Five companies. Retail floor to US-headquartered software.</h2>
        </div>

        <div class="vk-wall">
          ${[...timeline]
            .reverse()
            .map(
              (t) => `<div class="vk-wall-cell">
            <span class="vk-wall-mark">${esc(t.mark)}</span>
            <span class="vk-wall-years">${esc(t.period)}</span>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const results = () => `
    <section class="vk-section" id="results">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Proof of Performance</span>
          <h2 class="vk-h2">Numbers, and what sits behind them.</h2>
          <p class="vk-lede">
            Every figure here is one I own and can walk through — the problem, what I
            actually changed, and what it moved.
          </p>
        </div>

        <div class="vk-proof-grid">
          ${proofPoints
            .map(
              (p) => `<article class="vk-proof">
            <div class="vk-proof-metric">
              <span class="vk-proof-value">${esc(p.metric)}</span>
              <span class="vk-proof-label">${esc(p.label)}<span class="vk-proof-sub">${esc(p.sub)}</span></span>
            </div>
            <div class="vk-car">
              <div class="vk-car-row"><span class="vk-car-key">Challenge</span><span class="vk-car-val">${esc(p.challenge)}</span></div>
              <div class="vk-car-row"><span class="vk-car-key">What I did</span><span class="vk-car-val">${esc(p.action)}</span></div>
              <div class="vk-car-row"><span class="vk-car-key">Result</span><span class="vk-car-val">${esc(p.result)}</span></div>
            </div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const expertiseSection = () => `
    <section class="vk-section vk-section-alt" id="expertise">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">What I Do</span>
          <h2 class="vk-h2">The whole paid funnel, plus the creative that runs on it.</h2>
        </div>

        <div class="vk-exp-grid">
          ${expertise
            .map(
              (e) => `<article class="vk-exp">
            <div class="vk-exp-top">
              <h3 class="vk-exp-title">${esc(e.title)}</h3>
              <span class="vk-exp-level">${esc(e.level)}</span>
            </div>
            <p class="vk-exp-blurb">${esc(e.blurb)}</p>
            <ul class="vk-exp-items">
              ${e.items.map((i) => `<li>${esc(i)}</li>`).join('\n              ')}
            </ul>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const work = () => `
    <section class="vk-section" id="work">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Case Studies</span>
          <h2 class="vk-h2">Four problems, and how they were solved.</h2>
        </div>

        <div class="vk-cases">
          ${caseStudies
            .map(
              (c) => `<article class="vk-case">
            <span class="vk-case-n">${esc(c.n)}</span>
            <div>
              <h3 class="vk-case-title">${esc(c.title)}</h3>
              <p class="vk-case-co">${esc(c.company)}</p>
              <div class="vk-car">
                <div class="vk-car-row"><span class="vk-car-key">Challenge</span><span class="vk-car-val">${esc(c.challenge)}</span></div>
                <div class="vk-car-row"><span class="vk-car-key">Action</span><span class="vk-car-val">${esc(c.action)}</span></div>
                <div class="vk-car-row"><span class="vk-car-key">Result</span><span class="vk-car-val">${esc(c.result)}</span></div>
              </div>
              <ul class="vk-case-tags">
                ${c.tags.map((t) => `<li>${esc(t)}</li>`).join('\n                ')}
              </ul>
            </div>
          </article>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const stackSection = () => `
    <section class="vk-section vk-section-alt" id="stack">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Tools &amp; Technology</span>
          <h2 class="vk-h2">What I work in daily.</h2>
        </div>

        <div class="vk-stack-grid">
          ${stack
            .map(
              (g) => `<div class="vk-stack-col">
            <h3 class="vk-stack-group">${esc(g.group)}</h3>
            <ul class="vk-stack-tools">
              ${g.tools.map((t) => `<li>${esc(t)}</li>`).join('\n              ')}
            </ul>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>`;

const storySection = () => `
    <section class="vk-section" id="story">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Background</span>
          <h2 class="vk-h2">${esc(story.title)}</h2>
        </div>
        <div class="vk-story">
          ${story.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n          ')}
          <p class="vk-story-pin">${esc(story.pin)}</p>
        </div>
      </div>
    </section>`;

const credentialsSection = () => `
    <section class="vk-section vk-section-alt" id="credentials">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Credentials</span>
          <h2 class="vk-h2">Certifications, education, languages.</h2>
        </div>

        <div class="vk-cred-grid">
          <div class="vk-cred">
            <h3>Certifications</h3>
            <ul>${credentials.certifications.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
          </div>
          <div class="vk-cred">
            <h3>Education</h3>
            <ul>${credentials.education
              .map((e) => `<li><strong>${esc(e.title)}</strong>${esc(e.place)}<br><em>${esc(e.years)}</em></li>`)
              .join('')}</ul>
          </div>
          <div class="vk-cred">
            <h3>Languages</h3>
            <ul>${credentials.languages.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
          </div>
        </div>

        <div class="vk-fit" style="margin-top:20px">
          <p class="vk-fit-statement">${esc(roleFit.statement)}</p>
          <div class="vk-fit-cols">
            <div>
              <h3>Target Roles</h3>
              <ul>${roleFit.targetRoles.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
            </div>
            <div>
              <h3>Availability</h3>
              <ul>${roleFit.availability.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
            </div>
          </div>
        </div>
      </div>
    </section>`;

const recs = () => `
    <section class="vk-section" id="recommendations">
      <div class="vk-shell">
        <div class="vk-head">
          <span class="vk-eyebrow">Professional Recommendations</span>
          <h2 class="vk-h2">What people I've worked with say.</h2>
        </div>

        ${
          recommendations.length
            ? `<div class="vk-rec-grid">
          ${recommendations
            .map(
              (r) => `<figure class="vk-rec">
            <blockquote>&ldquo;${esc(r.quote)}&rdquo;</blockquote>
            <figcaption>
              <span class="vk-rec-author">${esc(r.author)}</span>
              <span class="vk-rec-role">${esc(r.role)}${r.company ? `, ${esc(r.company)}` : ''}</span>
              ${r.via ? `<span class="vk-rec-via">via ${esc(r.via)}</span>` : ''}
            </figcaption>
          </figure>`
            )
            .join('\n          ')}
        </div>`
            : `<div class="vk-rec-empty">
          <p>Recommendations from colleagues, leaders and business partners will be added here.</p>
        </div>`
        }
      </div>
    </section>`;

const contact = () => `
    <section class="vk-section vk-contact" id="contact">
      <div class="vk-shell vk-contact-inner">
        <h2>Have a growth problem worth solving?</h2>
        <p>Let's discuss the acquisition, performance or marketing challenge you're trying to solve.</p>

        <div class="vk-contact-actions">
          <a href="mailto:${esc(profile.email)}" class="vk-btn vk-btn-primary">Let's Talk</a>
          <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener" class="vk-btn vk-btn-ghost">View LinkedIn</a>
          <a href="mailto:${esc(profile.email)}" class="vk-btn vk-btn-gold">Email Me</a>
        </div>

        <div class="vk-contact-direct">
          <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
          <a href="tel:+${esc(profile.phoneRaw)}">${esc(profile.phone)}</a>
          <span>${esc(profile.location)}</span>
          <span>${esc(profile.availability)}</span>
        </div>
      </div>
    </section>`;

const footer = () => `
    <footer class="vk-footer">
      <div class="vk-shell">
        <div class="vk-footer-top">
          <div>
            <div class="vk-footer-name">${esc(profile.name)}</div>
            <ul class="vk-footer-tags">
              <li>Marketing Head</li>
              <li>Performance Marketing</li>
              <li>AI Growth</li>
              <li>Meta Ads</li>
              <li>Google Ads</li>
            </ul>
          </div>
          <div class="vk-footer-links">
            <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>
            <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener">${esc(profile.linkedinLabel)}</a>
            <a href="tel:+${esc(profile.phoneRaw)}">${esc(profile.phone)}</a>
            <a href="/">growtharcmedia.in</a>
          </div>
        </div>
        <div class="vk-footer-bottom">
          <span>${esc(profile.location)}</span>
          <span>&copy; 2023&ndash;2026 ${esc(profile.name)}</span>
        </div>
      </div>
    </footer>`;

/* --------------------------------------------------------------------------
   Emit
   -------------------------------------------------------------------------- */

const page = `<!DOCTYPE html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
    <meta name="theme-color" content="#05070d" />

    <title>${esc(profile.name)} — ${esc(profile.currentRole)} | Performance Marketing, Meta &amp; Google Ads</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${SITE}${PATH}" />
    <meta name="author" content="${esc(profile.name)}" />
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="Gurgaon, India" />

    <meta property="og:type" content="profile" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="${esc(profile.name)}" />
    <meta property="og:title" content="${esc(profile.name)} — ${esc(profile.currentRole)}" />
    <meta property="og:description" content="${esc(profile.subheadline)}" />
    <meta property="og:url" content="${SITE}${PATH}" />
    <meta property="og:image" content="${SITE}/og-image.png" />
    <meta property="profile:first_name" content="Vinod" />
    <meta property="profile:last_name" content="Kumar" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(profile.name)} — ${esc(profile.currentRole)}" />
    <meta name="twitter:description" content="${esc(profile.subheadline)}" />
    <meta name="twitter:image" content="${SITE}/og-image.png" />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/src/vinod.css" />

${schema.map((s) => '    ' + jsonLd(s)).join('\n')}
  </head>
  <body class="vk">
    <a href="#top" class="vk-skip">Skip to content</a>
${nav()}
    <main>
${hero()}
${aboutSection()}
${journey()}
${wall()}
${results()}
${expertiseSection()}
${work()}
${stackSection()}
${storySection()}
${credentialsSection()}
${recs()}
${contact()}
    </main>
${footer()}
    <script type="module" src="/src/vinod.js"></script>
  </body>
</html>
`;

const dir = resolve(root, 'vinod-kumar');
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'index.html'), page);

console.log(
  `build-vinod: wrote ${PATH} (${timeline.length} roles, ${proofPoints.length} proof points, ` +
    `${caseStudies.length} case studies, ${recommendations.length} recommendations)`
);
