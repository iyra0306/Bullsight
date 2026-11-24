import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err, _req, res, _next) {
  // Handle malformed JSON bodies from express.json()
  if (err?.type === 'entity.parse.failed') {
    return sendError(res, {
      statusCode: 400,
      code: 'INVALID_JSON_BODY',
      message: 'Request body contains malformed JSON.',
    });
  }

  const statusCode = err?.statusCode || 500;
  const code = err?.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
  const message =
    statusCode === 500 && env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err?.message || 'An unexpected error occurred.';

  if (env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[BULLSIGHT API ERROR]', err);
  }

  return sendError(res, {
    statusCode,
    code,
    message,
    details: err?.details || null,
  });
}
