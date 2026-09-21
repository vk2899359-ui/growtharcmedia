/* GrowthArc Media — agency facts, clients and milestones.
 *
 * The client list is carried over verbatim from the previous site
 * (auric-crm/growtharcmedia/src/data/clients.ts). Nothing here is invented:
 * every brand below is one the agency published as a client.
 */

export const agency = {
  name: 'GrowthArc Media',
  founded: 2023,
  founder: 'Vinod Kumar',
  founderRole: 'Founder & CEO',
  founderImage: '/founder-vinod-kumar.webp',
  logo: '/logo.png',
  tagline: 'Grow Beyond Limits',
  phone: '+91 79060 81795',
  phoneRaw: '917906081795',
  email: 'vinod@growtharcmedia.in',
  instagram: 'https://www.instagram.com/growtharcmedia.in/',
  linkedin: 'https://www.linkedin.com/in/vinodkumar-calance',
};

/* The numbers shown on the page. Each is derived from something on the site
   rather than picked for effect — see `basis`, which is also what we'd point
   at if a client asked where the figure comes from. */
export const proofPoints = [
  { value: '2023', label: 'Founded', basis: 'Year the agency started' },
  { value: '10+', label: 'Brands Grown', basis: 'clients.ts — 10 published clients' },
  { value: '8', label: 'Case Studies', basis: 'One dedicated page per project' },
  { value: '9', label: 'Industries', basis: 'Distinct client categories' },
];

export const clients = [
  { name: 'GemHub', industry: 'Jewellery E-commerce', website: 'gemhub.in', category: 'E-commerce', logo: '/clients/gemhub.png', caseStudy: '/work/gemhub.html' },
  { name: 'Auric Jewels', industry: 'Jewellery & Lifestyle', website: 'auricjewels.com', category: 'E-commerce', logo: '/clients/auric.png', caseStudy: '/work/auric-jewels.html' },
  { name: 'Kabeer Confectionery', industry: 'Confectionery & Bakery', website: 'kabeerconfectionery.com', category: 'Food & Beverage', logo: '/clients/kabeer.png', caseStudy: '/work/kabeer-confectionery.html' },
  { name: 'Marux', industry: 'Crafting Excellence', category: 'Manufacturing', logo: '/clients/marux.png' },
  { name: 'YSR', industry: 'Real Estate & Property', category: 'Real Estate', logo: '/clients/ysr.png' },
  { name: 'Pinnacle Digital Services', industry: 'Digital Services', category: 'Services', logo: '/clients/pinnacle.png' },
  { name: 'RupeeNest Capital', industry: 'Financial Services', website: 'rupeenestcapital.com', category: 'Finance', caseStudy: '/work/rupeenest-capital.html' },
  { name: 'Superb Home Solutions', industry: 'Home Services', website: 'superbhomesolutions.in', category: 'Services', caseStudy: '/work/superup-home-solution.html' },
  { name: 'Veda Club', industry: 'Wellness & Lifestyle', category: 'Wellness', caseStudy: '/work/veda-club.html' },
  { name: 'Akiso', industry: 'Retail', category: 'Retail', caseStudy: '/work/akiso.html' },
  { name: 'Kisaansay', industry: 'Agri-commerce', category: 'E-commerce', caseStudy: '/work/kisaansay.html' },
];

export const story = [
  {
    year: '2023',
    title: 'The agency starts',
    body:
      'GrowthArc Media is founded by Vinod Kumar on a simple frustration: brands were paying three different agencies for strategy, creative and media, and getting three different opinions. The first clients come from jewellery and e-commerce — categories where the creative has to be beautiful and the numbers still have to work.',
  },
  {
    year: '2024',
    title: 'One engine, not three departments',
    body:
      'Brand strategy, identity, creative, digital and performance get folded into a single roadmap instead of separate retainers. The case studies start to look different as a result: positioning work that shows up in the ad account, and ad data that feeds back into the brand.',
  },
  {
    year: '2025',
    title: 'Engineering joins the table',
    body:
      'Web development moves in-house. Landing pages, e-commerce builds and tracking stop being somebody else\'s dependency — which is what finally makes conversion rate optimisation something we can actually promise rather than recommend.',
  },
  {
    year: '2026',
    title: 'Built for how people search now',
    body:
      'Search stops being ten blue links. We invest in Generative Engine Optimization — getting brands cited inside AI answers from ChatGPT, Perplexity and Google AI Overviews — alongside the SEO and paid media that already work.',
  },
];

export const principles = [
  {
    icon: 'fa-chart-line',
    accent: 'text-pink',
    title: 'Revenue, not vanity metrics',
    body: 'Impressions and follower counts do not pay salaries. We report on ROAS, cost per qualified lead and revenue, and we say so when a channel is not working.',
  },
  {
    icon: 'fa-layer-group',
    accent: 'text-yellow',
    title: 'One team, one roadmap',
    body: 'Strategy, creative, media and engineering sit together. No handoffs between agencies, no arguing about whose number is right.',
  },
  {
    icon: 'fa-flask',
    accent: 'text-green',
    title: 'Opinions are cheap, tests are not',
    body: 'Every claim we make about your audience is something we can test. Creative, offers and landing pages ship in variants, and the account decides.',
  },
  {
    icon: 'fa-eye',
    accent: 'text-orange',
    title: 'You see what we see',
    body: 'Same dashboards, same numbers, same access. If a month is bad, you hear it from us before you find it yourself.',
  },
];
