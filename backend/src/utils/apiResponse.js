export function sendSuccess(res, { data, meta = {}, statusCode = 200 }) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function sendError(res, { statusCode = 500, code = 'INTERNAL_ERROR', message, details = null }) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  });
}
