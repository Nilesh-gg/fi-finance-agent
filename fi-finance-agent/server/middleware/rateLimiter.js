const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');

// Create rate limiter for general API requests
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'general_api',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900, // Per 15 minutes (900 seconds)
  blockDuration: 900, // Block for 15 minutes if limit exceeded
});

// Create rate limiter for chat/AI requests (more restrictive)
const chatRateLimiter = new RateLimiterMemory({
  keyPrefix: 'chat_api',
  points: 20, // 20 requests
  duration: 900, // Per 15 minutes
  blockDuration: 1800, // Block for 30 minutes if limit exceeded
});

// Create rate limiter for authentication requests
const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth_api',
  points: 10, // 10 requests
  duration: 900, // Per 15 minutes
  blockDuration: 3600, // Block for 1 hour if limit exceeded
});

/**
 * General rate limiter middleware
 */
async function rateLimiterMiddleware(req, res, next) {
  try {
    // Use IP address as key, but also consider user ID if available
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
    
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: secs
    });
  }
}

/**
 * Chat-specific rate limiter middleware
 */
async function chatRateLimiterMiddleware(req, res, next) {
  try {
    // Use user ID if available, otherwise fall back to IP
    const key = req.user?.uid || req.ip || 'unknown';
    
    await chatRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn(`Chat rate limit exceeded for ${req.user?.uid || req.ip} on ${req.path}`);
    
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    
    res.status(429).json({
      error: 'Chat Rate Limit Exceeded',
      message: 'You have exceeded the chat request limit. Please wait before sending another message.',
      retryAfter: secs
    });
  }
}

/**
 * Authentication-specific rate limiter middleware
 */
async function authRateLimiterMiddleware(req, res, next) {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    logger.warn(`Auth rate limit exceeded for ${req.ip} on ${req.path}`);
    
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    
    res.status(429).json({
      error: 'Authentication Rate Limit Exceeded',
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: secs
    });
  }
}

/**
 * Create a custom rate limiter for specific endpoints
 */
function createCustomRateLimiter(options) {
  const limiter = new RateLimiterMemory({
    keyPrefix: options.keyPrefix || 'custom',
    points: options.points || 60,
    duration: options.duration || 900,
    blockDuration: options.blockDuration || 900,
  });

  return async (req, res, next) => {
    try {
      const key = req.user?.uid || req.ip || 'unknown';
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      logger.warn(`Custom rate limit exceeded for ${req.user?.uid || req.ip} on ${req.path}`);
      
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      
      res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: options.message || 'Request limit exceeded. Please try again later.',
        retryAfter: secs
      });
    }
  };
}

module.exports = {
  rateLimiter: rateLimiterMiddleware,
  chatRateLimiter: chatRateLimiterMiddleware,
  authRateLimiter: authRateLimiterMiddleware,
  createCustomRateLimiter
};
