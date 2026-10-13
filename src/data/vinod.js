/* Vinod Kumar — personal brand site content.
 *
 * SOURCE OF TRUTH: Vinod_Kumar_CV_2026_Updated_1.pdf
 *
 * Every company, date, role, metric, tool, certification and claim below is
 * taken from that CV. Nothing is invented, rounded up, or inferred — if the
 * CV does not say it, it is not here. The `cv` field on the proof points and
 * case studies quotes the CV line each one rests on, so any claim on the page
 * can be traced back to the document in one step.
 */

export const profile = {
  name: 'Vinod Kumar',
  headline: 'Marketing That Turns Attention Into Growth.',
  subheadline:
    '10+ years across retail, performance marketing, paid acquisition, AI-powered content and marketing automation.',
  positioning: 'Marketing Head · Performance Marketing · Meta Ads · Google Ads · AI Growth',
  rolePills: ['Marketing Head', 'Performance Marketing', 'Growth Marketing'],
  location: 'Gurgaon, India',
  availability: 'Immediate Joiner',
  phone: '+91 79060 81795',
  phoneRaw: '917906081795',
  email: 'vinod@growtharcmedia.in',
  // CV reads linkedin.com/in/vinodkumar-growtharcmedia
  linkedin: 'https://www.linkedin.com/in/vinodkumar-growtharcmedia',
  linkedinLabel: 'linkedin.com/in/vinodkumar-growtharcmedia',
  currentRole: 'Marketing Head',
  currentCompany: 'Calance Software',
};

/** Hero counters. Each is a figure stated verbatim in the CV. */
export const heroStats = [
  { value: 10, suffix: '+', label: 'Years Experience' },
  { value: 15, suffix: '', label: 'Team Members Led' },
  { value: 30, suffix: '%', label: 'CPL Reduction' },
  { value: 70, suffix: '%', label: 'Faster Campaign Cycle' },
];

export const about = {
  lead:
    'Marketing leader with 10+ years spanning multi-location retail brand marketing and full-stack digital growth.',
  paragraphs: [
    'Currently Marketing Head at Calance Software, a US-headquartered IT staffing and software services firm, where I lead a team of 15 across marketing, content and creative, and own paid media, content and brand end to end.',
    'Specialist in Meta Ads and Google Ads for B2B and D2C, now extending into ChatGPT Ads and conversational-search placements as the next paid channel opens up. I produce AI-generated video and creative in-house, which removes shoot cost and agency dependency from the creative testing cycle.',
    'Ten years of multi-location retail marketing before this is where the commercial instinct for footfall, conversion and margin comes from. Strategy to shipped campaign — fast, measurable, and delivered through a team.',
  ],
  // The differentiator the brief asked to highlight, stated only as the CV supports it.
  bothSides: [
    {
      side: 'Real-world retail',
      body:
        'Ten years of multi-location retail marketing — footfall, conversion, store-level execution and margin. BTL campaigns, in-store branding, launch events and seasonal promotions across 10+ locations.',
    },
    {
      side: 'Modern digital acquisition',
      body:
        'Meta and Google paid acquisition built from zero, a measurement stack established from scratch, AI content production in-house, and a production WhatsApp chatbot on Meta Business API.',
    },
  ],
};

/* --------------------------------------------------------------------------
   Career timeline — companies, roles and dates exactly as the CV states them.
   -------------------------------------------------------------------------- */

export const timeline = [
  {
    id: 'calance',
    company: 'Calance Software',
    mark: 'CALANCE',
    role: 'Marketing Head',
    period: 'Jan 2025 — Present',
    years: '2025',
    location: 'Gurgaon (Hybrid)',
    sector: 'US-Headquartered IT Staffing & Software Services',
    current: true,
    summary:
      'Joined a US-headquartered business with no in-house paid acquisition function and no measurement stack. Built both from zero and now lead a team of 15 delivering across a 10-hour time difference.',
    owned: 'Paid media, content strategy and brand end to end',
    points: [
      'Lead a team of 15 across marketing, content and creative — workload planning, briefing, review cycles and delivery accountability on every campaign that ships.',
      'Built Google Ads and Meta Ads B2B acquisition from zero: 30% CPL reduction inside 3 months through audience refinement and structured creative testing.',
      'Own paid media, content strategy and brand end to end, reporting KPIs weekly to US senior leadership.',
      'Building ChatGPT Ads and conversational-search readiness alongside Meta and Google, so the brand is positioned before the channel matures.',
      'Produce AI-generated video and static ad creative in-house — creative turnaround cut from weeks to days, with far more variants tested per campaign cycle.',
      'Implemented AI automation across content and campaign asset production using Claude AI and OpenAI Codex — 70% faster campaign turnaround, dev dependency removed.',
      'Deployed a production WhatsApp AI chatbot on Meta Business API for autonomous lead qualification, query handling and appointment routing.',
      'Established the full measurement stack from scratch: GA4, Meta Pixel and Conversions API, Google Tag Manager and Looker Studio dashboards.',
      'Authored the US IT staffing content strategy — blog, case studies and LinkedIn thought leadership supporting sales pipeline.',
    ],
    highlight: '30% CPL reduction inside 3 months',
  },
  {
    id: 'v2retail',
    company: 'V2 Retail Ltd',
    mark: 'V2 RETAIL',
    role: 'Marketing Head',
    period: '2023 — Jan 2025',
    years: '2023',
    location: 'North India',
    sector: 'Multi-location Retail Chain',
    summary:
      'Owned marketing for a multi-location retail chain across North India, working through regional execution teams to hit footfall and revenue targets store by store.',
    owned: 'Regional marketing strategy across 10+ retail locations',
    points: [
      'Led marketing strategy and brand promotions across 10+ retail locations, managing regional execution teams and their campaign calendars.',
      'Planned and executed BTL campaigns, in-store branding and launch events to drive footfall and brand recall.',
      'Ran digital and social promotions for festive and seasonal campaigns at both store and regional level.',
      'Built regional marketing plans aligned to national brand guidelines and revenue targets.',
      'Coordinated with store managers and regional heads so campaign execution stayed tied to sales targets rather than running in isolation.',
    ],
    highlight: 'Marketing across 10+ retail locations',
  },
  {
    id: 'bazzar',
    company: 'Bazzar India Retail Ltd',
    mark: 'BAZZAR INDIA',
    role: 'Marketing Executive',
    period: '2021 — Feb 2023',
    years: '2021',
    location: 'Gurgaon',
    sector: 'Value Retail',
    summary:
      'Handled end-to-end brand marketing for a value retail chain, covering both digital and on-ground activity across the region.',
    owned: 'End-to-end regional brand marketing',
    points: [
      'Executed end-to-end brand marketing across digital, offline, social and local-area campaigns.',
      'Planned local area marketing, in-store events and seasonal promotions across the region.',
      'Managed campaign budgets and vendor coordination for print, signage and on-ground activation.',
      'Awarded Best Brand Campaign Execution for regional festive season marketing.',
    ],
    highlight: 'Awarded Best Brand Campaign Execution',
  },
  {
    id: 'reliance',
    company: 'Reliance Trends',
    mark: 'RELIANCE TRENDS',
    role: 'Marketing Executive',
    period: '2019 — 2021',
    years: '2019',
    location: 'Kashipur',
    sector: 'National Fashion Retail',
    summary:
      'Executed national campaigns at store level for a fashion retail brand, translating central marketing plans into local activity that moved footfall.',
    owned: 'Store-level execution of national campaigns',
    points: [
      'Ran local marketing campaigns driving brand awareness and store walk-ins.',
      'Managed in-store displays, promotional signage and seasonal campaign rollout.',
      'Coordinated national campaign execution at store level with the regional marketing team.',
      'Tracked campaign impact on footfall and conversion, reporting results back to regional marketing.',
    ],
    highlight: 'National campaigns executed at store level',
  },
  {
    id: 'vmart',
    company: 'Vmart Retail Ltd',
    mark: 'VMART',
    role: 'Social Media Executive',
    period: '2017 — 2019',
    years: '2017',
    location: 'Kashipur',
    sector: 'Value Retail Chain',
    summary:
      "First digital role — owned the brand's social presence and built the content habit that later became the creative side of my paid work.",
    owned: 'Brand social presence and content',
    points: [
      'Managed brand social handles — content planning, scheduling and audience engagement.',
      'Produced promotional content for festive sales, new arrivals and brand campaigns.',
      'Grew following and engagement through consistent on-brand output.',
      'Supported store-level campaign rollout and visual merchandising communication.',
    ],
    highlight: 'First digital role',
  },
];

export const careerArc = [
  'Retail',
  'Marketing',
  'Multi-location Marketing',
  'Performance Marketing',
  'AI-powered Growth',
];

/* --------------------------------------------------------------------------
   Proof of performance — Challenge / Action / Result, each traceable to the CV.
   -------------------------------------------------------------------------- */

export const proofPoints = [
  {
    metric: '30%',
    label: 'CPL Reduction',
    sub: 'in 90 days',
    challenge: 'A US-headquartered business with no in-house paid acquisition function at all.',
    action:
      'Built Google Ads and Meta Ads B2B acquisition from zero — account structure, audience segmentation and a disciplined creative testing system.',
    result:
      '30% cost-per-lead reduction inside 3 months. The gains came from audience refinement and structured creative testing, not from increasing budget.',
    cv: 'Built Google Ads and Meta Ads B2B acquisition from zero: 30% CPL reduction inside 3 months through audience refinement and structured creative testing.',
  },
  {
    metric: '70%',
    label: 'Faster Campaign Turnaround',
    sub: 'days to hours',
    challenge:
      'Campaign asset production and content publishing were slow and carried a dependency on developer time.',
    action:
      'Implemented AI automation across content and campaign asset production using Claude AI and OpenAI Codex.',
    result: '70% faster campaign turnaround, with the dev dependency removed entirely.',
    cv: 'Implemented AI automation across content and campaign asset production using Claude AI and OpenAI Codex — 70% faster campaign turnaround, dev dependency removed.',
  },
  {
    metric: '15',
    label: 'Team Members Led',
    sub: 'marketing, content, creative',
    challenge:
      'Concurrent campaigns shipping across a 10-hour time difference with US senior leadership.',
    action:
      'Workload planning, briefing, review cycles and delivery accountability across marketing, content and creative.',
    result: 'Every campaign that ships has an owner, a review and a delivery date. KPIs reported weekly to US leadership.',
    cv: 'Lead a team of 15 across marketing, content and creative — workload planning, briefing, review cycles and delivery accountability on every campaign that ships.',
  },
  {
    metric: '0 → 1',
    label: 'Measurement Stack',
    sub: 'built from scratch',
    challenge: 'No measurement stack existed, so campaign decisions ran on assumption.',
    action:
      'Established GA4, Meta Pixel and Conversions API, Google Tag Manager, Consent Mode and Looker Studio dashboards.',
    result: 'Campaign decisions now run on data rather than assumption.',
    cv: 'Established the full measurement stack from scratch: GA4, Meta Pixel and Conversions API, Google Tag Manager and Looker Studio dashboards.',
  },
  {
    metric: '10+',
    label: 'Retail Locations',
    sub: 'regional marketing',
    challenge: 'Footfall and revenue targets to hit store by store across North India.',
    action:
      'Led marketing strategy and brand promotions across 10+ retail locations through regional execution teams, with BTL campaigns, in-store branding and launch events.',
    result:
      'Campaign execution stayed tied to sales targets rather than running in isolation, coordinated with store managers and regional heads.',
    cv: 'Led marketing strategy and brand promotions across 10+ retail locations, managing regional execution teams and their campaign calendars.',
  },
  {
    metric: 'AI',
    label: 'WhatsApp Chatbot',
    sub: 'in production',
    challenge: 'Inbound lead qualification and routing were manual.',
    action:
      'Deployed a production WhatsApp AI chatbot on Meta Business API, built with Claude AI and Upstash Redis.',
    result: 'Autonomous lead qualification, query handling and appointment routing.',
    cv: 'Deployed a production WhatsApp AI chatbot on Meta Business API for autonomous lead qualification, query handling and appointment routing.',
  },
];

/* --------------------------------------------------------------------------
   Expertise
   -------------------------------------------------------------------------- */

export const expertise = [
  {
    id: 'meta',
    title: 'Meta Ads',
    level: 'Expert',
    blurb:
      'Advantage+ and manual campaign structuring, full-funnel TOF/MOF/BOF, click-to-WhatsApp and lead-form campaigns, catalogue and DPA setup, audience architecture, creative testing systems.',
    items: [
      'Advantage+ campaigns',
      'Manual campaign structuring',
      'Full-funnel TOF / MOF / BOF',
      'Click-to-WhatsApp campaigns',
      'Lead-form campaigns',
      'Catalogue & DPA setup',
      'Audience architecture',
      'Creative testing systems',
    ],
  },
  {
    id: 'google',
    title: 'Google Ads',
    level: 'Expert',
    blurb:
      'Search, Performance Max and Shopping, Merchant Center feed management, keyword and negative-keyword strategy, tROAS and bid management, ROAS and CPL optimisation.',
    items: [
      'Search campaigns',
      'Performance Max',
      'Shopping & Merchant Center',
      'Keyword strategy',
      'Negative-keyword strategy',
      'tROAS & bid management',
      'ROAS optimisation',
      'CPL optimisation',
    ],
  },
  {
    id: 'ai',
    title: 'ChatGPT Ads & AI Growth',
    level: 'Building ahead of the channel',
    blurb:
      'Conversational-search ad readiness, LLM brand visibility, prompt-share tracking and answer-surface positioning — building capability ahead of the channel maturing.',
    items: [
      'Conversational-search ad readiness',
      'LLM brand visibility',
      'Prompt-share tracking',
      'Answer-surface positioning',
      'AI-generated video ads',
      'AI creative production',
      'Claude AI pipelines',
      'OpenAI GPT / Codex workflows',
    ],
  },
  {
    id: 'measurement',
    title: 'Measurement',
    level: 'Full stack',
    blurb:
      'GA4, Meta Pixel and Conversions API, Google Tag Manager, Consent Mode, Looker Studio, Event Match Quality diagnostics.',
    items: [
      'Google Analytics 4',
      'Meta Pixel & Conversions API',
      'Google Tag Manager',
      'Consent Mode',
      'Looker Studio',
      'Event Match Quality diagnostics',
      'Google Search Console',
    ],
  },
  {
    id: 'automation',
    title: 'Automation',
    level: 'In production',
    blurb:
      'WhatsApp Business API, AI lead qualification, marketing automation and CRM workflows.',
    items: [
      'WhatsApp Business API',
      'AI lead qualification',
      'Marketing automation',
      'CRM workflows',
      'Make.com · Zapier',
      'Zoho CRM',
    ],
  },
  {
    id: 'leadership',
    title: 'Team Leadership',
    level: 'Team of 15',
    blurb:
      'Lead a team of 15 across marketing, content and creative. Briefing, review cycles, workload planning and delivery accountability across concurrent campaigns.',
    items: [
      'Team of 15',
      'Campaign planning',
      'Briefing',
      'Review cycles',
      'Workload planning',
      'Delivery accountability',
    ],
  },
];

/* --------------------------------------------------------------------------
   Case studies — drawn from the Calance and V2 Retail entries.
   -------------------------------------------------------------------------- */

export const caseStudies = [
  {
    n: '01',
    title: 'Building Paid Acquisition From Zero',
    company: 'Calance Software',
    challenge: 'No in-house paid acquisition function and no measurement stack.',
    action:
      'Built Google Ads and Meta Ads B2B acquisition from the ground up — account structure, audience segmentation, a structured creative testing system, and the full tracking layer underneath it.',
    result: '30% CPL reduction inside 3 months, achieved through audience refinement and creative testing rather than budget.',
    tags: ['Google Ads', 'Meta Ads', 'B2B', 'GA4', 'Meta CAPI'],
  },
  {
    n: '02',
    title: 'AI-Powered Campaign Production',
    company: 'Calance Software',
    challenge: 'Campaign asset production was slow and depended on developer availability.',
    action:
      'Implemented AI automation across content and campaign asset production using Claude AI and OpenAI Codex, and brought AI-generated video and static ad creative in-house.',
    result:
      '70% faster campaign turnaround and the dev dependency removed. Creative turnaround moved from weeks to days, with far more variants tested per cycle.',
    tags: ['Claude AI', 'OpenAI Codex', 'AI video', 'Creative testing'],
  },
  {
    n: '03',
    title: 'WhatsApp AI Lead Qualification',
    company: 'Calance Software',
    challenge: 'Inbound lead qualification, query handling and appointment routing were manual.',
    action:
      'Deployed a production WhatsApp AI chatbot on Meta Business API, built with Claude AI and Upstash Redis.',
    result: 'Autonomous lead qualification, query handling and appointment routing running in production.',
    tags: ['WhatsApp Business API', 'Claude AI', 'Upstash Redis', 'Lead qualification'],
  },
  {
    n: '04',
    title: 'Multi-Location Retail Marketing',
    company: 'V2 Retail Ltd',
    challenge: 'Footfall and revenue targets to hit store by store across North India.',
    action:
      'Led marketing strategy and brand promotions across 10+ retail locations through regional execution teams — BTL campaigns, in-store branding, launch events, and festive and seasonal promotions at store and regional level.',
    result:
      'Regional marketing plans aligned to national brand guidelines and revenue targets, with execution tied to sales targets rather than running in isolation.',
    tags: ['BTL', 'Store marketing', 'Regional campaigns', 'Seasonal'],
  },
];

/* --------------------------------------------------------------------------
   Stack — exactly the four groups the CV lists.
   -------------------------------------------------------------------------- */

export const stack = [
  {
    group: 'Paid Media',
    tools: [
      'Meta Ads Manager',
      'Google Ads — Search, P-Max',
      'Google Shopping / GMC',
      'ChatGPT Ads (OpenAI)',
      'Google Ads Editor',
      'Meta Business Suite',
    ],
  },
  {
    group: 'AI Content & Creative',
    tools: [
      'AI video generation tools',
      'Claude AI (Anthropic)',
      'OpenAI GPT / Codex',
      'Canva · CapCut',
      'Adobe Express',
      'Prompt Engineering',
    ],
  },
  {
    group: 'Measurement',
    tools: [
      'Google Analytics 4',
      'Meta Pixel & CAPI',
      'Google Tag Manager',
      'Consent Mode',
      'Looker Studio',
      'Google Search Console',
    ],
  },
  {
    group: 'Platform & Automation',
    tools: [
      'Shopify · Shopify Markets',
      'WhatsApp Business API',
      'Make.com · Zapier',
      'WordPress',
      'Next.js · Vercel',
      'Zoho CRM · GitHub',
    ],
  },
];

export const credentials = {
  certifications: [
    'Meta Blueprint Certified',
    'Google Ads Search',
    'Google Analytics (GA4)',
    'HubSpot Content Marketing',
    'AI Prompt Engineering',
  ],
  education: [
    { title: 'Bachelor of Arts (B.A.)', place: 'Ruhelkhand University, Moradabad', years: '2016 — 2019' },
    { title: 'Intermediate, Science Stream', place: 'U.K. Board, Ramnagar, Uttarakhand', years: '2014 — 2016' },
  ],
  languages: ['Hindi — Native', 'English — Professional', 'Hinglish — Fluent'],
};

export const story = {
  title: 'From Kashipur to Gurgaon.',
  paragraphs: [
    'The first digital role was in Kashipur, Uttarakhand — running social handles for a value retail chain. Content planning, festive sale posts, store-level campaign rollout. Small scale, but it is where the habit of producing creative on a schedule started.',
    'Retail is a demanding place to learn marketing. There is a number on the door every day, and a campaign either moves footfall or it does not. Ten years of that — Vmart, Reliance Trends, Bazzar India, then V2 Retail across 10+ locations in North India — is where the instinct for conversion and margin came from.',
    'Gurgaon is where it became digital. Today that means Meta and Google paid acquisition for a US-headquartered firm, a measurement stack built from scratch, AI creative produced in-house, and a team of 15 delivering across a 10-hour time difference.',
  ],
  pin: 'Retail floor → regional marketing → performance marketing → AI-powered growth.',
};

export const roleFit = {
  statement:
    'One marketing lead who covers the whole paid funnel — Meta and Google strategy, build and optimisation, with ChatGPT Ads readiness for what comes next — plus the in-house AI content capability to produce the video and creative those campaigns run on, and the team leadership to keep both moving. I currently lead a team of 15 at a US-headquartered company where I built the entire paid acquisition and measurement stack from zero. I can do it again from week one.',
  targetRoles: [
    'Marketing Head / Digital Marketing Manager',
    'Performance Marketing Lead',
    'Paid Media Manager — Meta & Google Ads',
    'Growth Marketing Manager',
  ],
  availability: [
    'Immediate joiner · Gurgaon / Delhi NCR',
    'Remote-first preferred; open to relocation',
    'Comfortable on US, AU, CA and MY time zones',
    'Currently leading a team of 15',
  ],
};

/* Professional recommendations.
 *
 * Empty on purpose — the CV carries no quotes, and a recommendation attributed
 * to a named colleague who never gave it is a fabricated endorsement. Add real
 * ones here and the section fills itself; until then it shows the placeholder
 * line the brief asked for.
 *
 * Shape: { quote, author, role, company, via }
 */
export const recommendations = [];
