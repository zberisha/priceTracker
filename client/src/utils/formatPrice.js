/**
 * Map currency codes to a representative locale so numbers and symbols
 * render in the conventional format for that currency.
 */
const CURRENCY_LOCALE = {
  USD: 'en-US',
  CAD: 'en-CA',
  GBP: 'en-GB',
  EUR: 'fr-FR',
  JPY: 'ja-JP',
  INR: 'en-IN',
  BRL: 'pt-BR',
  AUD: 'en-AU',
  MXN: 'es-MX',
  SGD: 'en-SG',
  AED: 'ar-AE',
  SAR: 'ar-SA',
  PLN: 'pl-PL',
  SEK: 'sv-SE',
  TRY: 'tr-TR',
  EGP: 'ar-EG',
  NZD: 'en-NZ',
  HKD: 'zh-HK',
  CNY: 'zh-CN',
};

function localeFor(currency) {
  return CURRENCY_LOCALE[currency] || 'en-US';
}

/**
 * Format a numeric price with the correct currency symbol using Intl.NumberFormat.
 *
 * Uses a locale appropriate for the currency so symbols and formatting
 * match the convention (e.g. EUR → "14,99 €", GBP → "£29.99", JPY → "¥3,499").
 *
 * @param {number} amount - The price value.
 * @param {string} [currency='USD'] - ISO 4217 currency code.
 * @returns {string} Formatted price string.
 */
export function formatPrice(amount, currency = 'USD') {
  if (amount == null || isNaN(amount)) return formatPrice(0, currency);

  try {
    return new Intl.NumberFormat(localeFor(currency), {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback for unknown currency codes
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Return just the currency symbol for a given code.
 * @param {string} [currency='USD']
 * @returns {string} e.g. "$", "£", "€"
 */
export function currencySymbol(currency = 'USD') {
  try {
    return new Intl.NumberFormat(localeFor(currency), {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace(/[\d.,\s\u00A0]/g, '')
      .trim();
  } catch {
    return currency;
  }
}
