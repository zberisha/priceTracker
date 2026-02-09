const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;
let redisAvailable = false;

const connectRedis = () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis unavailable after 3 retries, running without cache.');
          return null; // stop retrying
        }
        return Math.min(times * 200, 1000);
      },
    });

    redis.on('connect', () => {
      redisAvailable = true;
      logger.info('Redis connected');
    });
    redis.on('close', () => {
      redisAvailable = false;
    });
    redis.on('error', (err) => {
      redisAvailable = false;
      logger.warn(`Redis error: ${err.message}`);
    });

    redis.connect().catch(() => {
      redisAvailable = false;
      logger.warn('Redis not available, running without cache.');
    });

    return redis;
  } catch (error) {
    logger.warn(`Redis init failed, running without cache: ${error.message}`);
    return null;
  }
};

const getRedis = () => (redisAvailable ? redis : null);

module.exports = { connectRedis, getRedis };
