"""
FastAPI microservice that scrapes product prices using Playwright.

Launches a headless Chromium browser, renders the page (including JS),
then extracts price / title / image using per-platform logic.

Endpoints:
    POST /scrape  { "url": "...", "platform": "amazon|walmart|ebay" }
    GET  /health
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from playwright.async_api import async_playwright

from spiders.amazon import scrape_amazon
from spiders.walmart import scrape_walmart
from spiders.ebay import scrape_ebay

# Map TLD / domain suffix → locale for the browser context so the site
# serves prices in its native currency instead of converting.
DOMAIN_LOCALE = {
    "amazon.com": "en-US",
    "amazon.ca": "en-CA",
    "amazon.co.uk": "en-GB",
    "amazon.de": "de-DE",
    "amazon.fr": "fr-FR",
    "amazon.it": "it-IT",
    "amazon.es": "es-ES",
    "amazon.nl": "nl-NL",
    "amazon.co.jp": "ja-JP",
    "amazon.in": "en-IN",
    "amazon.com.br": "pt-BR",
    "amazon.com.au": "en-AU",
    "amazon.com.mx": "es-MX",
    "amazon.sg": "en-SG",
    "amazon.ae": "en-AE",
    "amazon.sa": "ar-SA",
    "amazon.pl": "pl-PL",
    "amazon.se": "sv-SE",
    "amazon.com.tr": "tr-TR",
    "amazon.eg": "ar-EG",
    "ebay.com": "en-US",
    "ebay.co.uk": "en-GB",
    "ebay.de": "de-DE",
    "ebay.fr": "fr-FR",
    "ebay.it": "it-IT",
    "ebay.es": "es-ES",
    "ebay.ca": "en-CA",
    "ebay.com.au": "en-AU",
    "walmart.com": "en-US",
    "walmart.ca": "en-CA",
}


def _locale_for_url(url: str) -> str:
    """Pick the best browser locale for the given URL."""
    try:
        host = urlparse(url).hostname or ""
        host = host.lower().removeprefix("www.")
        for domain, locale in DOMAIN_LOCALE.items():
            if host == domain or host.endswith("." + domain):
                return locale
    except Exception:
        pass
    return "en-US"


# Amazon uses the i18n-prefs cookie to lock the displayed currency.
# Without it, Amazon geo-detects the server IP and may convert to a
# foreign currency (e.g. SGD when the server is in Singapore).
DOMAIN_CURRENCY_CODE = {
    "amazon.com": "USD",
    "amazon.ca": "CAD",
    "amazon.co.uk": "GBP",
    "amazon.de": "EUR",
    "amazon.fr": "EUR",
    "amazon.it": "EUR",
    "amazon.es": "EUR",
    "amazon.nl": "EUR",
    "amazon.co.jp": "JPY",
    "amazon.in": "INR",
    "amazon.com.br": "BRL",
    "amazon.com.au": "AUD",
    "amazon.com.mx": "MXN",
    "amazon.sg": "SGD",
    "amazon.ae": "AED",
    "amazon.sa": "SAR",
    "amazon.pl": "PLN",
    "amazon.se": "SEK",
    "amazon.com.tr": "TRY",
    "amazon.eg": "EGP",
}


def _currency_cookies_for_url(url: str) -> list[dict]:
    """Return cookies to force Amazon to display prices in the native currency."""
    try:
        host = urlparse(url).hostname or ""
        host = host.lower().removeprefix("www.")
        for domain, currency in DOMAIN_CURRENCY_CODE.items():
            if host == domain or host.endswith("." + domain):
                return [
                    {
                        "name": "i18n-prefs",
                        "value": currency,
                        "domain": f".{domain}",
                        "path": "/",
                    }
                ]
    except Exception:
        pass
    return []

logger = logging.getLogger("scraper")

SCRAPERS = {
    "amazon": scrape_amazon,
    "walmart": scrape_walmart,
    "ebay": scrape_ebay,
}

# Shared browser instance
_pw = None
_browser = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pw, _browser
    _pw = await async_playwright().start()
    _browser = await _pw.chromium.launch(headless=True)
    logger.info("Playwright browser launched")
    yield
    await _browser.close()
    await _pw.stop()
    logger.info("Playwright browser closed")


app = FastAPI(title="PriceTracker Scraper", version="2.0.0", lifespan=lifespan)


class ScrapeRequest(BaseModel):
    url: str
    platform: str


class ScrapeResponse(BaseModel):
    price: float | None = None
    currency: str = "USD"
    title: str = ""
    image: str = ""
    platform: str = ""
    url: str = ""
    error: str | None = None


@app.post("/scrape", response_model=ScrapeResponse)
async def scrape(req: ScrapeRequest):
    scraper_fn = SCRAPERS.get(req.platform)
    if not scraper_fn:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported platform: {req.platform}. Supported: {list(SCRAPERS.keys())}",
        )

    context = None
    page = None
    try:
        locale = _locale_for_url(req.url)
        context = await _browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
            locale=locale,
            java_script_enabled=True,
        )

        # Inject currency cookie so Amazon shows local prices
        cookies = _currency_cookies_for_url(req.url)
        if cookies:
            await context.add_cookies(cookies)

        page = await context.new_page()

        await page.goto(req.url, wait_until="domcontentloaded", timeout=25000)
        # Wait for body to be fully populated by JS
        await page.wait_for_load_state("load", timeout=15000)
        await page.wait_for_timeout(4000)

        result = await scraper_fn(page)
        return ScrapeResponse(
            price=result.get("price"),
            currency=result.get("currency", "USD"),
            title=result.get("title", ""),
            image=result.get("image", ""),
            platform=result.get("platform", req.platform),
            url=result.get("url", req.url),
            error=result.get("error"),
        )

    except Exception as e:
        logger.error(f"Scrape failed for {req.url}: {e}")
        return ScrapeResponse(
            platform=req.platform,
            url=req.url,
            error=str(e),
        )
    finally:
        if page:
            await page.close()
        if context:
            await context.close()


@app.post("/debug")
async def debug(req: ScrapeRequest):
    """Check what price-related elements exist on the page."""
    import re as _re
    context = None
    page = None
    try:
        locale = _locale_for_url(req.url)
        context = await _browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 800},
            locale=locale,
        )

        cookies = _currency_cookies_for_url(req.url)
        if cookies:
            await context.add_cookies(cookies)

        page = await context.new_page()
        await page.goto(req.url, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_load_state("load", timeout=15000)
        await page.wait_for_timeout(4000)

        title = await page.title()

        # Check a broad set of price selectors
        selectors = [
            ".a-price .a-offscreen",
            "#priceblock_ourprice",
            "#price_inside_buybox",
            "#corePrice_feature_div .a-offscreen",
            'span[data-a-color="price"] .a-offscreen',
            ".apexPriceToPay .a-offscreen",
            "#newBuyBoxPrice .a-offscreen",
            ".a-price-whole",
            ".a-price-fraction",
            "#apex_offerDisplay_desktop",
            "#corePriceDisplay_desktop_feature_div",
            ".reinventPricePriceToPayMargin",
            "#corePrice_desktop .a-offscreen",
        ]

        found = {}
        for sel in selectors:
            els = await page.query_selector_all(sel)
            if els:
                texts = []
                for el in els[:3]:
                    t = (await el.inner_text()).strip()
                    if t:
                        texts.append(t)
                if texts:
                    found[sel] = texts

        # Also look for JSON-LD
        ld_count = len(await page.query_selector_all('script[type="application/ld+json"]'))

        # Search page text for dollar amounts
        page_text = await page.inner_text("body")
        dollar_amounts = _re.findall(r"\$[\d,]+\.?\d{0,2}", page_text[:20000])

        return {
            "title": title,
            "selectors_found": found,
            "ld_json_count": ld_count,
            "dollar_amounts_sample": dollar_amounts[:15],
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        if page:
            await page.close()
        if context:
            await context.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "scraper", "browser": _browser is not None}
