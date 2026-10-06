#!/usr/bin/env python3
"""Normalize raw Ad Library data (Apify dataset and/or Meta MCP result) into
ads.json, ads.csv and stats.json.

- Tolerates camelCase / snake_case field variants across actor versions.
- Missing values are written as "Not available" — nothing is inferred except the
  clearly-labelled rule-based tags `creative_type` and `offer_signals`.
- Dedupes by Ad ID, then by identical content (brand + text + headline + landing URL).
- Apify rows win; MCP rows only fill gaps for the same Ad ID (or add new IDs).

Usage:
  normalize.py --in raw_apify.json [--in raw_mcp.json] --limit 20 --status active \
               --market US --out-dir ad-research/2026-10-06_US_brand
"""
import argparse
import collections
import csv
import datetime as dt
import json
import pathlib
import re
import sys
from urllib.parse import urlsplit

NA = "Not available"

CSV_FIELDS = [
    "brand", "page_id", "ad_id", "status", "status_basis", "start_date", "end_date",
    "days_running", "primary_text", "headline", "description", "cta", "cta_type",
    "landing_url", "landing_domain", "display_caption", "creative_type", "display_format",
    "num_images", "num_videos", "num_cards", "video_info", "image_urls", "ad_library_url",
    "market", "countries", "platforms", "impressions", "spend", "currency", "reach",
    "variant_count", "page_like_count", "page_categories", "languages",
    "dynamic_template", "offer_signals", "duplicate_ad_ids", "source",
]


# ---------- generic helpers ----------

def _variants(key):
    snake = re.sub(r"(?<!^)(?=[A-Z])", "_", key).lower()
    camel = re.sub(r"_([a-z])", lambda m: m.group(1).upper(), key)
    return [key, snake, camel, key.lower()]


def dig(obj, path):
    cur = obj
    for part in path.split("."):
        if isinstance(cur, list):
            if part.isdigit() and int(part) < len(cur):
                cur = cur[int(part)]
                continue
            return None
        if not isinstance(cur, dict):
            return None
        for k in _variants(part):
            if k in cur:
                cur = cur[k]
                break
        else:
            return None
    return cur


def first(obj, *paths):
    for p in paths:
        v = dig(obj, p)
        if v is None or v == "" or v == [] or v == {}:
            continue
        if isinstance(v, dict) and "text" in v:
            v = v["text"]
            if not v:
                continue
        if isinstance(v, list) and all(isinstance(x, str) for x in v):
            v = v[0] if len(v) == 1 else " | ".join(dict.fromkeys(x for x in v if x))
            if not v:
                continue
        return v
    return None


def clean_text(v):
    if v is None:
        return None
    if not isinstance(v, str):
        v = str(v)
    v = v.replace("\r\n", "\n").strip()
    return v or None


def to_date(v):
    if v in (None, "", 0):
        return None
    try:
        if isinstance(v, (int, float)) or (isinstance(v, str) and v.isdigit()):
            n = float(v)
            if n > 1e12:
                n /= 1000
            return dt.datetime.fromtimestamp(n, dt.timezone.utc).date().isoformat()
        s = str(v).strip()
        m = re.match(r"(\d{4}-\d{2}-\d{2})", s)
        if m:
            return m.group(1)
        for fmt in ("%b %d, %Y", "%d %b %Y", "%B %d, %Y", "%m/%d/%Y"):
            try:
                return dt.datetime.strptime(s, fmt).date().isoformat()
            except ValueError:
                pass
    except (ValueError, OSError, OverflowError):
        pass
    return str(v)


def humanize_enum(v):
    if not v or not isinstance(v, str):
        return v
    if v.isupper() or "_" in v:
        return v.replace("_", " ").title()
    return v


# ---------- rule-based tags ----------

OFFER_RULES = [
    ("Percent off", r"\b(?:up to\s+)?\d{1,2}\s?%\s?(?:off|discount)\b|\b(?:save|take)\s+\d{1,2}\s?%"),
    ("Amount off", r"(?:\$|usd\s?|aed\s?|dhs?\s?)\d[\d,]*\s?(?:off|discount)|\bsave\s+(?:\$|aed\s?)\d"),
    ("Free shipping", r"free (?:express |2-day |next[- ]day |worldwide |insured )?(?:shipping|delivery)"),
    ("Free returns", r"free returns?|\d+[- ]day returns?|hassle[- ]free returns?|money[- ]back"),
    ("BOGO", r"\bbogo\b|buy one,? get one|buy 1,? get 1|\b2 for 1\b"),
    ("Bundle/set", r"\bbundle\b|\bmatching set\b|\bgift set\b|\bstack(?:ing)? set\b|\bduo\b"),
    ("Limited-time/urgency", r"limited[- ]time|ends (?:tonight|today|soon|sunday|monday|midnight)|last chance|today only|\bflash sale\b|while (?:stocks?|supplies) last|\bhurry\b|final hours|only \d+ left"),
    ("Sale event", r"\bsale\b|black friday|cyber monday|white friday|singles'? day|boxing day|\bdsf\b|dubai shopping festival"),
    ("Financing/BNPL", r"financ|\baffirm\b|\bklarna\b|afterpay|\btabby\b|\btamara\b|interest[- ]free|0% apr|pay in \d|instal?lments?|monthly payments?"),
    ("Discount code", r"\b(?:use )?code[: ]+[A-Z0-9]{3,}\b|promo code|coupon"),
    ("Free gift / GWP", r"free gift|gift with purchase|\bgwp\b|complimentary (?!shipping)"),
    ("Warranty/guarantee", r"lifetime warranty|lifetime (?:upgrade|guarantee)|\bwarranty\b|buy[- ]?back|upgrade program"),
    ("Free service (resize/engrave)", r"free (?:resiz|engrav|sizing|cleaning|appraisal)"),
    ("Seasonal/occasion", r"valentine|mother'?s day|christmas|holiday|diwali|\beid\b|ramadan|new year|anniversary sale|wedding season"),
]
OFFER_RES = [(name, re.compile(p, re.I)) for name, p in OFFER_RULES]


def offer_signals(*texts):
    blob = " \n ".join(t for t in texts if isinstance(t, str))
    hits = [name for name, rx in OFFER_RES if rx.search(blob)]
    return hits


def creative_type(fmt, n_img, n_vid, n_cards):
    f = (fmt or "").upper()
    if f in ("DPA", "DCO") or "CATALOG" in f:
        base = "Catalog/Dynamic (DPA)" if f == "DPA" else "Dynamic creative (DCO)"
        if n_vid:
            return base + " – video"
        return base
    if f == "CAROUSEL" or n_cards > 1:
        return "Carousel" + (" (with video)" if n_vid else "")
    if f == "VIDEO" or n_vid:
        return "Video"
    if f == "IMAGE" or n_img:
        return "Static image"
    if f:
        return humanize_enum(f)
    return NA


# ---------- source loaders ----------

def load_raw(path):
    text = pathlib.Path(path).read_text(encoding="utf-8")
    data = json.loads(text)
    # MCP tool results are sometimes wrapped as [{"type":"text","text":"{...}"}]
    if isinstance(data, list) and data and isinstance(data[0], dict) and data[0].get("type") == "text":
        data = json.loads(data[0]["text"])
    if isinstance(data, dict) and isinstance(data.get("content"), list):
        inner = data["content"][0]
        if isinstance(inner, dict) and inner.get("type") == "text":
            data = json.loads(inner["text"])
    meta = {}
    if isinstance(data, dict):
        meta = data.get("meta") or {}
        for key in ("items", "data", "ads", "results"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
    if not isinstance(data, list):
        raise ValueError(f"{path}: could not find a list of ads in the file")
    return meta, data


def is_mcp_item(it):
    return any(k in it for k in ("ad_creative_bodies", "ad_snapshot_url", "ad_delivery_start_time"))


def from_item(it, market, status_filter):
    mcp = is_mcp_item(it)
    snap = dig(it, "snapshot") or {}
    cards = dig(snap, "cards") or []
    cards = [c for c in cards if isinstance(c, dict)]
    images = dig(snap, "images") or []
    videos = dig(snap, "videos") or []
    card_imgs = [c for c in cards if first(c, "originalImageUrl", "resizedImageUrl")]
    card_vids = [c for c in cards if first(c, "videoHdUrl", "videoSdUrl")]
    n_img = len(images) + len(card_imgs)
    n_vid = len(videos) + len(card_vids)

    ad_id = first(it, "adArchiveID", "adArchiveId", "ad_archive_id", "adid", "id")
    ad_id = str(ad_id) if ad_id is not None else None

    primary = first(it, "snapshot.body.text", "snapshot.body", "ad_creative_bodies",
                    "snapshot.cards.0.body")
    templated = isinstance(primary, str) and "{{" in primary
    if templated and cards:
        # DPA template body — prefer a real card body if one exists
        card_body = first(cards[0], "body")
        if card_body and "{{" not in str(card_body):
            primary = card_body
    headline = first(it, "snapshot.title", "snapshot.cards.0.title", "ad_creative_link_titles")
    desc = first(it, "snapshot.linkDescription", "snapshot.cards.0.linkDescription",
                 "ad_creative_link_descriptions")
    cta = first(it, "snapshot.ctaText", "snapshot.cards.0.ctaText")
    cta_type = first(it, "snapshot.ctaType", "snapshot.cards.0.ctaType")
    landing = first(it, "snapshot.linkUrl", "snapshot.cards.0.linkUrl")
    caption = first(it, "snapshot.caption", "ad_creative_link_captions")
    fmt = first(it, "snapshot.displayFormat")

    is_active = dig(it, "isActive")
    start = to_date(first(it, "startDate", "startDateFormatted", "ad_delivery_start_time"))
    end_raw = first(it, "endDate", "endDateFormatted", "ad_delivery_stop_time")
    if is_active is True:
        status, basis = "Active", "source: isActive=true"
        end = None  # Apify reports "last seen" as endDate for running ads — not a real end date
    elif is_active is False:
        status, basis = "Inactive", "source: isActive=false"
        end = to_date(end_raw)
    elif mcp and status_filter in ("active", "inactive"):
        end = to_date(end_raw)
        if status_filter == "active" and not end:
            status, basis = "Active", "source: returned by ACTIVE-status query"
        elif status_filter == "inactive":
            status, basis = "Inactive", "source: returned by INACTIVE-status query"
        else:
            status, basis = NA, "conflicting: stop date present"
    else:
        status, basis, end = NA, "not provided by source", to_date(end_raw)

    days = None
    if start and re.match(r"\d{4}-\d{2}-\d{2}$", start):
        stop = end if (end and re.match(r"\d{4}-\d{2}-\d{2}$", end)) else dt.date.today().isoformat()
        try:
            days = (dt.date.fromisoformat(stop) - dt.date.fromisoformat(start)).days
        except ValueError:
            days = None

    video_bits = []
    for v in list(videos) + card_vids:
        url = first(v, "videoHdUrl", "videoSdUrl")
        prev = first(v, "videoPreviewImageUrl")
        if url or prev:
            video_bits.append(f"video={url or NA}; preview={prev or NA}")
    image_urls = [first(i, "originalImageUrl", "resizedImageUrl") for i in images]
    image_urls += [first(c, "originalImageUrl", "resizedImageUrl") for c in card_imgs]
    image_urls = [u for u in image_urls if u][:5]

    impressions = first(it, "impressionsWithIndex.impressionsText")
    if impressions is None:
        lo, hi = dig(it, "impressions.lower_bound"), dig(it, "impressions.upper_bound")
        if lo is not None or hi is not None:
            impressions = f"{lo or '?'}–{hi or '?'}"
    spend = first(it, "spend")
    if isinstance(spend, dict):
        lo, hi = spend.get("lower_bound"), spend.get("upper_bound")
        spend = f"{lo or '?'}–{hi or '?'}" if (lo or hi) else None
    reach = first(it, "reachEstimate", "eu_total_reach", "euTotalReach")

    countries = first(it, "targetedOrReachedCountries", "reached_countries", "target_locations")
    if isinstance(countries, list):
        countries = ", ".join(str(c) for c in countries)

    platforms = first(it, "publisherPlatform", "publisher_platforms")
    if isinstance(platforms, list):
        platforms = ", ".join(humanize_enum(p) for p in platforms)
    elif isinstance(platforms, str):
        platforms = ", ".join(humanize_enum(p.strip()) for p in platforms.split("|"))

    langs = first(it, "languages")
    if isinstance(langs, list):
        langs = ", ".join(langs)
    cats = first(it, "snapshot.pageCategories", "categories")
    if isinstance(cats, list):
        cats = ", ".join(str(c) for c in cats)

    lib_url = first(it, "adLibraryURL", "adLibraryUrl", "url") if not mcp else None
    if not (isinstance(lib_url, str) and "ads/library" in lib_url and "id=" in lib_url):
        lib_url = f"https://www.facebook.com/ads/library/?id={ad_id}" if ad_id else None

    text_for_offers = [clean_text(primary), clean_text(headline), clean_text(desc), clean_text(caption)]
    text_for_offers += [clean_text(first(c, "body")) for c in cards]
    text_for_offers += [clean_text(first(c, "title")) for c in cards]

    row = {
        "brand": clean_text(first(it, "pageName", "page_name", "snapshot.pageName")),
        "page_id": first(it, "pageID", "pageId", "page_id", "snapshot.pageId"),
        "ad_id": ad_id,
        "status": status,
        "status_basis": basis,
        "start_date": start,
        "end_date": end if end else ("Not available (still running)" if status == "Active" else None),
        "days_running": days,
        "primary_text": clean_text(primary),
        "headline": clean_text(headline),
        "description": clean_text(desc),
        "cta": clean_text(cta) or humanize_enum(cta_type),
        "cta_type": cta_type,
        "landing_url": clean_text(landing),
        "landing_domain": urlsplit(landing).netloc.replace("www.", "") if isinstance(landing, str) and "://" in landing else None,
        "display_caption": clean_text(caption),
        "creative_type": creative_type(fmt, n_img, n_vid, len(cards)) if not mcp or fmt else NA,
        "display_format": fmt,
        "num_images": n_img if not mcp else None,
        "num_videos": n_vid if not mcp else None,
        "num_cards": len(cards) if not mcp else None,
        "video_info": " || ".join(video_bits) if video_bits else None,
        "image_urls": " | ".join(image_urls) if image_urls else None,
        "ad_library_url": lib_url,
        "market": market or None,
        "countries": countries,
        "platforms": platforms,
        "impressions": impressions,
        "spend": spend,
        "currency": first(it, "currency"),
        "reach": reach,
        "variant_count": first(it, "collationCount"),
        "page_like_count": first(it, "snapshot.pageLikeCount"),
        "page_categories": cats,
        "languages": langs,
        "dynamic_template": "Yes" if templated or any(t and "{{" in t for t in text_for_offers) else "No",
        "offer_signals": "; ".join(offer_signals(*text_for_offers)) or "No explicit offer detected",
        "duplicate_ad_ids": None,
        "source": "mcp" if mcp else "apify",
    }
    return row


# ---------- merge / dedupe ----------

def norm(s):
    return re.sub(r"\W+", " ", str(s or "")).strip().lower()


def merge(primary, extra):
    for k, v in extra.items():
        if primary.get(k) in (None, "", NA) and v not in (None, "", NA):
            primary[k] = v
    if extra.get("source") and extra["source"] not in primary["source"]:
        primary["source"] += "+" + extra["source"]
    return primary


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inputs", action="append", required=True)
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--status", choices=["active", "inactive", "all"], default="active")
    ap.add_argument("--market", default=None)
    ap.add_argument("--out-dir", required=True)
    a = ap.parse_args()

    metas, rows = [], []
    for path in a.inputs:
        try:
            meta, items = load_raw(path)
        except (OSError, ValueError, json.JSONDecodeError) as e:
            print(json.dumps({"step": "normalize", "file": path, "error": str(e)}), file=sys.stderr)
            continue
        metas.append({"file": path, **meta, "raw_items": len(items)})
        rows.extend(from_item(it, a.market, a.status) for it in items if isinstance(it, dict))

    # Apify first so it wins on merge
    rows.sort(key=lambda r: 0 if r["source"] == "apify" else 1)

    by_id, order, no_id = {}, [], []
    for r in rows:
        if r["ad_id"]:
            if r["ad_id"] in by_id:
                merge(by_id[r["ad_id"]], r)
            else:
                by_id[r["ad_id"]] = r
                order.append(r["ad_id"])
        else:
            no_id.append(r)
    id_dupes = len(rows) - len(order) - len(no_id)

    unique, seen = [], {}
    content_dupes = 0
    for r in [by_id[i] for i in order] + no_id:
        fp = (norm(r["brand"]), norm(r["primary_text"]), norm(r["headline"]),
              norm((r["landing_url"] or "").split("?")[0]))
        if fp[1] == "" and fp[2] == "":
            fp = ("__id__", r["ad_id"] or id(r))  # no copy to compare — keep
        if fp in seen:
            keeper = seen[fp]
            ids = [x for x in (keeper["duplicate_ad_ids"] or "").split(", ") if x]
            ids.append(r["ad_id"] or "?")
            keeper["duplicate_ad_ids"] = ", ".join(ids)
            content_dupes += 1
            continue
        seen[fp] = r
        unique.append(r)

    status_dropped = 0
    if a.status in ("active", "inactive"):
        want = "Active" if a.status == "active" else "Inactive"
        before = len(unique)
        unique = [r for r in unique if r["status"] in (want, NA)]
        status_dropped = before - len(unique)

    available = len(unique)
    unique = unique[: a.limit]

    for r in unique:
        for k in CSV_FIELDS:
            if r.get(k) in (None, "", []):
                r[k] = NA

    out = pathlib.Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "ads.json").write_text(json.dumps(unique, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(out / "ads.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(unique)

    def count(field, split=None):
        c = collections.Counter()
        for r in unique:
            v = r[field]
            vals = [x.strip() for x in str(v).split(split)] if split and v != NA else [v]
            c.update(x for x in vals if x)
        return dict(c.most_common())

    dated = sorted(r["start_date"] for r in unique if re.match(r"\d{4}-\d{2}-\d{2}$", str(r["start_date"])))
    days = [r["days_running"] for r in unique if isinstance(r["days_running"], int)]
    no_offer = sum(1 for r in unique if r["offer_signals"] == "No explicit offer detected")
    stats = {
        "date_of_research": dt.date.today().isoformat(),
        "market": a.market or "Not available",
        "status_filter": a.status,
        "requested": a.limit,
        "total_raw_rows": len(rows),
        "unique_available": available,
        "collected": len(unique),
        "shortfall": max(0, a.limit - len(unique)),
        "duplicates_removed": {"same_ad_id": id_dupes, "identical_content": content_dupes},
        "dropped_by_status_filter": status_dropped,
        "num_brands": len({r["brand"] for r in unique if r["brand"] != NA}),
        "ads_per_brand": count("brand"),
        "status": count("status"),
        "cta": count("cta"),
        "creative_type": count("creative_type"),
        "platforms": count("platforms", split=","),
        "landing_domains": count("landing_domain"),
        "offer_signals_auto": count("offer_signals", split=";"),
        "ads_with_no_explicit_offer_auto": no_offer,
        "dynamic_template_ads": sum(1 for r in unique if r["dynamic_template"] == "Yes"),
        "start_date_range": [dated[0], dated[-1]] if dated else NA,
        "days_running": {"min": min(days), "max": max(days),
                         "median": sorted(days)[len(days) // 2]} if days else NA,
        "long_runners_60d_plus": [r["ad_id"] for r in unique
                                  if isinstance(r["days_running"], int) and r["days_running"] >= 60],
        "fields_unavailable_for_all_ads": [k for k in CSV_FIELDS
                                           if unique and all(r[k] == NA for r in unique)],
        "sources": metas,
    }
    (out / "stats.json").write_text(json.dumps(stats, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps({"ok": True, "collected": len(unique), "requested": a.limit,
                      "brands": stats["num_brands"], "out_dir": str(out)}))


if __name__ == "__main__":
    main()
