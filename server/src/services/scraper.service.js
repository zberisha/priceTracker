const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

/**
 * Web scraping service for extracting prices from e-commerce platforms.
 * Each platform has its own scraping strategy. In production, replace
 * selectors / use official APIs where available.
 */

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const fetchPage = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      timeout: 15000,
    });
    return data;
  } catch (error) {
    logger.error(`Failed to fetch ${url}: ${error.message}`);
    return null;
  }
};

// --------------- Platform-specific scrapers ---------------

const scrapeAmazon = async (url) => {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const priceWhole = $('#priceblock_ourprice, .a-price .a-offscreen, #price_inside_buybox').first().text();
  const price = parseFloat(priceWhole.replace(/[^0-9.]/g, ''));
  const title = $('#productTitle').text().trim();
  const image = $('#landingImage').attr('src') || '';

  return { price: isNaN(price) ? null : price, title, image, platform: 'amazon' };
};

const scrapeWalmart = async (url) => {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const priceText = $('[itemprop="price"], .price-characteristic').first().attr('content') ||
    $('[data-automation="buybox-price"]').first().text();
  const price = parseFloat(String(priceText).replace(/[^0-9.]/g, ''));
  const title = $('h1[itemprop="name"], h1.prod-ProductTitle').first().text().trim();
  const image = $('img.prod-hero-image, [data-testid="hero-image"] img').first().attr('src') || '';

  return { price: isNaN(price) ? null : price, title, image, platform: 'walmart' };
};

const scrapeEbay = async (url) => {
  const html = await fetchPage(url);
  if (!html) return null;

  const $ = cheerio.load(html);
  const priceText = $('.x-price-primary .ux-textspans').first().text();
  const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
  const title = $('h1.x-item-title__mainTitle .ux-textspans').first().text().trim();
  const image = $('img.ux-image-carousel-item').first().attr('src') || '';

  return { price: isNaN(price) ? null : price, title, image, platform: 'ebay' };
};

// --------------- Main scrape function ---------------

const scrapePriceFromUrl = async (url, platform) => {
  const scrapers = { amazon: scrapeAmazon, walmart: scrapeWalmart, ebay: scrapeEbay };
  const scraper = scrapers[platform];

  if (!scraper) {
    logger.warn(`No scraper implemented for platform: ${platform}`);
    return null;
  }

  try {
    const result = await scraper(url);
    if (result && result.price !== null) {
      logger.info(`Scraped ${platform}: $${result.price} from ${url}`);
    }
    return result;
  } catch (error) {
    logger.error(`Scraping error for ${url}: ${error.message}`);
    return null;
  }
};

module.exports = { scrapePriceFromUrl };
