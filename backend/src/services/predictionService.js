import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { SUPPORTED_HORIZONS } from '../utils/validators.js';
import { marketDataService } from './marketDataService.js';

const SUPPORTED_MODELS = ['lstm-ensemble-v1', 'xgboost-quant-v1', 'transformer-ts-v1'];

function buildUnavailableError(symbol, horizon, modelName, reason) {
  return ApiError.serviceUnavailable(
    'Python AI/ML prediction service is not connected or currently unavailable. No trained model inference was executed.',
    {
      symbol,
      horizon,
      modelName,
      predictionStatus: 'unavailable',
      dataSource: 'python-ml-service',
      reason,
      expectedResponseContract: {
        symbol,
        horizon,
        modelName,
        predictionStatus: 'completed',
        dataSource: 'python-fastapi-ml-service',
        forecastTimestamps: ['YYYY-MM-DD'],
        predictedPrices: ['number'],
        evaluationMetrics: {
          mae: 'number',
          rmse: 'number',
          directionalAccuracy: 'number',
        },
      },
    },
    'AI_SERVICE_UNAVAILABLE'
  );
}

export const predictionService = {
  getServiceStatus() {
    return {
      configured: Boolean(env.PYTHON_AI_SERVICE_URL),
      status: env.PYTHON_AI_SERVICE_URL ? 'configured' : 'not-configured',
      supportedModels: SUPPORTED_MODELS,
      supportedHorizons: SUPPORTED_HORIZONS,
    };
  },

  validateRequestParams({ symbol, horizon = '30D', model = 'lstm-ensemble-v1' }) {
    const normHorizon = String(horizon).trim().toUpperCase();
    if (!SUPPORTED_HORIZONS.includes(normHorizon)) {
      throw ApiError.badRequest(
        `Unsupported forecast horizon "${horizon}".`,
        { supportedHorizons: SUPPORTED_HORIZONS },
        'INVALID_FORECAST_HORIZON'
      );
    }

    const normModel = String(model).trim();
    if (!SUPPORTED_MODELS.includes(normModel)) {
      throw ApiError.badRequest(
        `Unsupported model selection "${model}".`,
        { supportedModels: SUPPORTED_MODELS },
        'INVALID_MODEL_SELECTION'
      );
    }

    return { symbol, horizon: normHorizon, modelName: normModel };
  },

  async getPrediction(symbol, horizon = '30D', model = 'lstm-ensemble-v1') {
    const quote = await marketDataService.getStockDetails(symbol);
    const validated = this.validateRequestParams({
      symbol: quote.symbol,
      horizon,
      model,
    });

    if (!env.PYTHON_AI_SERVICE_URL) {
      throw buildUnavailableError(
        validated.symbol,
        validated.horizon,
        validated.modelName,
        'PYTHON_AI_SERVICE_URL environment variable is not configured.'
      );
    }

    try {
      const response = await axios.get(
        `${env.PYTHON_AI_SERVICE_URL}/predict/${encodeURIComponent(validated.symbol)}`,
        {
          params: {
            horizon: validated.horizon,
            model: validated.modelName,
          },
          timeout: 8000,
        }
      );

      return {
        symbol: validated.symbol,
        horizon: validated.horizon,
        modelName: response.data?.modelName || validated.modelName,
        forecastTimestamps: response.data?.forecastTimestamps || [],
        predictedPrices: response.data?.predictedPrices || [],
        evaluationMetrics: response.data?.evaluationMetrics || null,
        predictionStatus: response.data?.predictionStatus || 'completed',
        dataSource: 'python-fastapi-ml-service',
      };
    } catch (error) {
      throw buildUnavailableError(
        validated.symbol,
        validated.horizon,
        validated.modelName,
        error?.message || 'Python FastAPI service failed to respond.'
      );
    }
  },

  async createPrediction({ symbol, horizon = '30D', model = 'lstm-ensemble-v1' }) {
    const quote = await marketDataService.getStockDetails(symbol);
    const validated = this.validateRequestParams({
      symbol: quote.symbol,
      horizon,
      model,
    });

    if (!env.PYTHON_AI_SERVICE_URL) {
      throw buildUnavailableError(
        validated.symbol,
        validated.horizon,
        validated.modelName,
        'PYTHON_AI_SERVICE_URL environment variable is not configured.'
      );
    }

    try {
      const response = await axios.post(
        `${env.PYTHON_AI_SERVICE_URL}/predict`,
        {
          symbol: validated.symbol,
          horizon: validated.horizon,
          model: validated.modelName,
        },
        { timeout: 10000 }
      );

      return {
        symbol: validated.symbol,
        horizon: validated.horizon,
        modelName: response.data?.modelName || validated.modelName,
        forecastTimestamps: response.data?.forecastTimestamps || [],
        predictedPrices: response.data?.predictedPrices || [],
        evaluationMetrics: response.data?.evaluationMetrics || null,
        predictionStatus: response.data?.predictionStatus || 'completed',
        dataSource: 'python-fastapi-ml-service',
      };
    } catch (error) {
      throw buildUnavailableError(
        validated.symbol,
        validated.horizon,
        validated.modelName,
        error?.message || 'Python FastAPI service failed to respond.'
      );
    }
  },

  async getPredictionHistory(symbol) {
    const quote = await marketDataService.getStockDetails(symbol);

    if (!env.PYTHON_AI_SERVICE_URL) {
      throw buildUnavailableError(
        quote.symbol,
        '30D',
        SUPPORTED_MODELS[0],
        'PYTHON_AI_SERVICE_URL environment variable is not configured.'
      );
    }

    try {
      const response = await axios.get(
        `${env.PYTHON_AI_SERVICE_URL}/predictions/${encodeURIComponent(quote.symbol)}/history`,
        { timeout: 8000 }
      );
      return {
        symbol: quote.symbol,
        history: response.data?.history || [],
        predictionStatus: 'completed',
        dataSource: 'python-fastapi-ml-service',
      };
    } catch (error) {
      throw buildUnavailableError(
        quote.symbol,
        '30D',
        SUPPORTED_MODELS[0],
        error?.message || 'Python FastAPI service failed to respond.'
      );
    }
  },
};
