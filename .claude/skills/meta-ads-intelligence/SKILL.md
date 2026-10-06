---
name: meta-ads-intelligence
description: Meta Ads Intelligence Scraper & Analyzer. Collects ads from a Facebook/Meta Ad Library URL (Meta Ads MCP first, Apify as the scraping layer) and returns a 10-section competitive-analysis report plus a raw-data CSV, with GemHubCo (premium lab-grown diamond jewellery, US + UAE) recommendations. Trigger whenever the user pastes a facebook.com/ads/library URL, or says things like "scrape 20 ads from this URL", "scrape 50 active jewellery ads", "analyse these UAE jewellery competitors", "compare these US and UAE ads", "find the most common hooks", "competitor ad research", "Ad Library analysis", or "give me GemHubCo ad concepts based on this research".
---

# Meta Ads Intelligence Scraper & Analyzer

One-line usage: `Scrape <N> ads from this URL: <Ad Library URL>` → full workflow runs end to end. No manual copying, no opening ads one by one, no spreadsheets.

Skill directory (referred to as `$SKILL` below): the folder containing this file. Scripts are stdlib-only Python 3 — no installs needed.

## 0. Parse the request

| Input | Source | Default |
|---|---|---|
| Ad Library URL | user message | required (unless a follow-up command reuses a previous run) |
| Ads required | "20 ads", "50 ads" | **10** |
| Status | "active" / "inactive" / "all" | **active** |
| Market | "US", "UAE", "United Arab Emirates"… | the `country=` in the URL |
| Brand / competitor name | optional | none |

Then run:

```bash
python3 $SKILL/scripts/parse_url.py "<URL>" --status active --country <ISO2 or omit>
```

It prints JSON with the normalized URL (status/country forced into it), and the equivalent Meta MCP arguments (`search_terms`, `page_ids`, `countries`, `ad_active_status`). Use these exact values downstream. Country names are mapped to ISO-2 (UAE → AE, USA → US, UK → GB).

Command routing:

| User says | Do |
|---|---|
| "Scrape N ads from URL" / "Scrape N active jewellery ads from URL" | Full workflow (steps 1–5) |
| "Analyse these UAE jewellery competitors" (+ URL) | Full workflow with country AE |
| "Compare these US and UAE ads" | Run steps 1–3 once per market (two URLs, or one URL re-parsed with `--country US` and `--country AE`), then a side-by-side version of Sections 1, 3–7 with a US vs UAE column, plus the GemHubCo sections |
| "Find the most common hooks" | If a run exists in this conversation / `ad-research/`, reuse its `ads.json` — do NOT re-scrape. Output Section 3 only (+ short summary) |
| "Give me 10 GemHubCo ad concepts based on this research" | Reuse latest `ads.json`; output Section 9-style concepts only |

## 1. Collect — Meta Ads MCP first

Load `mcp__Meta_auric__ads_library_search` (or any `ads_library_search` tool from a Meta Ads MCP) via ToolSearch. Call it with the `mcp_args` from `parse_url.py` and `limit = min(requested, 50)`.

Save the raw tool result verbatim to `<run_dir>/raw_mcp.json` (run_dir defined in step 2).

**Decide whether MCP is enough.** Use MCP results alone only if ALL are true:
- the call succeeded and returned ≥ the requested number of ads;
- the URL could be expressed as MCP args (search term and/or page ID and country);
- the results carry primary text AND at least CTA or landing URL or creative type for most ads.

The Ad Library API behind the MCP usually does **not** return CTA, landing page, or creative format for commercial ads — so in practice step 1b runs for most requests. That is expected; don't ask the user, just continue.

If the MCP errors (e.g. "no active ad account", permissions, rate limit), record the exact error text for the report's data-source note and go to 1b.

## 1b. Collect — Apify (scraping layer)

Verified MCP behaviour: `ads_library_search` returns only id, page, link title, start date, snapshot URL and currency — **no primary text, CTA, landing URL or creative format**. So Apify is required for any full report.

**Path A: Apify MCP connector (preferred when present).** Run ToolSearch for `apify` (also `call-actor`, `actor`). If tools load, call the actor `apify/facebook-ads-scraper` with the input in `references/apify.md` (startUrls = normalized URL, resultsLimit ≈ N×1.3, activeStatus), then fetch the run's dataset items. Write them to `<run_dir>/raw_apify.json` as `{"meta": {"collector": "apify-mcp", "actor": "..."}, "items": [...]}`. The connector holds its own auth, so no token handling is needed.

**Path B: script (when no Apify connector is loaded).**

```bash
python3 $SKILL/scripts/apify_fetch.py \
  --url "<normalized_url from parse_url.py>" \
  --limit <N> --status <active|inactive|all> \
  --out <run_dir>/raw_apify.json
```

- Default actor: `apify/facebook-ads-scraper` (official). Override with `--actor` or env `APIFY_FB_ADS_ACTOR`; pass a full custom input with `--input-json` if a different actor needs a different schema. Details: `references/apify.md`.
- It fetches a small buffer above N (dedupe can shrink results), polls the run, and downloads the dataset. Exit code ≠ 0 means failure; stderr holds the failing step (`auth`, `start_run`, `poll`, `dataset`) and the API error. **Report that step and message verbatim; never substitute invented ads.**
- **Token security:** the script reads the token itself (env `APIFY_TOKEN` / `APIFY_API_TOKEN`, or `~/.config/apify/token`, or `.env.local` / `.env` in cwd). Never `cat`, `echo`, print, or pass the token on the command line; never write it into any file, report, CSV, commit, or message. If no token is found, tell the user to run the one-time setup in `references/apify.md` and stop.

## 2. Normalize, dedupe, count

Run directory: `ad-research/<YYYY-MM-DD>_<market>_<brand-or-query-slug>/` in the current working directory (create it before step 1).

```bash
python3 $SKILL/scripts/normalize.py \
  --in <run_dir>/raw_apify.json [--in <run_dir>/raw_mcp.json] \
  --limit <N> --status <active|inactive|all> --market <ISO2> \
  --out-dir <run_dir>
```

Produces:
- `ads.json` / `ads.csv` — one row per unique ad, every field from the data spec; missing values = `Not available`. Apify rows win; MCP rows fill gaps by Ad ID.
- `stats.json` — computed counts (brands, CTA, creative type, status, platforms, landing domains, date range, auto-detected offer signals, duplicates removed, status-filter drops). **Use these numbers in the report — don't recount by eye.**

`offer_signals` and `creative_type` in the CSV are rule-based tags from the ad text/format; treat them as a starting point and correct them in your analysis where the copy says otherwise.

If fewer unique ads than requested exist, say so plainly: "Requested 20, collected 14 unique ads."

## 3. Read the data

Read `ads.json` (all of it) and `stats.json`. Read `references/report-spec.md` for the exact section layout and `references/gemhubco.md` for brand context. Optionally ground Sections 8–10 in GemHubCo's real catalogue via the `gemhubcoo` MCP (`search_products`) — never claim a product, certification, price or offer GemHubCo hasn't confirmed; mark such ideas "verify before launch".

## 4. Write the report

Follow `references/report-spec.md` exactly: header block, Sections 1–10, Markdown tables. Save it as `<run_dir>/report.md` and also show it in the reply.

Data integrity rules (non-negotiable):
- Never fabricate ad information. Missing → `Not available`.
- Quote ad copy verbatim (trim only with "…" for table width; full text stays in the CSV).
- Label clearly: **Source data** (Sections 2, header, counts) vs **Analysis** (everything interpretive). Each analysis section starts with `_Analysis — based on N collected ads._`
- An ad is "Active" only if the source says so (`is_active` true / no stop date from an active-status query). Otherwise `Not available` or `Inactive`.
- Impressions/spend: only show what the source returned (usually only for political/EU ads). Never estimate.
- Only publicly available Ad Library data. No logging in as other users, no bypassing Meta access controls.

## 5. Deliver

- Show the report in the reply.
- Surface `ads.csv` (and `report.md`) to the user as files (SendUserFile, or the host's file mechanism). Give the paths.
- Data-source note at the end: which collector ran (MCP / Apify actor name / both), run date, any errors, ads requested vs collected, duplicates removed.
- Don't commit `ad-research/` output unless the user asks.

## Failure handling

| Failure | Response |
|---|---|
| MCP error | Note it, continue with Apify |
| No Apify connector AND no token | Deliver an MCP-only report if MCP returned ads, with a clear note that primary text/CTA/landing page/creative type are missing, so hook, offer, creative and CTA sections are limited. Point to setup in `references/apify.md` |
| Apify 401/403 | "Apify rejected the token (step: start_run, HTTP 401)" — ask user to check/rotate token |
| Network blocked (proxy 403 / connection refused to api.apify.com) | Say the host `api.apify.com` is blocked by the environment's network policy; it must be allowed |
| Run FAILED / TIMED-OUT | Report status + the run's status message; offer retry with smaller N |
| 0 ads returned | Say so; suggest checking the URL filters (country, status, search term) — don't pad |
