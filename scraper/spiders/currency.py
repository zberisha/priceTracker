"""
Currency detection based on URL domain and price text symbols.
"""

import re
from urllib.parse import urlparse

# Domain → currency mapping
DOMAIN_CURRENCY = {
    # Amazon
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
    # eBay
    "ebay.com": "USD",
    "ebay.co.uk": "GBP",
    "ebay.de": "EUR",
    "ebay.fr": "EUR",
    "ebay.it": "EUR",
    "ebay.es": "EUR",
    "ebay.ca": "CAD",
    "ebay.com.au": "AUD",
    "ebay.co.jp": "JPY",
    "ebay.in": "INR",
    # Walmart
    "walmart.com": "USD",
    "walmart.ca": "CAD",
    "walmart.com.mx": "MXN",
}

# Symbol → currency (order matters: longer prefixes first)
SYMBOL_CURRENCY = [
    ("CA$", "CAD"),
    ("C$", "CAD"),
    ("AU$", "AUD"),
    ("A$", "AUD"),
    ("R$", "BRL"),
    ("NZ$", "NZD"),
    ("S$", "SGD"),
    ("HK$", "HKD"),
    ("MX$", "MXN"),
    ("£", "GBP"),
    ("€", "EUR"),
    ("¥", "JPY"),
    ("₹", "INR"),
    ("₺", "TRY"),
    ("zł", "PLN"),
    ("kr", "SEK"),  # also DKK/NOK — domain is more reliable
    ("$", "USD"),   # fallback for bare $
]


def detect_currency_from_url(url: str) -> str | None:
    """Detect currency from the URL domain."""
    try:
        host = urlparse(url).hostname or ""
        host = host.lower().removeprefix("www.")
        # Try exact match first, then strip subdomains
        for domain, currency in DOMAIN_CURRENCY.items():
            if host == domain or host.endswith("." + domain):
                return currency
    except Exception:
        pass
    return None


def detect_currency_from_symbol(price_text: str) -> str:
    """Detect currency from a price string like '$29.99', '€15.00', '£9.99'."""
    text = price_text.strip()
    for symbol, currency in SYMBOL_CURRENCY:
        if symbol in text:
            return currency
    return "USD"


def detect_currency(url: str, price_text: str = "") -> str:
    """
    Best-effort currency detection.
    1. URL domain (most reliable)
    2. Symbol in price text
    3. Default to USD
    """
    from_url = detect_currency_from_url(url)
    if from_url:
        return from_url

    if price_text:
        return detect_currency_from_symbol(price_text)

    return "USD"
