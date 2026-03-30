const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Scraper client — calls the Python Scrapy microservice.
 * The Python service runs at SCRAPER_SERVICE_URL (default http://localhost:8000).
 */

const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8000';

const scrapePriceFromUrl = async (url, platform) => {
  try {
    const { data } = await axios.post(
      `${SCRAPER_URL}/scrape`,
      { url, platform },
      { timeout: 35000 }
    );

    if (data.error) {
      logger.warn(`Scraper returned error for ${platform} (${url}): ${data.error}`);
      return null;
    }

    if (data.price !== null && data.price !== undefined) {
      logger.info(`Scraped ${platform}: ${data.price} ${data.currency || 'USD'} from ${url}`);
    }

    return {
      price: data.price ?? null,
      currency: data.currency || 'USD',
      title: data.title || '',
      image: data.image || '',
      platform: data.platform || platform,
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logger.warn(`Scraper service not available at ${SCRAPER_URL} — is it running?`);
    } else {
      logger.error(`Scraper request failed for ${url}: ${error.message}`);
    }
    return null;
  }
};

module.exports = { scrapePriceFromUrl };
