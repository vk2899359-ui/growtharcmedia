# Report specification

Write in formal English. Markdown tables throughout. Truncate long copy in tables with "…" (full text lives in `ads.csv`). Never fill a cell with a guess — use `Not available`.

## Header (source data — from stats.json)

```
# Meta Ads Intelligence Report — <brand / query> (<market>)

| Metric | Value |
|---|---|
| TOTAL ADS COLLECTED | <collected> (requested <requested>; <shortfall> short, if any) |
| MARKET | <market, e.g. United States (US)> |
| DATE OF RESEARCH | <date_of_research> |
| NUMBER OF BRANDS | <num_brands> |
| NUMBER OF ADS | <collected> unique (<duplicates removed> duplicates removed) |
| STATUS FILTER | <Active / Inactive / All> |
| SOURCE | <Meta Ads MCP / Apify actor apify/facebook-ads-scraper / both> |
| SOURCE URL | <normalized Ad Library URL> |
```

Follow with a one-line legend: **Source data** = taken verbatim from Meta Ad Library. **Analysis** = interpretation by Claude.

## SECTION 1 — Executive Summary  _(Analysis)_
5–8 bullets. Most important patterns: dominant hooks, offers, creative format, CTA, how long ads run (long runners = likely winners — say "running 60+ days, which suggests it is performing", not "it is performing"), brand concentration. End with the single biggest opportunity for GemHubCo.

## SECTION 2 — Ad-by-Ad Table  _(Source data, except Hook and Offer)_
`Brand | Ad ID | Hook | Primary Text | Headline | CTA | Creative Type | Offer | Landing Page | Start Date | Status`
- **Hook** = the first sentence/line of the primary text, verbatim (≤ 90 chars). If no text: `Not available`.
- **Offer** = the offer stated in the copy (verbatim phrase, e.g. "20% off sitewide") or `No explicit offer`. Mark it as analysis in the column header: `Offer*` with footnote "* extracted from ad copy".
- Ad ID links to `ad_library_url`. Landing page shows domain + path only.
- One row per collected ad, in collection order.

## SECTION 3 — Hook Analysis  _(Analysis)_
Classify each ad into one primary hook (secondary allowed). Categories: Price/discount · Affordable luxury · Lab-grown diamond · Engagement/bridal · Gifting · Quality/certification · Sustainability · Social proof · Urgency · Free shipping · Financing/payment · Product-specific · Emotional storytelling · Other (name it).

`Hook | No. of ads | Example (verbatim, with Ad ID) | Strategic insight`
Sort by count. Only include categories with ≥ 1 ad; then list "Not observed" categories in one line — absence is itself an insight.

## SECTION 4 — Offer Analysis  _(Analysis, seeded by `offer_signals`)_
`Offer / mechanism | No. of ads | Brands using it | Example (verbatim) | Insight`
Mechanisms: % off (list each %), $/AED off, free shipping, free returns, BOGO, limited-time sale, financing/BNPL (name provider: Affirm, Klarna, Afterpay, Tabby, Tamara), bundle/set, free gift, warranty/lifetime upgrade, free resizing/engraving, seasonal event, **No explicit offer**. Verify each auto-tag against the copy before counting.

## SECTION 5 — Creative Analysis  _(Analysis)_
Two tables:
1. **Format** (source data from `creative_type`): Video · Static image · Carousel · Catalog/DPA · DCO · Not available → count + %.
2. **Creative style** (analysis — infer only from copy, headline, format and media URLs; if you can't tell, say "Unclear"): UGC · Product close-up · Lifestyle · Founder/creator · Testimonial · Educational · Promotional.
State plainly that style classification is inferred from text/metadata unless the creative was viewed. Then 3–4 sentences on which formats dominate and why.

## SECTION 6 — CTA Analysis  _(Source data counts + analysis)_
`CTA | No. of ads | % | Typical pairing (hook/offer) | Insight`
Rows: Shop Now · Learn More · Buy Now · Get Offer · Sign Up · Other (name each) · Not available.

## SECTION 7 — Competitor Messaging  _(Analysis)_
Table: `Messaging pattern | Brands | Example | Frequency`.
Then a short block titled **"What are competitors trying to make customers believe?"** — 4–6 belief statements in the customer's voice (e.g. "Lab-grown is real diamond, just smarter value."), each backed by Ad IDs.

## SECTION 8 — Gaps & Opportunities  _(Analysis)_
5–8 underused angles. For each:
```
**Opportunity:** …
**Why it matters:** … (cite what competitors do / don't do, with counts)
**How GemHubCo could use it:** …
**Suggested hook:** "…"
```

## SECTION 9 — GemHubCo Recommendations  _(Analysis)_
Differentiated — do not copy competitor lines. Tag each item with market fit: `[US]`, `[UAE]`, or `[US+UAE]`.
- **10 recommended hooks** (numbered, ready-to-use lines)
- **5 video ad concepts** — table: `Concept | Hook (0–3s) | Storyline | Proof element | CTA | Market`
- **5 static ad concepts** — table: `Concept | Visual | Headline | Primary text (≤125 chars) | CTA | Market`
- **5 UGC concepts** — table: `Creator type | Script opener | Key beats | Market`
- **5 offer ideas** — table: `Offer | Mechanic | Why it beats competitors' offers | Margin/brand risk`
- **5 CTA variations** — button + supporting line
Any claim needing verification (certification body, warranty, shipping times, price points, BNPL availability) → append "(verify before launch)".

## SECTION 10 — Winning Ad Formulas  _(Analysis)_
5 reusable formulas, e.g. `HOOK → PROBLEM/DESIRE → PRODUCT → PROOF → OFFER → CTA`. For each: formula line, when to use it (funnel stage / market), which collected ads it is derived from (Ad IDs), and one full GemHubCo example ad written out.

## Data-source note (end of report)
- Collector(s) used, actor name, run date/time (UTC).
- Requested vs collected; duplicates removed; ads dropped by status filter.
- Fields unavailable for all ads (from `stats.fields_unavailable_for_all_ads`) — typically impressions/spend outside political/EU ads.
- Any errors encountered (step + message).
- Files: `ads.csv`, `ads.json`, `stats.json`, `report.md` paths.

## Comparison mode (US vs UAE)
Same header with one column per market. Sections 1, 3, 4, 5, 6, 7 become side-by-side (`… | US | UAE | Difference / insight`). Sections 8–10 produce market-specific recommendations plus shared ones.
