const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const connectRedis = () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.warn(`Redis error: ${err.message}`));

    return redis;
  } catch (error) {
    logger.warn(`Redis unavailable, running without cache: ${error.message}`);
    return null;
  }
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
