"""eBay price extractor using Playwright page."""

import re
import json
from .currency import detect_currency
from .price_parser import parse_price_text


async def scrape_ebay(page):
    url = page.url
    result = {"price": None, "currency": "USD", "title": "", "image": "", "platform": "ebay", "url": url}
    raw_price_text = ""

    # --- Extract title/image/fallback price from JSON-LD ---
    ld_price = None
    ld_currency = None
    ld_scripts = await page.query_selector_all('script[type="application/ld+json"]')
    for script in ld_scripts:
        try:
            raw = await script.inner_text()
            data = json.loads(raw)
            if isinstance(data, list):
                data = data[0]
            if data.get("@type") == "Product":
                result["title"] = data.get("name", "")
                img = data.get("image")
                if isinstance(img, list):
                    result["image"] = img[0] if img else ""
                elif isinstance(img, str):
                    result["image"] = img
                offers = data.get("offers", {})
                if isinstance(offers, list):
                    offers = offers[0]
                price_val = offers.get("price")
                if price_val is not None:
                    ld_price = float(price_val)
                    ld_currency = offers.get("priceCurrency")
        except (json.JSONDecodeError, ValueError, TypeError):
            continue

    # --- CSS selectors: find the actual displayed price ---
    price_selectors = [
        ".x-price-primary .ux-textspans",
        "#prcIsum",
        '[itemprop="price"]',
        ".x-bin-price__content .ux-textspans",
    ]

    for sel in price_selectors:
        el = await page.query_selector(sel)
        if el:
            content = await el.get_attribute("content")
            text = content or await el.inner_text()
            if text:
                raw_price_text = text.strip()
                parsed = parse_price_text(text)
                if parsed is not None:
                    result["price"] = parsed
                    break

    # Title
    title_el = await page.query_selector("h1.x-item-title__mainTitle .ux-textspans, h1#itemTitle")
    if title_el:
        result["title"] = (await title_el.inner_text()).strip()

    # Image
    img_el = await page.query_selector(".ux-image-carousel-item img, #icImg")
    if img_el:
        result["image"] = await img_el.get_attribute("src") or ""

    # --- Last resort: extract first price amount from visible price area ---
    if result["price"] is None:
        try:
            price_areas = [".x-price-primary", ".x-bin-price__content", "#mainContent"]
            for area_sel in price_areas:
                area = await page.query_selector(area_sel)
                if area:
                    area_text = await area.inner_text()
                    amounts = re.findall(r"[£€$¥₹][\d.,]+|[\d.,]+\s?[€£]", area_text)
                    if amounts:
                        raw_price_text = amounts[0]
                        parsed = parse_price_text(amounts[0])
                        if parsed is not None:
                            result["price"] = parsed
                            break
        except Exception:
            pass

    # --- Last resort: use JSON-LD price ---
    if result["price"] is None and ld_price is not None:
        result["price"] = ld_price
        if ld_currency:
            result["currency"] = ld_currency
    else:
        result["currency"] = detect_currency(url, raw_price_text)

    if result["price"] is None:
        result["error"] = "Could not extract price — page layout may have changed."

    return result
