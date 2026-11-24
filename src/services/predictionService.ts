import { apiClient } from './apiClient';
import { ForecastHorizon } from '../types/market';

export interface BackendPredictionResponse {
  symbol: string;
  horizon: ForecastHorizon;
  modelName: string;
  forecastTimestamps: string[];
  predictedPrices: number[];
  evaluationMetrics: {
    mae?: number;
    rmse?: number;
    directionalAccuracy?: number;
  } | null;
  predictionStatus: string;
  dataSource: string;
}

export interface BackendPredictionHistoryResponse {
  symbol: string;
  history: Array<{
    id: string;
    date: string;
    horizon: ForecastHorizon;
    projectedPrice: number;
    actualPrice: number;
    variancePercent: number;
    outcome: string;
  }>;
  predictionStatus: string;
  dataSource: string;
}

export const predictionService = {
  fetchPrediction(
    symbol: string,
    horizon: ForecastHorizon = '30D',
    model = 'lstm-ensemble-v1',
    signal?: AbortSignal
  ): Promise<BackendPredictionResponse> {
    return apiClient.get<BackendPredictionResponse>(
      `/predictions/${encodeURIComponent(symbol)}`,
      { horizon, model },
      signal
    );
  },

  requestPrediction(
    payload: { symbol: string; horizon?: ForecastHorizon; model?: string },
    signal?: AbortSignal
  ): Promise<BackendPredictionResponse> {
    return apiClient.post<BackendPredictionResponse>('/predictions', payload, signal);
  },

  fetchPredictionHistory(
    symbol: string,
    signal?: AbortSignal
  ): Promise<BackendPredictionHistoryResponse> {
    return apiClient.get<BackendPredictionHistoryResponse>(
      `/predictions/${encodeURIComponent(symbol)}/history`,
      undefined,
      signal
    );
  },
};
