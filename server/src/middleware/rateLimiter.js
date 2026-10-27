const rateLimit = require('express-rate-limit');

// General API Rate Limiter: 300 requests per 5 minutes
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    detail: 'Too many requests from this IP. Please try again after a few minutes.'
  }
});

// Strict Limiter for Resource-Intensive Operations (e.g. Model Training, AI Chat): 60 per minute
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    detail: 'Rate limit reached for computational AI tasks. Please pace your requests.'
  }
});

module.exports = { apiLimiter, strictLimiter };
