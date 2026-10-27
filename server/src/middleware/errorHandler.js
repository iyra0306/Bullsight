/**
 * Centralized Enterprise Error Handling Middleware for Express.js
 * Prevents information leakage while providing structured JSON error diagnostics.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[Error] [${req.method}] ${req.originalUrl}:`, err.message || err);

  const errorResponse = {
    success: false,
    detail: err.message || 'An internal server error occurred.',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  };

  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Route Not Found Handler
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    detail: `Route ${req.method} ${req.originalUrl} not found on BullSight Gateway.`,
    timestamp: new Date().toISOString()
  });
}

module.exports = { errorHandler, notFoundHandler };
