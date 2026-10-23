/* Shared structured data — the Organization / ProfessionalService node and the
 * FAQPage node every page builds on.
 *
 * The homepage already carries the full entity graph it has always carried.
 * What the service, industry and location pages were missing is any link back
 * to that entity, so each of them now emits a compact reference to the same
 * @id plus its own FAQPage. One definition, so the agency's name, phone,
 * address and founder cannot say one thing on one page and another elsewhere.
 */

export const SITE = 'https://growtharcmedia.in';

export const ORG_ID = `${SITE}/#organization`;
export const FOUNDER_ID = `${SITE}/#founder`;

/** The Organization + ProfessionalService node, as the SEO playbook specifies. */
export function organizationNode() {
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: 'GrowthArc Media',
    url: `${SITE}/`,
    logo: `${SITE}/logo.png`,
    email: 'vinod@growtharcmedia.in',
    telephone: '+91-7906081795',
    foundingDate: '2023',
    founder: {
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: 'Vinod Kumar',
      jobTitle: 'Founder & CEO',
      image: `${SITE}/founder-vinod-kumar.webp`,
      sameAs: ['https://www.linkedin.com/in/vinodkumar-calance'],
    },
    description:
      'GrowthArc Media is an integrated digital marketing, performance marketing (5.8x average ROAS), brand identity, and Next.js web engineering agency in India.',
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'Country', name: 'United States' },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        addressCountry: 'IN',
      },
      {
        '@type': 'PostalAddress',
        addressLocality: 'Panjim',
        addressRegion: 'Goa',
        addressCountry: 'IN',
      },
    ],
    priceRange: '$$$',
    sameAs: [
      'https://www.instagram.com/growtharcmedia.in/',
      'https://www.linkedin.com/in/vinodkumar-calance',
    ],
    knowsAbout: [
      'Performance Marketing',
      'Meta Ads',
      'Google Ads',
      'Search Engine Optimization (SEO)',
      'Generative Engine Optimization (GEO)',
      'Next.js Web Development',
      'D2C E-Commerce Growth',
      'Brand Identity & Packaging Design',
      'UGC Video Production',
    ],
  };
}

/** FAQPage node for one page, built from that page's visible accordion. */
export function faqPageNode(path, items) {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE}${path}#faq`,
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** A Service node tied to the Organization that provides it. */
export function serviceNode(path, { name, description, serviceType }) {
  return {
    '@type': 'Service',
    '@id': `${SITE}${path}#service`,
    name,
    description,
    serviceType,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'India' },
    url: `${SITE}${path}`,
  };
}

/** BreadcrumbList for a page one or two levels below the root. */
export function breadcrumbNode(path, trail) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE}${path}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      ...trail.map(({ name, url }, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name,
        ...(url ? { item: `${SITE}${url}` } : {}),
      })),
    ],
  };
}

/** Wraps nodes in a @graph document. */
export function graph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
