import { marketDataService } from '../services/marketDataService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  sanitizeSymbol,
  validateHistoryParams,
  validateRegion,
} from '../utils/validators.js';

export async function listStocks(req, res, next) {
  try {
    const region = validateRegion(req.query.region);
    const exchange = req.query.exchange ? String(req.query.exchange).trim().toUpperCase() : 'ALL';
    const sector = req.query.sector ? String(req.query.sector).trim() : 'ALL';
    const direction = req.query.direction ? String(req.query.direction).trim().toUpperCase() : 'ALL';

    const stocks = await marketDataService.listStocks({
      region,
      exchange,
      sector,
      direction,
    });

    return sendSuccess(res, {
      data: {
        stocks,
        count: stocks.length,
        dataSource: marketDataService.getProviderStatus().provider,
        dataStatus: marketDataService.getProviderStatus().dataStatus,
      },
      meta: { region, exchange, sector, direction },
    });
  } catch (error) {
    return next(error);
  }
}

export async function searchStocks(req, res, next) {
  try {
    const query = req.query.q;
    const results = await marketDataService.searchStocks(query);
    return sendSuccess(res, {
      data: {
        query: String(query).trim(),
        stocks: results,
        count: results.length,
        dataSource: marketDataService.getProviderStatus().provider,
        dataStatus: marketDataService.getProviderStatus().dataStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStockDetails(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.params.symbol);
    const stock = await marketDataService.getStockDetails(symbol);
    return sendSuccess(res, {
      data: stock,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStockHistory(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.params.symbol);
    const historyParams = validateHistoryParams({
      period: req.query.period,
      interval: req.query.interval,
      from: req.query.from,
      to: req.query.to,
    });

    const history = await marketDataService.getStockHistory(symbol, historyParams);
    return sendSuccess(res, {
      data: history,
      meta: {
        period: historyParams.period,
        interval: historyParams.interval,
      },
    });
  } catch (error) {
    return next(error);
  }
}
