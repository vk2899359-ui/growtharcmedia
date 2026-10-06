#!/usr/bin/env python3
"""Run an Apify Facebook Ad Library actor and save the raw dataset items.

The Apify token is read here and only here. It is sent in the Authorization
header (never in a URL), never printed, and scrubbed from any error text.

Token lookup order:
  1. env APIFY_TOKEN, then APIFY_API_TOKEN
  2. ~/.config/apify/token   (file containing only the token; chmod 600)
  3. APIFY_TOKEN=... line in ./.env.local or ./.env

Usage:
  apify_fetch.py --url "<ad library url>" --limit 20 --status active --out raw_apify.json
         [--actor apify/facebook-ads-scraper] [--input-json '{"...": ...}'] [--timeout 900]

Exit codes: 0 ok, 2 bad args/auth, 3 Apify/network error. Errors are JSON on stderr:
  {"step": "start_run", "http_status": 401, "error": "..."}
"""
import argparse
import json
import math
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request

API = "https://api.apify.com/v2"
DEFAULT_ACTOR = "apify/facebook-ads-scraper"
_TOKEN = None


def fail(step, error, http_status=None, code=3, **extra):
    msg = str(error)
    if _TOKEN:
        msg = msg.replace(_TOKEN, "***")
    payload = {"step": step, "error": msg}
    if http_status is not None:
        payload["http_status"] = http_status
    payload.update(extra)
    print(json.dumps(payload), file=sys.stderr)
    sys.exit(code)


def load_token():
    for var in ("APIFY_TOKEN", "APIFY_API_TOKEN"):
        if os.environ.get(var, "").strip():
            return os.environ[var].strip()
    cfg = pathlib.Path.home() / ".config" / "apify" / "token"
    if cfg.is_file():
        t = cfg.read_text().strip()
        if t:
            return t
    for name in (".env.local", ".env"):
        p = pathlib.Path.cwd() / name
        if p.is_file():
            for line in p.read_text().splitlines():
                line = line.strip()
                if line.startswith(("APIFY_TOKEN=", "APIFY_API_TOKEN=")):
                    t = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if t:
                        return t
    return None


def call(step, method, path, body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Authorization", f"Bearer {_TOKEN}")
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode() or "null")
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:800]
        hint = None
        if e.code in (401, 403) and "apify" in detail.lower():
            hint = "Apify rejected the token or the actor is not accessible on this account."
        fail(step, detail or e.reason, http_status=e.code, hint=hint)
    except urllib.error.URLError as e:
        fail(step, f"Network error reaching api.apify.com: {e.reason}",
             hint="If this is a proxy 403 / tunnel failure, api.apify.com must be allowed by the environment's network policy.")
    except (TimeoutError, OSError) as e:
        fail(step, f"Network error reaching api.apify.com: {e}")


def build_input(url, limit, status, details):
    # apify/facebook-ads-scraper input schema. Status is also forced into the URL
    # (parse_url.py), so the result is correct even if the actor ignores activeStatus.
    return {
        "startUrls": [{"url": url}],
        "resultsLimit": limit,
        "activeStatus": "" if status == "all" else status,
        # Per-ad detail pages add EU transparency data (reach/demographics) but cost more.
        "isDetailsPerAd": details,
        "onlyTotal": False,
    }


def main():
    global _TOKEN
    ap = argparse.ArgumentParser(description="Run Apify Facebook Ad Library actor")
    ap.add_argument("--url", required=True)
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--status", choices=["active", "inactive", "all"], default="active")
    ap.add_argument("--out", required=True)
    ap.add_argument("--actor", default=os.environ.get("APIFY_FB_ADS_ACTOR", DEFAULT_ACTOR))
    ap.add_argument("--input-json", help="Full actor input JSON (overrides the built-in input)")
    ap.add_argument("--details", action="store_true",
                    help="Fetch per-ad detail pages (EU reach/demographics; slower, costs more)")
    ap.add_argument("--timeout", type=int, default=900, help="Max seconds to wait for the run")
    a = ap.parse_args()

    if a.limit < 1:
        fail("args", "--limit must be >= 1", code=2)

    _TOKEN = load_token()
    if not _TOKEN:
        fail("auth", "No Apify token found. Set APIFY_TOKEN, or save it to ~/.config/apify/token "
                     "(see references/apify.md).", code=2)

    # Buffer for dedupe / status filtering; trimmed back to --limit in normalize.py.
    fetch_n = max(a.limit, math.ceil(a.limit * 1.3)) if a.limit > 5 else a.limit + 3
    actor_input = json.loads(a.input_json) if a.input_json else build_input(a.url, fetch_n, a.status, a.details)

    actor_path = a.actor.replace("/", "~")
    started = call("start_run", "POST", f"/acts/{actor_path}/runs?maxItems={fetch_n}", actor_input)
    run = (started or {}).get("data") or {}
    run_id = run.get("id")
    if not run_id:
        fail("start_run", f"Unexpected response: {json.dumps(started)[:500]}")
    print(f"[apify] run {run_id} started (actor {a.actor}, requesting {fetch_n})", file=sys.stderr)

    deadline = time.time() + a.timeout
    delay = 5
    status = run.get("status")
    while status in ("READY", "RUNNING", None):
        if time.time() > deadline:
            fail("poll", f"Run {run_id} still {status} after {a.timeout}s", run_id=run_id)
        time.sleep(delay)
        delay = min(delay + 5, 20)
        run = (call("poll", "GET", f"/actor-runs/{run_id}") or {}).get("data") or {}
        status = run.get("status")
        print(f"[apify] status: {status}", file=sys.stderr)

    if status != "SUCCEEDED":
        fail("poll", f"Run ended with status {status}: {run.get('statusMessage') or 'no message'}",
             run_id=run_id, run_status=status)

    ds = run.get("defaultDatasetId")
    items = call("dataset", "GET", f"/datasets/{ds}/items?clean=true&format=json", timeout=180)
    if not isinstance(items, list):
        fail("dataset", f"Dataset response was not a list: {str(items)[:300]}")

    meta = {
        "collector": "apify",
        "actor": a.actor,
        "run_id": run_id,
        "dataset_id": ds,
        "requested": a.limit,
        "fetched_limit": fetch_n,
        "status_filter": a.status,
        "source_url": a.url,
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "usage_usd": run.get("usageTotalUsd"),
    }
    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"meta": meta, "items": items}, ensure_ascii=False, indent=1))
    print(json.dumps({"ok": True, "items": len(items), "out": str(out), "run_id": run_id,
                      "usage_usd": meta["usage_usd"]}))


if __name__ == "__main__":
    main()
