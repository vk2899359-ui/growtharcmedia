#!/usr/bin/env python3
"""Parse a Facebook Ad Library URL into normalized filters.

Prints JSON: the normalized URL (status / country forced into the query string),
the parsed filters, and the equivalent Meta Ads MCP `ads_library_search` args.

Usage:
  parse_url.py "<ad library url>" [--status active|inactive|all] [--country US|AE|...]
"""
import argparse
import json
import sys
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

COUNTRY_ALIASES = {
    "UAE": "AE", "UNITED ARAB EMIRATES": "AE", "EMIRATES": "AE", "DUBAI": "AE",
    "USA": "US", "UNITED STATES": "US", "AMERICA": "US",
    "UK": "GB", "UNITED KINGDOM": "GB", "BRITAIN": "GB",
    "INDIA": "IN", "SAUDI": "SA", "SAUDI ARABIA": "SA", "KSA": "SA",
    "CANADA": "CA", "AUSTRALIA": "AU", "QATAR": "QA", "KUWAIT": "KW",
    "ALL": "ALL", "GLOBAL": "ALL",
}
STATUS_VALUES = {"active", "inactive", "all"}


def to_iso2(value):
    if not value:
        return None
    v = value.strip().upper()
    v = COUNTRY_ALIASES.get(v, v)
    if v != "ALL" and len(v) != 2:
        raise ValueError(f"Unrecognised country/market: {value!r} (use ISO-2, e.g. US, AE)")
    return v


def parse(url, status=None, country=None):
    parts = urlsplit(url.strip())
    host = parts.netloc.lower()
    if "facebook.com" not in host or "/ads/library" not in parts.path:
        raise ValueError("Not a Facebook Ad Library URL (expected facebook.com/ads/library/...)")

    params = dict(parse_qsl(parts.query, keep_blank_values=True))

    if status:
        status = status.lower()
        if status not in STATUS_VALUES:
            raise ValueError(f"status must be one of {sorted(STATUS_VALUES)}")
        params["active_status"] = status
    status = (params.get("active_status") or "active").lower()
    params["active_status"] = status

    iso = to_iso2(country) if country else to_iso2(params.get("country") or "ALL")
    params["country"] = iso
    params.setdefault("ad_type", "all")
    params.setdefault("media_type", "all")

    search_term = params.get("q") or None
    page_id = params.get("view_all_page_id") or None
    single_ad_id = params.get("id") or None

    mcp_args = {"ad_active_status": status.upper()}
    if search_term:
        mcp_args["search_terms"] = search_term
    if page_id:
        mcp_args["page_ids"] = [page_id]
    if iso and iso != "ALL":
        mcp_args["countries"] = [iso]
    mcp_expressible = bool(search_term or page_id or (iso and iso != "ALL"))
    if params.get("media_type", "all") != "all":
        # The MCP tool has no media-type filter; Apify honours it via the URL.
        mcp_expressible_note = "MCP cannot filter media_type; Apify will apply it via the URL"
    else:
        mcp_expressible_note = None

    normalized = urlunsplit((parts.scheme or "https", "www.facebook.com", "/ads/library/",
                             urlencode(params, doseq=True), ""))
    return {
        "normalized_url": normalized,
        "filters": {
            "status": status,
            "country": iso,
            "search_term": search_term,
            "search_type": params.get("search_type") or None,
            "page_id": page_id,
            "single_ad_id": single_ad_id,
            "media_type": params.get("media_type"),
            "ad_type": params.get("ad_type"),
        },
        "mcp_expressible": mcp_expressible,
        "mcp_note": mcp_expressible_note,
        "mcp_args": mcp_args,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("url")
    ap.add_argument("--status", choices=sorted(STATUS_VALUES))
    ap.add_argument("--country", help="ISO-2 code or market name (UAE, USA, ...)")
    a = ap.parse_args()
    try:
        out = parse(a.url, a.status, a.country)
    except ValueError as e:
        print(json.dumps({"error": str(e), "step": "parse_url"}), file=sys.stderr)
        sys.exit(2)
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
