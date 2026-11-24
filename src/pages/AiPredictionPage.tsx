import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, RefreshCw, ServerCrash } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { SAMPLE_STOCKS } from '../services/marketService';
import { stockService } from '../services/stockService';
import { predictionService, BackendPredictionResponse } from '../services/predictionService';
import { ApiClientError } from '../services/apiClient';
import { aiService } from '../services/aiService';
import { ForecastHorizon, OhlcBar, StockQuote } from '../types/market';
import { ChartContainer } from '../components/ChartContainer';
import { PredictionCard } from '../components/PredictionCard';
import { NeuralNetworkCanvas } from '../components/NeuralNetworkCanvas';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { formatCurrency } from '../utils/formatters';

const HORIZONS: ForecastHorizon[] = ['7D', '14D', '30D', '90D'];

export const AiPredictionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useApp();

  const initialSymbol = (searchParams.get('symbol') || 'NVDA').toUpperCase();
  const [symbol, setSymbol] = useState(initialSymbol);
  const [horizon, setHorizon] = useState<ForecastHorizon>('30D');
  const [selectedScenario, setSelectedScenario] = useState<'Bullish' | 'Neutral' | 'Bearish'>('Bullish');
  const [showDesignPreview, setShowDesignPreview] = useState(true);

  const [stockList, setStockList] = useState<StockQuote[]>(SAMPLE_STOCKS);
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [historyBars, setHistoryBars] = useState<OhlcBar[]>([]);
  const [backendPrediction, setBackendPrediction] = useState<BackendPredictionResponse | null>(null);
  const [serviceNotice, setServiceNotice] = useState<{
    status?: number;
    code?: string;
    message: string;
    reason?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    stockService
      .fetchStocks(undefined, controller.signal)
      .then((res) => {
        if (res.stocks?.length) setStockList(res.stocks);
      })
      .catch(() => {
        // Keep default list if stocks call fails
      });
    return () => controller.abort();
  }, []);

  const loadPredictionContext = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setServiceNotice(null);
    setBackendPrediction(null);

    try {
      const [quoteRes, historyRes] = await Promise.all([
        stockService.fetchStockBySymbol(symbol, signal),
        stockService.fetchStockHistory(symbol, { period: '3M' }, signal),
      ]);
      setStock(quoteRes);
      setHistoryBars((historyRes.bars || []).slice(-35));
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      setServiceNotice({
        status: err instanceof ApiClientError ? err.status : undefined,
        code: err instanceof ApiClientError ? err.code : 'MARKET_FETCH_FAILED',
        message: err instanceof Error ? err.message : 'Unable to load symbol quote/history.',
      });
    }

    try {
      const pred = await predictionService.fetchPrediction(symbol, horizon, 'lstm-ensemble-v1', signal);
      setBackendPrediction(pred);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      const details =
        err instanceof ApiClientError && err.details && typeof err.details === 'object'
          ? (err.details as { reason?: string })
          : null;
      setServiceNotice({
        status: err instanceof ApiClientError ? err.status : 503,
        code: err instanceof ApiClientError ? err.code : 'AI_SERVICE_UNAVAILABLE',
        message:
          err instanceof Error
            ? err.message
            : 'Python AI/ML prediction service is not connected.',
        reason: details?.reason,
      });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [symbol, horizon]);

  useEffect(() => {
    const controller = new AbortController();
    void loadPredictionContext(controller.signal);
    return () => controller.abort();
  }, [loadPredictionContext]);

  const activeStock = useMemo(
    () =>
      stock ||
      stockList.find((s) => s.symbol === symbol) ||
      SAMPLE_STOCKS[0],
    [stock, stockList, symbol]
  );

  // Illustrative UI layout preview (explicitly disclosed; never masked as live ML inference)
  const illustrativePreview = useMemo(
    () => aiService.getIllustrativePrediction(activeStock.symbol, horizon),
    [activeStock.symbol, horizon]
  );

  const handleSymbolChange = (next: string) => {
    setSymbol(next);
    setSearchParams({ symbol: next });
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#137949] dark:text-[#36C982]">
            Backend Endpoint /api/predictions/{activeStock.symbol} · Python ML Gateway
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
            AI Prediction Centre
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeStock.symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            aria-label="Select stock for AI forecast preview"
            className="h-10 rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#18211C] dark:text-[#E8F0EA]"
          >
            {stockList.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/8 dark:bg-[#18211C]">
            {HORIZONS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHorizon(h)}
                className={`rounded-md px-3 py-1.5 font-mono-num text-xs font-semibold transition-colors ${
                  horizon === h
                    ? 'bg-[#36C982] text-[#0B120E]'
                    : 'text-[#53645A] dark:text-[#91A197]'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Backend Prediction Status */}
      {loading ? (
        <LoadingSkeleton variant="card" />
      ) : serviceNotice ? (
        <div
          role="status"
          className="rounded-xl border border-[#E5B869]/35 bg-[#E5B869]/8 p-5 text-xs text-[#53645A] dark:text-[#91A197]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ServerCrash className="mt-0.5 h-5 w-5 shrink-0 text-[#9A6B16] dark:text-[#E5B869]" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                    Python AI/ML Service Not Connected
                  </span>
                  <span className="rounded bg-black/10 px-2 py-0.5 font-mono-num text-[11px] font-semibold text-[#101814] dark:bg-white/10 dark:text-[#E8F0EA]">
                    HTTP {serviceNotice.status || 503} · {serviceNotice.code || 'AI_SERVICE_UNAVAILABLE'}
                  </span>
                </div>
                <p className="mt-1.5 leading-relaxed">
                  {serviceNotice.message}
                  {serviceNotice.reason ? ` (${serviceNotice.reason})` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void loadPredictionContext()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#101814] hover:border-[#36C982]/50 dark:border-white/10 dark:bg-[#18211C] dark:text-[#E8F0EA]"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#36C982]" />
                <span>Retry Backend Check</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDesignPreview((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#36C982] px-3.5 py-2 text-xs font-semibold text-[#0B120E] hover:bg-[#A5EBC3]"
              >
                <span>{showDesignPreview ? 'Hide UI Preview' : 'Show Illustrative UI Preview'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : backendPrediction ? (
        <div className="flex items-start gap-3 rounded-xl border border-[#36C982]/35 bg-[#36C982]/10 p-4 text-xs text-[#101814] dark:text-[#E8F0EA]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#36C982]" />
          <span>
            Live model forecast received from <strong>{backendPrediction.dataSource}</strong> using{' '}
            <span className="font-mono-num">{backendPrediction.modelName}</span> ({backendPrediction.horizon}).
          </span>
        </div>
      ) : null}

      {/* Live Backend Forecast Output (when Python service IS connected) */}
      {backendPrediction && backendPrediction.predictedPrices.length > 0 && (
        <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
          <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
            {backendPrediction.symbol} · Live ML Service Forecast ({backendPrediction.horizon})
          </h2>
          <p className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
            Model: {backendPrediction.modelName} · Status: {backendPrediction.predictionStatus}
          </p>
          <div className="mt-4">
            <ChartContainer
              bars={historyBars}
              mode="line"
              lineColor="#91A197"
              height={320}
              extraLines={[
                {
                  id: 'live-ml-forecast',
                  label: 'ML Forecast',
                  color: '#36C982',
                  dashed: true,
                  lineWidth: 2,
                  data: backendPrediction.forecastTimestamps.map((ts, i) => ({
                    time: ts,
                    value: backendPrediction.predictedPrices[i] ?? activeStock.price,
                  })),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Clearly Labelled Illustrative UI Design Preview */}
      {showDesignPreview && (
        <>
          <div className="flex items-start gap-3 rounded-xl border border-[#36C982]/30 bg-[#36C982]/8 p-4 text-xs text-[#53645A] dark:text-[#91A197]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#137949] dark:text-[#36C982]" />
            <span>
              <strong>Illustrative UI Preview Only:</strong> The charts, scenario envelopes, and
              MAE/RMSE tables below are deterministic frontend design placeholders showing how
              BULLSIGHT renders forecasts once the external Python FastAPI ML service is connected.
            </span>
          </div>

          {/* Summary Strip */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">Current Sample Price</div>
              <div className="mt-1 font-mono-num text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                {formatCurrency(activeStock.price, activeStock.currency, settings.currency)}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                Illustrative Range ({horizon})
              </div>
              <div className="mt-1 font-mono-num text-lg font-bold text-[#137949] dark:text-[#A5EBC3]">
                {formatCurrency(illustrativePreview.predictedRangeLow, activeStock.currency, settings.currency)} –{' '}
                {formatCurrency(illustrativePreview.predictedRangeHigh, activeStock.currency, settings.currency)}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                Preview Confidence Score
              </div>
              <div className="mt-1 flex items-center gap-3">
                <span className="font-mono-num text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                  {illustrativePreview.confidenceScore}%
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#36C982]"
                    style={{ width: `${illustrativePreview.confidenceScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">
                Illustrative Error Metrics
              </div>
              <div className="mt-1 font-mono-num text-sm font-semibold text-[#101814] dark:text-[#E8F0EA]">
                MAE {illustrativePreview.maeIllustrative.toFixed(2)} · RMSE{' '}
                {illustrativePreview.rmseIllustrative.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Historical vs Illustrative Forecast Chart */}
          {historyBars.length > 0 && (
            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                    {activeStock.symbol} · Historical (Backend) vs. Illustrative {horizon} Forecast Envelope
                  </h2>
                  <p className="text-xs text-[#53645A] dark:text-[#91A197]">
                    Solid line: sample historical close · Dashed emerald: illustrative median path · Shaded bounds: upper/lower envelope
                  </p>
                </div>
              </div>

              <ChartContainer
                bars={historyBars}
                mode="line"
                lineColor="#91A197"
                height={330}
                extraLines={[
                  {
                    id: 'forecast-mid',
                    label: 'Illustrative Median',
                    color: '#36C982',
                    dashed: true,
                    lineWidth: 2,
                    data: [
                      {
                        time: historyBars[historyBars.length - 1].time,
                        value: historyBars[historyBars.length - 1].close,
                      },
                      ...illustrativePreview.forecastSeries.map((p) => ({
                        time: p.time,
                        value: p.predicted,
                      })),
                    ],
                  },
                  {
                    id: 'forecast-upper',
                    label: 'Upper Envelope',
                    color: '#A5EBC3',
                    dashed: true,
                    lineWidth: 1,
                    data: illustrativePreview.forecastSeries.map((p) => ({
                      time: p.time,
                      value: p.upper,
                    })),
                  },
                  {
                    id: 'forecast-lower',
                    label: 'Lower Envelope',
                    color: '#EF6461',
                    dashed: true,
                    lineWidth: 1,
                    data: illustrativePreview.forecastSeries.map((p) => ({
                      time: p.time,
                      value: p.lower,
                    })),
                  },
                ]}
              />
            </div>
          )}

          {/* Bullish / Neutral / Bearish Scenario Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {illustrativePreview.scenarios.map((scenario) => (
              <PredictionCard
                key={scenario.stance}
                scenario={scenario}
                currency={activeStock.currency}
                active={selectedScenario === scenario.stance}
                onSelect={() => setSelectedScenario(scenario.stance)}
              />
            ))}
          </div>

          {/* Neural Network Graphic + Actual vs Predicted Comparison */}
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-6">
              <NeuralNetworkCanvas
                drivers={illustrativePreview.featureDrivers}
                confidence={illustrativePreview.confidenceScore}
              />
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C] xl:col-span-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                    Model Performance Preview (Illustrative Backtest)
                  </h2>
                  <p className="text-xs text-[#53645A] dark:text-[#91A197]">
                    Sample alignment rate: {illustrativePreview.directionalMatchIllustrative}% · MAE{' '}
                    {illustrativePreview.maeIllustrative} · RMSE {illustrativePreview.rmseIllustrative}
                  </p>
                </div>
              </div>

              <ChartContainer
                mode="line"
                height={250}
                extraLines={[
                  {
                    id: 'bt-actual',
                    label: 'Sample Actual',
                    color: '#E8F0EA',
                    lineWidth: 2,
                    data: illustrativePreview.backtestComparison.map((p) => ({
                      time: p.time,
                      value: p.actual,
                    })),
                  },
                  {
                    id: 'bt-pred',
                    label: 'Illustrative Predicted',
                    color: '#36C982',
                    dashed: true,
                    lineWidth: 2,
                    data: illustrativePreview.backtestComparison.map((p) => ({
                      time: p.time,
                      value: p.predicted,
                    })),
                  },
                ]}
              />
            </div>
          </div>

          {/* Illustrative Prediction History Log */}
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/8 dark:bg-[#18211C]">
            <div className="border-b border-black/8 px-5 py-3.5 dark:border-white/8">
              <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                Illustrative Prediction History ({activeStock.symbol})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 bg-black/[0.02] text-[#53645A] dark:border-white/8 dark:bg-[#141C17] dark:text-[#91A197]">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Horizon</th>
                    <th className="px-4 py-3 text-right">Illustrative Target</th>
                    <th className="px-4 py-3 text-right">Sample Actual</th>
                    <th className="px-4 py-3 text-right">Variance</th>
                    <th className="px-4 py-3 text-right">Outcome Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6 font-mono-num dark:divide-white/6">
                  {illustrativePreview.historyLog.map((row) => (
                    <tr key={row.id} className="hover:bg-black/[0.02] dark:hover:bg-[#202B24]/60">
                      <td className="px-4 py-3 text-[#53645A] dark:text-[#91A197]">{row.date}</td>
                      <td className="px-4 py-3">{row.horizon}</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(row.projectedPrice, activeStock.currency, settings.currency)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(row.actualPrice, activeStock.currency, settings.currency)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right ${
                          row.variancePercent >= 0
                            ? 'text-[#137949] dark:text-[#36C982]'
                            : 'text-[#D94848] dark:text-[#EF6461]'
                        }`}
                      >
                        {row.variancePercent >= 0 ? '+' : ''}
                        {row.variancePercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right font-sans font-medium text-[#101814] dark:text-[#E8F0EA]">
                        {row.outcome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
