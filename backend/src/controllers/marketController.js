import { marketDataService } from '../services/marketDataService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  SUPPORTED_PERIODS,
  validatePositiveInt,
  validateRegion,
} from '../utils/validators.js';
import { ApiError } from '../utils/apiError.js';

export async function getMarketOverview(req, res, next) {
  try {
    const region = validateRegion(req.query.region);
    const rawPeriod = req.query.period ? String(req.query.period).trim().toUpperCase() : '3M';
    if (!SUPPORTED_PERIODS.includes(rawPeriod)) {
      throw ApiError.badRequest(
        `Unsupported period "${req.query.period}".`,
        { supportedPeriods: SUPPORTED_PERIODS },
        'INVALID_PERIOD'
      );
    }

    const overview = await marketDataService.getMarketOverview(region, rawPeriod);
    return sendSuccess(res, {
      data: overview,
      meta: { region, period: rawPeriod },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMarketMovers(req, res, next) {
  try {
    const region = validateRegion(req.query.region);
    const limit = validatePositiveInt(req.query.limit, 4, 1, 20, 'limit');
    const movers = await marketDataService.getMarketMovers(region, limit);
    return sendSuccess(res, {
      data: movers,
      meta: { region, limit },
    });
  } catch (error) {
    return next(error);
  }
}
