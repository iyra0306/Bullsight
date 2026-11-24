import { ApiError } from './apiError.js';

export const SUPPORTED_PERIODS = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];
export const SUPPORTED_INTERVALS = ['1m', '5m', '15m', '1h', '1d', '1wk', '1mo'];
export const SUPPORTED_REGIONS = ['ALL', 'IN', 'US'];
export const SUPPORTED_HORIZONS = ['7D', '14D', '30D', '90D'];

export function sanitizeSymbol(rawSymbol) {
  if (typeof rawSymbol !== 'string') {
    throw ApiError.badRequest('Stock symbol must be a non-empty string.', null, 'INVALID_SYMBOL');
  }
  const normalized = rawSymbol.trim().toUpperCase();
  if (!/^[A-Z0-9.-]{1,16}$/.test(normalized)) {
    throw ApiError.badRequest(
      `Invalid stock symbol "${rawSymbol}". Symbols must be 1-16 alphanumeric characters.`,
      { allowedPattern: '^[A-Z0-9.-]{1,16}$' },
      'INVALID_SYMBOL'
    );
  }
  return normalized;
}

export function validateRegion(rawRegion) {
  if (rawRegion === undefined || rawRegion === '') return 'ALL';
  if (typeof rawRegion !== 'string') {
    throw ApiError.badRequest('Region parameter must be a string.', null, 'INVALID_REGION');
  }
  const upper = rawRegion.trim().toUpperCase();
  if (!SUPPORTED_REGIONS.includes(upper)) {
    throw ApiError.badRequest(
      `Unsupported region "${rawRegion}".`,
      { supportedRegions: SUPPORTED_REGIONS },
      'INVALID_REGION'
    );
  }
  return upper;
}

export function validateHistoryParams({ period, interval, from, to }) {
  const normalizedPeriod = period === undefined || period === '' ? '3M' : String(period).trim().toUpperCase();
  if (!SUPPORTED_PERIODS.includes(normalizedPeriod)) {
    throw ApiError.badRequest(
      `Unsupported period "${period}".`,
      { supportedPeriods: SUPPORTED_PERIODS },
      'INVALID_PERIOD'
    );
  }

  const normalizedInterval = interval === undefined || interval === '' ? undefined : String(interval).trim();
  if (normalizedInterval !== undefined && !SUPPORTED_INTERVALS.includes(normalizedInterval)) {
    throw ApiError.badRequest(
      `Unsupported interval "${interval}".`,
      { supportedIntervals: SUPPORTED_INTERVALS },
      'INVALID_INTERVAL'
    );
  }

  let fromDate = null;
  let toDate = null;

  if (from !== undefined && from !== '') {
    if (typeof from !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(from.trim())) {
      throw ApiError.badRequest('Query parameter "from" must be in YYYY-MM-DD format.', null, 'INVALID_DATE_RANGE');
    }
    fromDate = new Date(`${from.trim()}T00:00:00Z`);
    if (Number.isNaN(fromDate.getTime())) {
      throw ApiError.badRequest('Invalid "from" calendar date.', null, 'INVALID_DATE_RANGE');
    }
  }

  if (to !== undefined && to !== '') {
    if (typeof to !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(to.trim())) {
      throw ApiError.badRequest('Query parameter "to" must be in YYYY-MM-DD format.', null, 'INVALID_DATE_RANGE');
    }
    toDate = new Date(`${to.trim()}T23:59:59Z`);
    if (Number.isNaN(toDate.getTime())) {
      throw ApiError.badRequest('Invalid "to" calendar date.', null, 'INVALID_DATE_RANGE');
    }
  }

  if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
    throw ApiError.badRequest('"from" date cannot be later than "to" date.', null, 'INVALID_DATE_RANGE');
  }

  return {
    period: normalizedPeriod,
    interval: normalizedInterval || (normalizedPeriod === '1D' ? '15m' : normalizedPeriod === '1W' ? '1h' : '1d'),
    fromDate,
    toDate,
  };
}

export function validatePositiveInt(value, fallback, min = 1, max = 100, fieldName = 'limit') {
  if (value === undefined || value === '') return fallback;
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) {
    throw ApiError.badRequest(
      `Query parameter "${fieldName}" must be an integer between ${min} and ${max}.`,
      null,
      'INVALID_PAGINATION'
    );
  }
  return num;
}
