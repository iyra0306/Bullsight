import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stockService } from '../services/stockService';
import { ApiClientError } from '../services/apiClient';
import {
  buildTechnicalSummary,
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
} from '../utils/indicators';
import { ChartContainer, ExtraLineSeries } from '../components/ChartContainer';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ApiErrorState } from '../components/ApiErrorState';
import { OhlcBar, StockQuote, Timeframe } from '../types/market';

export const TechnicalAnalysisPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSymbol = (searchParams.get('symbol') || 'RELIANCE').toUpperCase();

  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState<Timeframe>('6M');
  const [showSma, setShowSma] = useState(true);
  const [showEma, setShowEma] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);

  const [stockList, setStockList] = useState<StockQuote[]>([]);
  const [bars, setBars] = useState<OhlcBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    stockService
      .fetchStocks(undefined, controller.signal)
      .then((res) => setStockList(res.stocks || []))
      .catch(() => {
        // Ignore dropdown error if history still resolves
      });
    return () => controller.abort();
  }, []);

  const loadHistory = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockService.fetchStockHistory(symbol, { period: timeframe }, signal);
      setBars(res.bars || []);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      setBars([]);
      setError({
        message: err instanceof Error ? err.message : 'Failed to load technical OHLCV series.',
        code: err instanceof ApiClientError ? err.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    const controller = new AbortController();
    void loadHistory(controller.signal);
    return () => controller.abort();
  }, [loadHistory]);

  const summary = useMemo(() => buildTechnicalSummary(bars), [bars]);

  const overlayLines = useMemo<ExtraLineSeries[]>(() => {
    const lines: ExtraLineSeries[] = [];
    if (showSma) {
      lines.push(
        { id: 'sma20', label: 'SMA 20', color: '#36C982', lineWidth: 2, data: calculateSMA(bars, 20) },
        { id: 'sma50', label: 'SMA 50', color: '#E5B869', lineWidth: 1, data: calculateSMA(bars, 50) }
      );
    }
    if (showEma) {
      lines.push({
        id: 'ema12',
        label: 'EMA 12',
        color: '#A5EBC3',
        dashed: true,
        lineWidth: 1,
        data: calculateEMA(bars, 12),
      });
    }
    if (showBollinger) {
      const bb = calculateBollingerBands(bars, 20, 2);
      lines.push(
        {
          id: 'bb-upper',
          label: 'BB Upper',
          color: 'rgba(165, 235, 195, 0.5)',
          dashed: true,
          lineWidth: 1,
          data: bb.map((p) => ({ time: p.time, value: p.upper })),
        },
        {
          id: 'bb-lower',
          label: 'BB Lower',
          color: 'rgba(165, 235, 195, 0.5)',
          dashed: true,
          lineWidth: 1,
          data: bb.map((p) => ({ time: p.time, value: p.lower })),
        }
      );
    }
    return lines;
  }, [bars, showSma, showEma, showBollinger]);

  const rsiData = useMemo(() => calculateRSI(bars, 14), [bars]);
  const macdData = useMemo(() => calculateMACD(bars), [bars]);

  const handleSymbolChange = (next: string) => {
    setSymbol(next);
    setSearchParams({ symbol: next });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#137949] dark:text-[#36C982]">
            Multi-Pane Indicator Workbench · Computed from Backend OHLCV
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
            Technical Analysis
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            aria-label="Select stock for technical analysis"
            className="h-10 rounded-lg border border-black/10 bg-white px-3 text-xs font-semibold text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#18211C] dark:text-[#E8F0EA]"
          >
            {(stockList.length > 0
              ? stockList
              : [{ symbol, name: symbol }]
            ).map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/8 dark:bg-[#18211C]">
            {(['1M', '3M', '6M', '1Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-md px-3 py-1.5 font-mono-num text-xs font-semibold ${
                  timeframe === tf
                    ? 'bg-[#36C982] text-[#0B120E]'
                    : 'text-[#53645A] dark:text-[#91A197]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <ApiErrorState
          title={`Unable to load technical series for ${symbol}`}
          message={error.message}
          code={error.code}
          onRetry={() => void loadHistory()}
        />
      ) : loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
          <LoadingSkeleton variant="chart" />
        </div>
      ) : (
        <>
          {/* Trend & Oscillator Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">Trend Analysis</div>
              <div
                className={`mt-1 font-display text-lg font-bold ${
                  summary.trendBias === 'Bullish'
                    ? 'text-[#137949] dark:text-[#36C982]'
                    : summary.trendBias === 'Bearish'
                    ? 'text-[#D94848] dark:text-[#EF6461]'
                    : 'text-[#9A6B16] dark:text-[#E5B869]'
                }`}
              >
                {summary.trendBias}
              </div>
              <div className="mt-1 text-[11px] text-[#53645A] dark:text-[#91A197]">
                Volatility: {summary.volatilityRegime}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">RSI (14)</div>
              <div className="mt-1 font-mono-num text-lg font-bold text-[#101814] dark:text-[#E8F0EA]">
                {summary.rsi14.toFixed(2)}
              </div>
              <div className="mt-1 text-[11px] text-[#53645A] dark:text-[#91A197]">
                {summary.rsi14 > 70
                  ? 'Overbought Zone'
                  : summary.rsi14 < 30
                  ? 'Oversold Zone'
                  : 'Neutral Range'}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">MACD (12, 26, 9)</div>
              <div className="mt-1 font-mono-num text-lg font-bold text-[#101814] dark:text-[#E8F0EA]">
                {summary.macdLine.toFixed(2)}
              </div>
              <div className="mt-1 font-mono-num text-[11px] text-[#53645A] dark:text-[#91A197]">
                Signal {summary.macdSignal.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">SMA 20 / EMA 12</div>
              <div className="mt-1 font-mono-num text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                {summary.sma20.toFixed(2)} / {summary.ema12.toFixed(2)}
              </div>
              <div className="mt-1 font-mono-num text-[11px] text-[#53645A] dark:text-[#91A197]">
                SMA 50: {summary.sma50.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
              <div className="text-xs text-[#53645A] dark:text-[#91A197]">Bollinger Band</div>
              <div className="mt-1 font-mono-num text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                {summary.bollingerLower.toFixed(1)} – {summary.bollingerUpper.toFixed(1)}
              </div>
              <div className="mt-1 font-mono-num text-[11px] text-[#53645A] dark:text-[#91A197]">
                Support {summary.supportLevel.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Main Price + Overlay Chart */}
          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  {symbol} Price Action &amp; Moving Overlays
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSma((p) => !p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    showSma
                      ? 'bg-[#36C982]/20 text-[#137949] dark:text-[#36C982]'
                      : 'border border-black/10 text-[#53645A] dark:border-white/10 dark:text-[#91A197]'
                  }`}
                >
                  SMA 20/50
                </button>
                <button
                  type="button"
                  onClick={() => setShowEma((p) => !p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    showEma
                      ? 'bg-[#36C982]/20 text-[#137949] dark:text-[#A5EBC3]'
                      : 'border border-black/10 text-[#53645A] dark:border-white/10 dark:text-[#91A197]'
                  }`}
                >
                  EMA 12
                </button>
                <button
                  type="button"
                  onClick={() => setShowBollinger((p) => !p)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    showBollinger
                      ? 'bg-[#36C982]/20 text-[#137949] dark:text-[#A5EBC3]'
                      : 'border border-black/10 text-[#53645A] dark:border-white/10 dark:text-[#91A197]'
                  }`}
                >
                  Bollinger Bands
                </button>
              </div>
            </div>

            <ChartContainer
              bars={bars}
              mode="candlestick"
              height={330}
              extraLines={overlayLines}
            />
          </div>

          {/* Synchronized Sub-Panes: RSI + MACD + Volume */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                  Relative Strength Index (RSI 14)
                </h2>
                <span className="font-mono-num text-xs text-[#53645A] dark:text-[#91A197]">
                  70 Overbought · 30 Oversold
                </span>
              </div>
              <ChartContainer
                mode="line"
                height={210}
                extraLines={[
                  { id: 'rsi-14', label: 'RSI(14)', color: '#36C982', lineWidth: 2, data: rsiData },
                ]}
                referenceLevels={[
                  { value: 70, color: '#EF6461', title: '70' },
                  { value: 30, color: '#36C982', title: '30' },
                ]}
              />
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                  MACD (12, 26, 9)
                </h2>
                <span className="font-mono-num text-xs text-[#53645A] dark:text-[#91A197]">
                  Histogram + Signal Crossover
                </span>
              </div>
              <ChartContainer
                mode="oscillator"
                height={210}
                histogramData={macdData.map((m) => ({
                  time: m.time,
                  value: m.histogram,
                  color:
                    m.histogram >= 0
                      ? 'rgba(54, 201, 130, 0.55)'
                      : 'rgba(239, 100, 97, 0.55)',
                }))}
                extraLines={[
                  {
                    id: 'macd-line',
                    label: 'MACD',
                    color: '#A5EBC3',
                    lineWidth: 2,
                    data: macdData.map((m) => ({ time: m.time, value: m.macd })),
                  },
                  {
                    id: 'macd-sig',
                    label: 'Signal',
                    color: '#E5B869',
                    lineWidth: 1,
                    data: macdData.map((m) => ({ time: m.time, value: m.signal })),
                  },
                ]}
              />
            </div>
          </div>

          {/* Trading Volume Pane */}
          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                Trading Volume Profile
              </h2>
              <span className="text-xs text-[#53645A] dark:text-[#91A197]">
                Sample session liquidity
              </span>
            </div>
            <ChartContainer bars={bars} mode="volume" height={170} />
          </div>
        </>
      )}
    </div>
  );
};
