"""Shared price text parser that handles US and European number formats."""

import re


def parse_price_text(text: str) -> float | None:
    """
    Parse a price string handling both US and European formats.
    - "13,99 €"    → 13.99   (comma = decimal separator)
    - "$1,399.00"  → 1399.00 (comma = thousands separator)
    - "1.399,00 €" → 1399.00 (European thousands + decimal)
    - "21.02"      → 21.02
    """
    if not text:
        return None
    # Strip currency symbols, whitespace, and non-breaking spaces
    cleaned = re.sub(r"[^\d.,]", "", text.strip())
    if not cleaned:
        return None

    last_comma = cleaned.rfind(",")
    last_dot = cleaned.rfind(".")

    if last_comma > last_dot:
        # Comma is the decimal separator (European: "1.399,99" or "13,99")
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif last_dot > last_comma:
        # Period is the decimal separator (US: "1,399.99" or "13.99")
        cleaned = cleaned.replace(",", "")
    else:
        # Only one or neither
        if last_comma != -1 and len(cleaned) - last_comma - 1 <= 2:
            cleaned = cleaned.replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")

    match = re.search(r"\d+\.?\d*", cleaned)
    if match:
        return float(match.group())
    return None
