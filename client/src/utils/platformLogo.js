/**
 * Returns a favicon/logo URL for a given platform.
 */
const LOGOS = {
  amazon: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',
  walmart: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=32',
  ebay: 'https://www.google.com/s2/favicons?domain=ebay.com&sz=32',
  other: 'https://www.google.com/s2/favicons?domain=google.com&sz=32',
};

export function platformLogo(platform) {
  return LOGOS[platform] || LOGOS.other;
}
