import { predictionService } from '../services/predictionService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { sanitizeSymbol } from '../utils/validators.js';

export async function getPredictionBySymbol(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.params.symbol);
    const horizon = req.query.horizon || '30D';
    const model = req.query.model || 'lstm-ensemble-v1';

    const result = await predictionService.getPrediction(symbol, horizon, model);
    return sendSuccess(res, { data: result });
  } catch (error) {
    return next(error);
  }
}

export async function createPrediction(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.body?.symbol);
    const horizon = req.body?.horizon || '30D';
    const model = req.body?.model || 'lstm-ensemble-v1';

    const result = await predictionService.createPrediction({ symbol, horizon, model });
    return sendSuccess(res, { data: result, statusCode: 201 });
  } catch (error) {
    return next(error);
  }
}

export async function getPredictionHistory(req, res, next) {
  try {
    const symbol = sanitizeSymbol(req.params.symbol);
    const result = await predictionService.getPredictionHistory(symbol);
    return sendSuccess(res, { data: result });
  } catch (error) {
    return next(error);
  }
}
