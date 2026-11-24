import { ApiError } from '../utils/apiError.js';

export function requireJsonObjectBody(req, _res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(
      ApiError.badRequest(
        'Request body must be a valid JSON object.',
        null,
        'INVALID_REQUEST_BODY'
      )
    );
  }
  return next();
}
