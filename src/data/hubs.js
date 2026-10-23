/* Industry and location hub pages.
 *
 * These are the internal-linking silo the SEO playbook asks for: an entry
 * point for each high-intent commercial query ("jewellery marketing agency
 * India", "performance marketing agency Gurugram") that links down into the
 * real case studies and service pages rather than standing alone.
 *
 * Two rules the copy here keeps to:
 *   1. Every brand named is one the agency has published as a client, and
 *      every case-study link resolves to a page that exists in /work/.
 *   2. The city pages say plainly where the agency is and is not. Gurugram
 *      and Goa are offices; Mumbai and Bengaluru are markets served from
 *      them. Neither of those two pages claims an address, and neither emits
 *      LocalBusiness schema — a local listing for an office that does not
 *      exist is the one SEO shortcut that can cost a brand its Google
 *      Business Profile.
 */

export const hubs = [
  /* ------------------------------------------------------------------ */
  /* Industries                                                         */
  /* ------------------------------------------------------------------ */
  {
    group: 'industries',
    slug: 'd2c-ecommerce-marketing-agency-india',
    nav: 'D2C & E-Commerce',
    title: 'D2C & E-Commerce Marketing Agency in India | GrowthArc Media',
    description:
      'D2C growth agency in India running Meta and Google Ads, UGC creative and sub-second Next.js storefronts. 5.8x blended ROAS on ₹15Cr+ of ad spend across 11+ brands.',
    h1: 'D2C & E-Commerce Growth Agency in India',
    label: '(INDUSTRY FOCUS)',
    display: 'D2C &<br>E-COMMERCE',
    lede:
      'Scaling a direct-to-consumer brand in India is not a media problem or a creative problem or a website problem. It is all three at once, and the cost of treating them separately shows up as a rising CPA. GrowthArc Media runs them as one engine.',
    stats: [
      { value: '5.8x', label: 'Average blended ROAS delivered' },
      { value: '₹15Cr+', label: 'Ad spend scaled profitably' },
      { value: '-42%', label: 'Reduction in cost per acquisition' },
    ],
    sections: [
      {
        label: '(WHERE D2C BRANDS STALL)',
        heading: 'The plateau is almost never the ad account.',
        body: [
          'A D2C brand in India usually hits its first ceiling somewhere between ₹20 lakh and ₹1 crore of monthly revenue, and the instinct is to raise the budget. More often the constraint is creative velocity — the account has run out of angles, not audience — or a storefront that loses a third of its mobile traffic before the product page renders.',
          'We diagnose which of the three it is before touching spend, because scaling a funnel that leaks is just buying the leak at volume.',
        ],
        bulletLabel: '(WHAT WE RUN)',
        bullets: [
          'Meta Ads and Google Shopping built on catalogue and audience structure, not boosted posts',
          'Creative testing at 15–30 new assets a month, UGC and studio side by side',
          'Headless and custom Next.js storefronts — 99/100 Lighthouse, under 0.8s load',
          'Conversion rate optimisation on the product and checkout path',
          'Retention: email, WhatsApp and repeat-purchase funnels',
          'Multi-touch attribution so the reporting is not platform-reported revenue alone',
        ],
      },
      {
        label: '(THE ENGINEERING PART)',
        heading: '+180% mobile conversion rate came from the storefront, not the ads.',
        body: [
          'Most Indian D2C traffic is mobile, on a connection that punishes every unused kilobyte. A template storefront carrying four analytics scripts and a slider library will quietly tax every rupee of media you spend against it.',
          'Because the team that buys your media and the team that ships your code are the same team, a drop in conversion rate gets diagnosed in a day instead of being argued between an agency and a developer for a fortnight.',
        ],
      },
    ],
    cases: [
      { name: 'GemHub', sector: 'Luxury jewellery e-commerce', href: '/work/gemhub.html', line: 'Custom e-commerce portal, creative production and performance growth.' },
      { name: 'Auric Jewels', sector: 'Jewellery & lifestyle D2C', href: '/work/auric-jewels.html', line: 'Branding, digital marketing and high-ROAS performance scaling.' },
      { name: 'Akiso', sector: 'Apparel & retail D2C', href: '/work/akiso.html', line: 'Brand positioning plus Meta and Google Ads scaling at 4.8x ROAS.' },
      { name: 'Kisaansay', sector: 'Agri-commerce', href: '/work/kisaansay.html', line: 'Brand identity, agritech packaging and full-funnel digital growth.' },
    ],
    services: ['performance-marketing', 'web-development', 'creative-content'],
    faqs: [
      {
        q: 'What does a D2C marketing agency in India cost?',
        a: 'Retainers run from ₹1.5 lakh to ₹40 lakh+ per month, scoped to the ad spend under management, the number of channels and whether creative production and engineering sit inside the retainer. For a brand doing its first serious scale push, a performance-plus-creative retainer with ₹3 lakh+ of monthly media is the usual starting shape.',
      },
      {
        q: 'What minimum ad budget does a D2C brand need to scale?',
        a: 'At least ₹2 to ₹3 lakh per month on a single platform. Below that, creative testing cannot converge — you get a handful of conversions per variant, which is noise rather than signal, and every decision you make on it is a guess with a spreadsheet attached.',
      },
      {
        q: 'How long until the ROAS is profitable?',
        a: 'Structure, tracking and the first creative tests take 14 to 21 days. A stable, reportable ROAS normally lands between day 30 and day 45, and scale begins around day 60 to 90. Our blended average across accounts is 5.8x on ₹15Cr+ of spend, with CPA down 42%.',
      },
      {
        q: 'Do you rebuild the storefront or work with what we have?',
        a: 'Whichever is cheaper per incremental order. If the existing storefront converts and loads fast, we optimise it. If mobile conversion rate is being eaten by load time and a template we cannot strip, rebuilding the front end usually returns more than the same money spent on media — which is why we measure before recommending it.',
      },
      {
        q: 'Which D2C categories have you scaled?',
        a: 'Jewellery and luxury e-commerce (GemHub, Auric Jewels), apparel and retail (Akiso), confectionery and FMCG (Kabeer Confectionery), wellness (Veda Club) and agri-commerce (Kisaansay) — eleven-plus brands across nine verticals in total.',
      },
    ],
  },

  {
    group: 'industries',
    slug: 'jewellery-marketing-agency-india',
    nav: 'Jewellery & Luxury',
    title: 'Jewellery Marketing Agency in India | 5x+ ROAS — GrowthArc Media',
    description:
      'Jewellery digital marketing agency in India for gold, diamond and lab-grown brands. Branding, Meta and Google Ads, and e-commerce builds behind GemHub and Auric Jewels.',
    h1: 'Jewellery & Luxury Marketing Agency in India',
    label: '(INDUSTRY FOCUS)',
    display: 'JEWELLERY<br>& LUXURY',
    lede:
      'Jewellery is the category where the creative has to be beautiful and the numbers still have to work. It is also where GrowthArc Media started — the first clients came from jewellery and e-commerce, and the discipline the category demands shaped how the agency runs everything else.',
    stats: [
      { value: '2', label: 'Jewellery brands scaled end to end' },
      { value: '5.8x', label: 'Average blended ROAS delivered' },
      { value: '3.8x', label: 'Brand recall lift across identity work' },
    ],
    sections: [
      {
        label: '(WHY JEWELLERY IS DIFFERENT)',
        heading: 'High ticket, long consideration, and a buyer who needs to trust you first.',
        body: [
          'A ₹60,000 solitaire is not an impulse purchase. The funnel is longer, the first click rarely converts, and last-click attribution will tell you your prospecting is failing right up until you switch it off and watch revenue fall with it.',
          'So jewellery accounts need a different build: prospecting judged on assisted revenue rather than ROAS alone, remarketing sequenced against a two-to-six-week consideration window, and creative that carries craft without losing the direct-response job it has to do.',
        ],
        bulletLabel: '(WHAT THE CATEGORY NEEDS)',
        bullets: [
          'Catalogue and feed hygiene for Google Shopping and Meta dynamic ads',
          'Prospecting measured on assisted and blended revenue, not last click',
          'Studio and lifestyle creative that survives a 1080x1350 placement',
          'Product pages engineered for certification, pricing and trust signals',
          'Showroom and online demand treated as one funnel, not two budgets',
          'Packaging and identity carried through from ad to unboxing',
        ],
      },
      {
        label: '(BUILD AND BUY, TOGETHER)',
        heading: 'The storefront is part of the media plan.',
        body: [
          'For GemHub the work was not only campaigns — it was a custom e-commerce portal built to carry a jewellery catalogue at speed, with the creative engine and the paid media running on top of it. For Auric Jewels it ran the other way: branding and identity first, then digital and performance scaling against it.',
          'Both are the same argument. In a high-ticket category, the page the ad lands on is doing as much selling as the ad.',
        ],
      },
    ],
    cases: [
      { name: 'GemHub', sector: 'Luxury jewellery e-commerce', href: '/work/gemhub.html', line: 'Custom e-commerce web portal, creative production and performance growth.' },
      { name: 'Auric Jewels', sector: 'Jewellery & lifestyle', href: '/work/auric-jewels.html', line: 'Branding, digital marketing and high-ROAS performance scaling.' },
    ],
    services: ['performance-marketing', 'brand-identity', 'web-development'],
    faqs: [
      {
        q: 'How do you market a jewellery brand profitably in India?',
        a: 'By accepting that the first click will not convert. You build a prospecting layer judged on assisted and blended revenue, a remarketing layer sequenced against a two-to-six-week consideration window, and a product page that answers certification, pricing and returns before the buyer has to ask. Then you scale the creative angle that is earning attention, not the audience that looks biggest.',
      },
      {
        q: 'What ROAS is realistic for a jewellery brand?',
        a: 'Blended 3x to 6x is a realistic band for an established catalogue with a working storefront, and it depends heavily on average order value and repeat rate. Our blended average across all paid accounts is 5.8x. Anyone quoting you a guaranteed figure before seeing your margins and your product page is quoting a sales target, not a forecast.',
      },
      {
        q: 'Do you handle both online and showroom demand?',
        a: 'Yes, and we would rather run them as one funnel. Local campaigns, store-visit and call-based conversions and online purchase sit in the same account structure, because splitting them across two budgets usually means paying twice to reach the same buyer.',
      },
      {
        q: 'Can you build the jewellery e-commerce site as well?',
        a: 'Yes — GemHub is a custom e-commerce portal we engineered, not a theme we configured. Jewellery catalogues are image-heavy and variant-heavy, which is exactly where template storefronts lose mobile conversions, so the build and the media plan are scoped together.',
      },
      {
        q: 'What does jewellery marketing cost?',
        a: 'Retainers from ₹1.5 lakh to ₹40 lakh+ per month depending on channels, creative volume and whether identity or engineering work runs alongside. For a single-showroom brand starting online, a performance-and-creative retainer with ₹2 to ₹3 lakh of monthly media is the usual entry point.',
      },
    ],
  },

  {
    group: 'industries',
    slug: 'fintech-marketing-agency-india',
    nav: 'Fintech & Financial',
    title: 'Fintech Marketing Agency in India | Lead Gen — GrowthArc Media',
    description:
      'Fintech performance marketing agency in India: high-intent investor and borrower funnels, compliant paid media and secure web platforms. RupeeNest Capital case study.',
    h1: 'Fintech & Financial Services Marketing Agency in India',
    label: '(INDUSTRY FOCUS)',
    display: 'FINTECH &<br>FINANCIAL',
    lede:
      'Fintech does not have a traffic problem. It has a qualification problem. A thousand cheap leads that never clear KYC cost more than a hundred that do, and the ad platform will happily optimise toward the former because that is what you told it to count.',
    stats: [
      { value: '1', label: 'Fintech platform built and scaled' },
      { value: '-42%', label: 'Reduction in cost per acquisition' },
      { value: '99/100', label: 'Lighthouse score on engineered platforms' },
    ],
    sections: [
      {
        label: '(THE REAL METRIC)',
        heading: 'Cost per qualified lead, not cost per lead.',
        body: [
          'The fix is to move the conversion event down the funnel. Not form fill — document upload, eligibility pass, first deposit, sanctioned amount. Once the platform is optimising against an event that correlates with revenue, the cheap unqualified volume stops being rewarded and the cost per funded customer falls even as cost per lead rises.',
          'That requires server-side event tracking and a CRM that reports back, which is engineering work. It is the reason fintech accounts tend to stall at agencies that only buy media.',
        ],
        bulletLabel: '(WHAT WE RUN)',
        bullets: [
          'Google Search on high-intent borrower and investor queries',
          'Meta prospecting against lookalikes built from funded customers, not leads',
          'LinkedIn for B2B, wealth and enterprise financial products',
          'Offline and CRM conversion imports so the optimiser sees real outcomes',
          'Compliant creative and landing copy — no guaranteed-return language',
          'Secure, fast platform engineering with the funnel built into it',
        ],
      },
      {
        label: '(COMPLIANCE IS A CREATIVE CONSTRAINT)',
        heading: 'Financial ads get rejected for the copy, not the targeting.',
        body: [
          'Meta and Google both police financial-services claims hard, and a disapproval mid-flight costs you the learning phase as well as the day. We write to the constraint from the start: no implied guarantees, no fabricated urgency, disclosures where they belong, and an identity-verification path that reads as reassuring rather than suspicious.',
          'For RupeeNest Capital that meant a high-security platform, paid funnels and qualified lead generation designed as one system.',
        ],
      },
    ],
    cases: [
      { name: 'RupeeNest Capital', sector: 'Fintech & financial services', href: '/work/rupeenest-capital.html', line: 'High-security fintech web platform, paid funnels and qualified lead generation.' },
    ],
    services: ['performance-marketing', 'web-development', 'digital-marketing'],
    faqs: [
      {
        q: 'How do you generate qualified fintech leads in India?',
        a: 'By optimising against a conversion event that sits below the form — document upload, eligibility pass, first deposit — and importing CRM outcomes back into the ad platforms so they learn what a good customer looks like. High-intent Google Search carries the bottom of the funnel; Meta and LinkedIn build lookalikes from funded customers rather than form fills.',
      },
      {
        q: 'What is a realistic cost per qualified lead?',
        a: 'It varies by product more than by channel — a personal-loan lead and a wealth-management lead are different businesses. The number worth tracking is cost per funded or activated customer, and in our experience that falls even while cost per raw lead rises, because you stop paying for volume that was never going to clear KYC.',
      },
      {
        q: 'Can you handle financial-services ad compliance?',
        a: 'Yes. Creative and landing copy are written to Meta and Google financial-services policy from the first draft: no implied or guaranteed returns, no fabricated urgency, required disclosures in place. A disapproval does not just cost you the day, it costs you the learning phase, so it is cheaper to write it correctly than to appeal it.',
      },
      {
        q: 'Do you build the platform as well as the campaigns?',
        a: 'Yes — RupeeNest Capital was a platform build as well as a media engagement. In fintech the funnel is largely inside the product, so conversion tracking, document flows and onboarding UX are marketing surfaces whether or not anyone has labelled them that way.',
      },
      {
        q: 'What does a fintech marketing retainer cost?',
        a: 'From ₹1.5 lakh per month for a focused lead-generation engagement up to ₹40 lakh+ where platform engineering, compliance-heavy creative and multi-channel media run together. Lead-generation products can start at a lower media budget than D2C because the conversion events are fewer and far higher in value.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Locations                                                          */
  /* ------------------------------------------------------------------ */
  {
    group: 'locations',
    slug: 'performance-marketing-agency-gurugram-delhi-ncr',
    nav: 'Gurugram & Delhi NCR',
    title: 'Performance Marketing Agency in Gurugram & Delhi NCR | GrowthArc Media',
    description:
      'Performance marketing agency in Gurugram and Delhi NCR. Meta and Google Ads, creative production and Next.js engineering from our Cyber City NCR base. 5.8x average ROAS.',
    h1: 'Performance Marketing Agency in Gurugram & Delhi NCR',
    label: '(LOCATION)',
    display: 'GURUGRAM<br>& DELHI NCR',
    office: true,
    city: 'Gurugram',
    region: 'Haryana',
    lede:
      'Gurugram is home. GrowthArc Media runs from Cyber City in Delhi NCR, which means a client in Gurugram, Delhi, Noida or Faridabad gets the one thing remote retainers cannot offer: the media buyer, the creative lead and the engineer in a room with you when the numbers need explaining.',
    stats: [
      { value: '5.8x', label: 'Average blended ROAS delivered' },
      { value: '₹15Cr+', label: 'Ad spend scaled profitably' },
      { value: '2023', label: 'Operating from NCR since' },
    ],
    sections: [
      {
        label: '(WHY LOCAL MATTERS HERE)',
        heading: 'NCR is where the brands and the buyers both are.',
        body: [
          'Delhi NCR carries an unusual density of D2C founders, jewellery retail, real estate and financial services — and a buyer base with the disposable income to match. It also means competitive auctions: CPMs in NCR-weighted campaigns run above the national average, so creative quality and landing-page speed stop being hygiene and start being the margin.',
          'Being based here is not a geography claim for a landing page. It is in-person workshops, showroom visits before a shoot, and the ability to sit in a quarterly review rather than send a deck.',
        ],
        bulletLabel: '(WHAT WE DO FROM NCR)',
        bullets: [
          'Meta and Google Ads management with NCR and pan-India campaign splits',
          'Local campaigns for showrooms, clinics and sales offices',
          'In-person brand and creative workshops',
          'Studio and UGC creative production with NCR-based creators',
          'Next.js and e-commerce engineering in-house',
          'Brand identity, packaging and design systems',
        ],
      },
      {
        label: '(BEYOND NCR)',
        heading: 'A second Indian hub in Goa, and clients in the UAE and US.',
        body: [
          'The agency also runs a Panjim hub in Goa, with hubs in Dubai and Austin serving clients across the UAE, United States and United Kingdom. Pan-India and international accounts are run from the same team on the same reporting, so a brand scaling out of NCR does not change agency to do it.',
        ],
      },
    ],
    cases: [
      { name: 'Auric Jewels', sector: 'Jewellery & lifestyle', href: '/work/auric-jewels.html', line: 'Branding, digital marketing and high-ROAS performance scaling.' },
      { name: 'RupeeNest Capital', sector: 'Fintech & financial services', href: '/work/rupeenest-capital.html', line: 'Fintech platform, paid funnels and qualified lead generation.' },
      { name: 'Superup Home Solution', sector: 'Home services', href: '/work/superup-home-solution.html', line: 'Brand strategy, identity and digital lead generation.' },
    ],
    services: ['performance-marketing', 'digital-marketing', 'web-development'],
    faqs: [
      {
        q: 'Where in Gurugram is GrowthArc Media based?',
        a: 'Our India headquarters is in Cyber City, Gurugram, Haryana, serving Gurugram, Delhi, Noida, Ghaziabad and Faridabad. Call or WhatsApp +91 79060 81795, or email vinod@growtharcmedia.in to arrange a meeting.',
      },
      {
        q: 'What does a performance marketing agency in Gurugram charge?',
        a: 'Retainers run ₹1.5 lakh to ₹40 lakh+ per month, priced on ad spend under management, channel count and whether creative production and engineering sit inside the retainer. We quote after a growth audit rather than from a rate card.',
      },
      {
        q: 'Do you meet clients in person?',
        a: 'Yes — that is most of the point of being based in NCR. Brand and creative workshops, showroom visits before a shoot and quarterly reviews happen in person for NCR clients. Everything else runs on shared dashboards.',
      },
      {
        q: 'Are CPMs higher in Delhi NCR?',
        a: 'Generally yes. NCR-weighted campaigns compete against a dense, high-income advertiser pool, so CPMs sit above the national average. The practical consequence is that creative quality and landing-page speed matter more here than in a cheaper geography — you cannot out-bid a weak funnel in this market.',
      },
      {
        q: 'Do you only work with NCR brands?',
        a: 'No. We run pan-India accounts from here, plus a Goa hub and hubs in Dubai and Austin serving clients across the UAE, United States and United Kingdom.',
      },
    ],
  },

  {
    group: 'locations',
    slug: 'digital-marketing-agency-mumbai',
    nav: 'Mumbai',
    title: 'Digital Marketing Agency for Mumbai Brands | GrowthArc Media',
    description:
      'Digital marketing and performance agency serving Mumbai D2C, retail and financial brands from our Gurugram and Goa hubs. Meta and Google Ads, SEO, GEO and Next.js builds.',
    h1: 'Digital Marketing & Performance Agency for Mumbai Brands',
    label: '(LOCATION)',
    display: 'MUMBAI',
    office: false,
    city: 'Mumbai',
    region: 'Maharashtra',
    lede:
      'Straight answer first: GrowthArc Media does not have a Mumbai office. We run Mumbai accounts from our Gurugram (Delhi NCR) and Panjim (Goa) hubs, and we would rather say so than put a coworking address on a page and call it a presence.',
    stats: [
      { value: '5.8x', label: 'Average blended ROAS delivered' },
      { value: '94%', label: 'Client retention rate' },
      { value: '9', label: 'Industries scaled' },
    ],
    sections: [
      {
        label: '(HOW IT WORKS WITHOUT AN OFFICE)',
        heading: 'What a Mumbai brand actually needs from its agency is not proximity.',
        body: [
          'It is creative velocity, a media buyer who reads the account daily, and someone who can change the landing page the same week the data says to. None of that improves because the team is in Lower Parel.',
          'What does need local presence — a product shoot, a store visit, a creator shoot on location — we arrange in Mumbai with local crews and creators, which is how most agencies handle it anyway, including the ones with an address in the city.',
        ],
        bulletLabel: '(WHAT WE RUN FOR MUMBAI BRANDS)',
        bullets: [
          'Meta and Google Ads with Mumbai and pan-India campaign splits',
          'Organic SEO and Generative Engine Optimization (GEO)',
          'Social media management, community and influencer work',
          'UGC and studio creative, shot on location in Mumbai where needed',
          'Next.js and headless e-commerce engineering',
          'Brand strategy, identity and packaging design',
        ],
      },
      {
        label: '(THE MUMBAI MARKET)',
        heading: 'High intent, high CPM, and a buyer with options.',
        body: [
          'Mumbai is among the most expensive metros in Indian paid auctions and carries a deep concentration of D2C, retail, jewellery, media and financial-services advertisers. That combination punishes mediocre creative faster than a smaller market does: the same budget buys fewer impressions, so each one has to work harder.',
          'Which puts the emphasis where we already keep it — testing volume, and a storefront that converts the traffic you have paid a premium for.',
        ],
      },
    ],
    cases: [
      { name: 'GemHub', sector: 'Luxury jewellery e-commerce', href: '/work/gemhub.html', line: 'Custom e-commerce portal, creative production and performance growth.' },
      { name: 'Veda Club', sector: 'Wellness & lifestyle', href: '/work/veda-club.html', line: 'Visual identity system and omnichannel social presence.' },
      { name: 'Akiso', sector: 'Apparel & retail D2C', href: '/work/akiso.html', line: 'Brand positioning plus Meta and Google Ads scaling at 4.8x ROAS.' },
    ],
    services: ['digital-marketing', 'performance-marketing', 'creative-content'],
    faqs: [
      {
        q: 'Does GrowthArc Media have an office in Mumbai?',
        a: 'No. Our Indian offices are in Gurugram (Cyber City, Delhi NCR) and Panjim, Goa, and Mumbai accounts are run from there. We say so plainly because a listed address we do not occupy would be the first thing a prospective client could catch us out on.',
      },
      {
        q: 'Can you handle shoots and events in Mumbai?',
        a: 'Yes — product and lifestyle shoots, UGC creator shoots and event coverage are arranged in Mumbai with local crews and creators, art-directed by our team. This is how most campaign production is run regardless of where the agency sits.',
      },
      {
        q: 'What does a digital marketing agency cost for a Mumbai brand?',
        a: 'The same as anywhere else we work: ₹1.5 lakh to ₹40 lakh+ per month depending on channels, creative volume and whether engineering is in scope. We do not price by city.',
      },
      {
        q: 'Are Mumbai CPMs higher than the national average?',
        a: 'Yes, noticeably. Mumbai competes against one of the densest advertiser pools in India, so the same budget buys fewer impressions. The practical answer is creative testing volume and landing-page speed, not a higher bid.',
      },
      {
        q: 'How do reviews and reporting work remotely?',
        a: 'Shared live dashboards, a weekly written read on what changed and why, and a monthly or quarterly call. Our client retention rate is 94%, which is the honest measure of whether that cadence is working.',
      },
    ],
  },

  {
    group: 'locations',
    slug: 'digital-marketing-agency-bengaluru',
    nav: 'Bengaluru',
    title: 'Digital Marketing Agency for Bengaluru Brands | GrowthArc Media',
    description:
      'Digital marketing, performance and Next.js engineering for Bengaluru D2C, SaaS and fintech brands — run from our Gurugram and Goa hubs. SEO, GEO, Meta and Google Ads.',
    h1: 'Digital Marketing & Growth Agency for Bengaluru Brands',
    label: '(LOCATION)',
    display: 'BENGALURU',
    office: false,
    city: 'Bengaluru',
    region: 'Karnataka',
    lede:
      'As with Mumbai: GrowthArc Media has no Bengaluru office. Bengaluru accounts run from our Gurugram (Delhi NCR) and Panjim (Goa) hubs. What Bengaluru brands tend to want from an agency is the engineering half anyway — and that is the half most agencies subcontract.',
    stats: [
      { value: '99/100', label: 'Google Lighthouse speed score' },
      { value: '<0.8s', label: 'Average engineered page load' },
      { value: '+180%', label: 'Mobile conversion rate increase' },
    ],
    sections: [
      {
        label: '(WHY THIS MARKET IS DIFFERENT)',
        heading: 'Bengaluru founders audit the implementation, not the deck.',
        body: [
          'In a city full of engineers, a marketing agency gets asked harder questions: how is the conversion event firing, why is attribution disagreeing with the backend, what is actually in the 1.4MB of JavaScript on the landing page. Those are fair questions and most agencies cannot answer them, because the people who could are a vendor they forwarded an email to.',
          'GrowthArc Media builds in-house — Next.js, React, Vite, headless commerce — so the answer comes from the same team that bought the media.',
        ],
        bulletLabel: '(WHAT WE RUN FOR BENGALURU BRANDS)',
        bullets: [
          'Next.js, React and headless commerce engineering in-house',
          'Server-side and CRM conversion tracking that reconciles with the backend',
          'Google Search, Meta and LinkedIn paid media for D2C, SaaS and fintech',
          'Technical SEO, Core Web Vitals and Generative Engine Optimization (GEO)',
          'Direct-response and UGC creative production',
          'Brand strategy, identity and design systems',
        ],
      },
      {
        label: '(SAAS AND D2C, DIFFERENT FUNNELS)',
        heading: 'A trial signup and a first order are not the same conversion.',
        body: [
          'For a B2B or SaaS product the paid job is qualified pipeline, which means optimising on activation or demo-held rather than form fill, and buying LinkedIn and high-intent Search before anything else. For a consumer brand it is creative velocity and checkout conversion.',
          'Both run on the same principle — report against net business revenue, not impressions or follower counts — and both need the tracking to be honest before the spend goes up.',
        ],
      },
    ],
    cases: [
      { name: 'RupeeNest Capital', sector: 'Fintech & financial services', href: '/work/rupeenest-capital.html', line: 'High-security platform, paid funnels and qualified lead generation.' },
      { name: 'GemHub', sector: 'Luxury jewellery e-commerce', href: '/work/gemhub.html', line: 'Custom e-commerce web portal and performance growth.' },
      { name: 'Kisaansay', sector: 'Agri-commerce', href: '/work/kisaansay.html', line: 'Brand identity, packaging and full-funnel digital growth.' },
    ],
    services: ['web-development', 'digital-marketing', 'performance-marketing'],
    faqs: [
      {
        q: 'Does GrowthArc Media have a Bengaluru office?',
        a: 'No. Our Indian offices are Gurugram (Cyber City, Delhi NCR) and Panjim, Goa; Bengaluru accounts are run from there, with hubs in Dubai and Austin for international clients.',
      },
      {
        q: 'Do you work with B2B SaaS as well as D2C?',
        a: 'Yes. For SaaS and B2B the paid job is qualified pipeline — optimising on activation or demo-held rather than form fill, with LinkedIn and high-intent Google Search carrying the weight. Pinnacle Digital Services and Marux are both B2B and technology-side clients.',
      },
      {
        q: 'Is the engineering in-house or subcontracted?',
        a: 'In-house. Next.js, React, Vite and headless commerce are built by our own team — 99/100 Google Lighthouse, under 0.8s average load, +180% mobile conversion rate increase. It is also why conversion-tracking questions get a real answer rather than a forwarded email.',
      },
      {
        q: 'Can you fix attribution that disagrees with our backend?',
        a: 'That is usually the first thing worth fixing. It means server-side event tracking, deduplicated browser and server events, and CRM or order-system conversion imports so the ad platforms optimise against outcomes rather than form fills. Raising spend on top of broken attribution just scales the error.',
      },
      {
        q: 'What do Bengaluru engagements cost?',
        a: 'Retainers from ₹1.5 lakh to ₹40 lakh+ per month; web and platform builds from ₹2.5 lakh for a marketing site to ₹40 lakh+ for custom commerce or fintech platforms. Priced on scope, not on city.',
      },
    ],
  },
];

/** Service page metadata used for the cross-links on each hub. */
export const SERVICE_LINKS = {
  'performance-marketing': {
    name: 'Performance Marketing',
    line: 'Meta Ads, Google Search and Shopping, YouTube, TikTok and LinkedIn, plus CRO.',
  },
  'digital-marketing': {
    name: 'Digital Marketing, SEO & GEO',
    line: 'Organic search, AI search visibility, social management and influencer growth.',
  },
  'web-development': {
    name: 'Web Development',
    line: 'Next.js, React and Vite builds, headless e-commerce and sub-second landing pages.',
  },
  'creative-content': {
    name: 'Creative & Content',
    line: 'Direct-response ad creative, UGC and creator video, copywriting and PR.',
  },
  'brand-identity': {
    name: 'Brand Identity',
    line: 'Logomarks, typography and colour systems, guidelines, packaging and UI kits.',
  },
  'brand-strategy': {
    name: 'Brand Strategy',
    line: 'Positioning, messaging, category intelligence and the growth roadmap.',
  },
};
