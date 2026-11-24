import { ApiError } from '../utils/apiError.js';

export function notFound(req, _res, next) {
  next(
    ApiError.notFound(
      `Route ${req.method} ${req.originalUrl} was not found on BULLSIGHT API.`,
      { method: req.method, path: req.originalUrl },
      'ROUTE_NOT_FOUND'
    )
  );
}
