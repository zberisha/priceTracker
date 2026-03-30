"""Amazon price extractor using Playwright page."""

import re
import json
from .currency import detect_currency
from .price_parser import parse_price_text


async def scrape_amazon(page):
    url = page.url
    result = {"price": None, "currency": "USD", "title": "", "image": "", "platform": "amazon", "url": url}
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

    # --- CSS selectors: find the actual displayed price for the selected variant ---
    price_selectors = [
        ".a-price .a-offscreen",
        "#priceblock_ourprice",
        "#price_inside_buybox",
        "#corePrice_feature_div .a-offscreen",
        'span[data-a-color="price"] .a-offscreen',
        ".apexPriceToPay .a-offscreen",
        "#newBuyBoxPrice .a-offscreen",
        ".reinventPricePriceToPayMargin .a-offscreen",
        "#corePrice_desktop .a-offscreen",
        "#apex_offerDisplay_desktop .a-offscreen",
    ]

    for sel in price_selectors:
        el = await page.query_selector(sel)
        if el:
            text = await el.inner_text()
            if text:
                raw_price_text = text.strip()
                parsed = parse_price_text(text)
                if parsed is not None:
                    result["price"] = parsed
                    break

    # --- JS fallback: find price from the DOM ---
    if result["price"] is None:
        price_via_js = await page.evaluate("""() => {
            const priceEls = document.querySelectorAll('.a-price:not([data-a-strike]) .a-offscreen');
            for (const el of priceEls) {
                const t = el.textContent.trim();
                if (t) return t;
            }
            const whole = document.querySelector('.a-price-whole');
            const frac = document.querySelector('.a-price-fraction');
            if (whole) {
                const w = whole.textContent.replace(/[^0-9]/g, '');
                const f = frac ? frac.textContent.replace(/[^0-9]/g, '') : '00';
                if (w) return w + '.' + f;
            }
            return null;
        }""")
        if price_via_js:
            raw_price_text = price_via_js.strip()
            parsed = parse_price_text(price_via_js)
            if parsed is not None:
                result["price"] = parsed

    # --- JS tree walker fallback ---
    if result["price"] is None:
        price_via_js2 = await page.evaluate("""() => {
            const walker = document.createTreeWalker(
                document.body, NodeFilter.SHOW_TEXT, null, false
            );
            const priceRe = /^[£€$¥₹₺]?\\s?[\\d.,]+\\s?[£€$¥₹₺]?$/;
            const prices = [];
            while (walker.nextNode()) {
                const text = walker.currentNode.textContent.trim();
                if (priceRe.test(text) && text.length < 20) {
                    prices.push(text);
                }
            }
            return prices.length > 0 ? prices[0] : null;
        }""")
        if price_via_js2:
            raw_price_text = price_via_js2.strip()
            parsed = parse_price_text(price_via_js2)
            if parsed is not None:
                result["price"] = parsed

    # --- Absolute fallback: scan full visible text ---
    if result["price"] is None:
        try:
            body_text = await page.inner_text("body")
            amounts = re.findall(r"[£€$¥₹₺][\d.,]+|[\d.,]+\s?[€£]", body_text[:15000])
            if amounts:
                raw_price_text = amounts[0]
                parsed = parse_price_text(amounts[0])
                if parsed is not None:
                    result["price"] = parsed
        except Exception:
            pass

    # --- Last resort: use JSON-LD price ---
    if result["price"] is None and ld_price is not None:
        result["price"] = ld_price
        if ld_currency:
            result["currency"] = ld_currency
    else:
        # Detect currency from URL domain + raw price text
        result["currency"] = detect_currency(url, raw_price_text)

    # Title (override JSON-LD with on-page title if available)
    title_el = await page.query_selector("#productTitle")
    if title_el:
        result["title"] = (await title_el.inner_text()).strip()

    # Image
    img_el = await page.query_selector("#landingImage")
    if img_el:
        result["image"] = await img_el.get_attribute("src") or ""

    if result["price"] is None:
        result["error"] = "Could not extract price — page may have CAPTCHA or layout changed."

    return result
