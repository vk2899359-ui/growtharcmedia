# Apify layer — setup, actor, field mapping

## One-time setup (token never leaves your machine/environment)

Pick ONE:

1. **Claude Code on the web / cloud environment:** add an environment variable `APIFY_TOKEN=<your token>` in the environment settings (session title bar → environment → Edit → Environment variables). Also make sure network access allows `api.apify.com` (Custom → Allowed domains, or a broader access level).
2. **Local machine:**
   ```bash
   mkdir -p ~/.config/apify && printf '%s' 'PASTE_TOKEN' > ~/.config/apify/token && chmod 600 ~/.config/apify/token
   ```
3. **Per project:** `APIFY_TOKEN=...` in `.env.local` (already git-ignored via `*.local`). Never put it in `.env` that might be committed.

Token: Apify Console → Settings → API & Integrations → Personal API tokens. Rotate it if it is ever pasted into a chat, a file, or a commit.

Rules for Claude: never print, echo, cat, log, or pass the token as a CLI argument; never write it into reports, CSVs, commits, or messages. `apify_fetch.py` reads it internally and sends it only as an `Authorization: Bearer` header, scrubbing it from any error text.

## Default actor: `apify/facebook-ads-scraper`

Input built by `apify_fetch.py`:
```json
{
  "startUrls": [{"url": "<Ad Library URL with active_status & country set>"}],
  "resultsLimit": <N × ~1.3>,
  "activeStatus": "active" | "inactive" | "",
  "isDetailsPerAd": false,
  "onlyTotal": false
}
```
`--details` sets `isDetailsPerAd: true` (adds EU reach/demographic transparency data; slower and more expensive). `maxItems` is also passed as a run option to cap pay-per-result cost.

Cost: pay-per-result; the run's `usage_usd` is printed after each run — mention it in the data-source note.

### Switching actors
If the default actor changes its schema or is unavailable:
```bash
python3 scripts/apify_fetch.py --url "<url>" --limit 20 --out raw.json \
  --actor <username>/<actor-name> \
  --input-json '{"urls":[{"url":"<url>"}],"count":26}'
```
or set env `APIFY_FB_ADS_ACTOR`. `normalize.py` accepts camelCase or snake_case output, so most Ad Library actors normalise without changes; check `stats.json → fields_unavailable_for_all_ads` after switching.

## Output → normalized field mapping

| Normalized field | Apify field(s) | Meta MCP field(s) |
|---|---|---|
| brand | pageName / snapshot.pageName | page_name |
| ad_id | adArchiveID / ad_archive_id | id |
| status | isActive | inferred only from the ACTIVE/INACTIVE query filter (labelled in `status_basis`) |
| start_date | startDate (epoch) / startDateFormatted | ad_delivery_start_time |
| end_date | endDate (only for inactive ads — for active ads Apify's endDate is "last seen") | ad_delivery_stop_time |
| primary_text | snapshot.body.text → cards[0].body | ad_creative_bodies |
| headline | snapshot.title → cards[0].title | ad_creative_link_titles |
| description | snapshot.linkDescription | ad_creative_link_descriptions |
| cta | snapshot.ctaText (ctaType) | — |
| landing_url | snapshot.linkUrl → cards[0].linkUrl | — |
| creative_type | snapshot.displayFormat + images/videos/cards counts | — |
| video_info | snapshot.videos[].videoHdUrl / videoPreviewImageUrl | — |
| platforms | publisherPlatform | publisher_platforms |
| impressions / spend / reach | impressionsWithIndex, spend, reachEstimate | impressions, spend, eu_total_reach |
| variant_count | collationCount | — |

## Troubleshooting

| stderr `step` | Meaning | Fix |
|---|---|---|
| auth | No token found | Do the one-time setup above |
| start_run, http 401/403 | Bad token or actor not accessible | Re-check / rotate token; confirm the actor is available on your plan |
| start_run, network error / proxy 403 | `api.apify.com` blocked | Allow `api.apify.com` in the environment network policy |
| poll | Run FAILED / TIMED-OUT / ABORTED | Check the run in Apify Console (run_id is in the error); retry with a smaller `--limit` or larger `--timeout` |
| dataset | Dataset could not be read | Retry; the run_id is in the error |
