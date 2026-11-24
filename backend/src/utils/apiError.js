export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details = null, code = 'BAD_REQUEST') {
    return new ApiError(400, code, message, details);
  }

  static notFound(message, details = null, code = 'NOT_FOUND') {
    return new ApiError(404, code, message, details);
  }

  static conflict(message, details = null, code = 'CONFLICT') {
    return new ApiError(409, code, message, details);
  }

  static tooManyRequests(message, details = null, code = 'RATE_LIMIT_EXCEEDED') {
    return new ApiError(429, code, message, details);
  }

  static badGateway(message, details = null, code = 'UPSTREAM_PROVIDER_ERROR') {
    return new ApiError(502, code, message, details);
  }

  static serviceUnavailable(message, details = null, code = 'SERVICE_UNAVAILABLE') {
    return new ApiError(503, code, message, details);
  }
}
