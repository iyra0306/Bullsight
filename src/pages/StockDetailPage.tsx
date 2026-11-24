import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Star,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { stockService } from '../services/stockService';
import { newsService } from '../services/newsService';
import { ApiClientError } from '../services/apiClient';
import { buildTechnicalSummary } from '../utils/indicators';
import { ChartContainer } from '../components/ChartContainer';
import { StockMonogram } from '../components/StockMonogram';
import { NewsCard } from '../components/NewsCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ApiErrorState } from '../components/ApiErrorState';
import { NewsArticle, OhlcBar, StockQuote, Timeframe } from '../types/market';
import {
  formatCompactNumber,
  formatCurrency,
  formatMarketCap,
  formatPercent,
} from '../utils/formatters';

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'MAX'];

export const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { settings, isInWatchlist, toggleWatchlist } = useApp();

  const activeSymbol = (symbol || 'NVDA').toUpperCase();

  const [stockList, setStockList] = useState<StockQuote[]>([]);
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<{ message: string; code?: string } | null>(null);

  const [timeframe, setTimeframe] = useState<Timeframe>('3M');
  const [bars, setBars] = useState<OhlcBar[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<{ message: string; code?: string } | null>(null);

  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const [chartMode, setChartMode] = useState<'candlestick' | 'area'>(settings.defaultChartStyle);
  const [hoveredBar, setHoveredBar] = useState<OhlcBar | null>(null);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    stockService
      .fetchStocks(undefined, controller.signal)
      .then((res) => setStockList(res.stocks || []))
      .catch(() => {
        // Switcher list stays minimal if universe fetch fails
      });
    return () => controller.abort();
  }, []);

  const loadStock = useCallback(async (signal?: AbortSignal) => {
    setStockLoading(true);
    setStockError(null);
    try {
      const data = await stockService.fetchStockBySymbol(activeSymbol, signal);
      setStock(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      setStock(null);
      setStockError({
        message: err instanceof Error ? err.message : `Failed to load ${activeSymbol}.`,
        code: err instanceof ApiClientError ? err.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setStockLoading(false);
    }
  }, [activeSymbol]);

  const loadHistory = useCallback(async (signal?: AbortSignal) => {
    setHistoryLoading(true);
    setHistoryError(null);
    setHoveredBar(null);
    try {
      const res = await stockService.fetchStockHistory(activeSymbol, { period: timeframe }, signal);
      setBars(res.bars || []);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      setBars([]);
      setHistoryError({
        message: err instanceof Error ? err.message : 'Failed to load OHLCV history.',
        code: err instanceof ApiClientError ? err.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setHistoryLoading(false);
    }
  }, [activeSymbol, timeframe]);

  useEffect(() => {
    const controller = new AbortController();
    void loadStock(controller.signal);
    return () => controller.abort();
  }, [loadStock]);

  useEffect(() => {
    const controller = new AbortController();
    void loadHistory(controller.signal);
    return () => controller.abort();
  }, [loadHistory]);

  useEffect(() => {
    const controller = new AbortController();
    setNewsLoading(true);
    newsService
      .fetchNews({ symbol: activeSymbol, limit: 3 }, controller.signal)
      .then(async (res) => {
        if ((res.articles || []).length > 0) {
          setRelatedNews(res.articles);
        } else {
          const fallback = await newsService.fetchNews({ limit: 3 }, controller.signal);
          setRelatedNews(fallback.articles || []);
        }
      })
      .catch(() => {
        setRelatedNews([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setNewsLoading(false);
      });
    return () => controller.abort();
  }, [activeSymbol]);

  const technicals = useMemo(() => buildTechnicalSummary(bars), [bars]);

  if (stockLoading && !stock) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="chart" />
      </div>
    );
  }

  if (stockError || !stock) {
    return (
      <div className="space-y-4">
        <ApiErrorState
          title={`Could not load ${activeSymbol}`}
          message={stockError?.message || 'Stock details were not returned by the backend.'}
          code={stockError?.code}
          onRetry={() => void loadStock()}
        />
        <Link
          to="/app/explore"
          className="inline-flex items-center rounded-lg border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-[#101814] dark:border-white/10 dark:bg-[#18211C] dark:text-[#E8F0EA]"
        >
          ← Back to Explore Stocks
        </Link>
      </div>
    );
  }

  const activeOhlc = hoveredBar || bars[bars.length - 1];
  const positive = stock.change >= 0;
  const saved = isInWatchlist(stock.symbol);

  return (
    <div className="space-y-6">
      {/* Stock Selector & Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
        <div className="flex items-center gap-4">
          <StockMonogram symbol={stock.symbol} bg={stock.monogramBg} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#53645A] dark:text-[#91A197]">
              <span>{stock.exchange}</span>
              <span aria-hidden="true">·</span>
              <span>{stock.sector}</span>
              <span aria-hidden="true">·</span>
              <span>Sample Quote (Backend API)</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
              {stock.name} ({stock.symbol})
            </h1>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="font-mono-num text-2xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                {formatCurrency(stock.price, stock.currency, settings.currency)}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono-num text-sm font-semibold ${
                  positive
                    ? 'text-[#137949] dark:text-[#36C982]'
                    : 'text-[#D94848] dark:text-[#EF6461]'
                }`}
              >
                {positive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stock.change >= 0 ? '+' : ''}
                {stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={stock.symbol}
            onChange={(e) => navigate(`/app/stocks/${e.target.value}`)}
            aria-label="Switch active stock"
            className="h-10 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-semibold text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
          >
            {(stockList.length > 0 ? stockList : [stock]).map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void toggleWatchlist(stock.symbol)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-xs font-semibold transition-colors ${
              saved
                ? 'border-[#36C982]/50 bg-[#36C982]/15 text-[#137949] dark:text-[#A5EBC3]'
                : 'border-black/10 bg-[#f4f7f5] text-[#101814] hover:border-[#36C982]/40 dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <Link
            to={`/app/predictions?symbol=${stock.symbol}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#36C982] px-4 text-xs font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3]"
          >
            <BrainCircuit className="h-3.5 w-3.5" />
            <span>AI Scenario</span>
          </Link>
        </div>
      </div>

      {/* Price / Candlestick Chart + Volume */}
      <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* OHLC Readout */}
          {activeOhlc ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-num text-xs text-[#53645A] dark:text-[#91A197]">
              <span>
                O <strong className="text-[#101814] dark:text-[#E8F0EA]">{activeOhlc.open.toFixed(2)}</strong>
              </span>
              <span>
                H <strong className="text-[#101814] dark:text-[#E8F0EA]">{activeOhlc.high.toFixed(2)}</strong>
              </span>
              <span>
                L <strong className="text-[#101814] dark:text-[#E8F0EA]">{activeOhlc.low.toFixed(2)}</strong>
              </span>
              <span>
                C <strong className="text-[#101814] dark:text-[#E8F0EA]">{activeOhlc.close.toFixed(2)}</strong>
              </span>
              <span>
                Vol <strong className="text-[#101814] dark:text-[#E8F0EA]">{formatCompactNumber(activeOhlc.volume)}</strong>
              </span>
            </div>
          ) : (
            <div className="text-xs text-[#53645A] dark:text-[#91A197]">OHLCV Series ({timeframe})</div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-black/10 bg-black/[0.02] p-0.5 dark:border-white/8 dark:bg-[#141C17]">
              {(['candlestick', 'area'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setChartMode(m)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                    chartMode === m
                      ? 'bg-[#36C982] text-[#0B120E]'
                      : 'text-[#53645A] dark:text-[#91A197]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap rounded-lg border border-black/10 bg-black/[0.02] p-0.5 dark:border-white/8 dark:bg-[#141C17]">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-md px-2.5 py-1 font-mono-num text-xs font-semibold ${
                    timeframe === tf
                      ? 'bg-[#214B37] text-[#A5EBC3]'
                      : 'text-[#53645A] dark:text-[#91A197]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {historyError ? (
          <ApiErrorState
            compact
            title="Historical OHLCV unavailable"
            message={historyError.message}
            code={historyError.code}
            onRetry={() => void loadHistory()}
          />
        ) : historyLoading ? (
          <LoadingSkeleton variant="chart" />
        ) : bars.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#53645A] dark:text-[#91A197]">
            No historical bars returned for {stock.symbol} ({timeframe}).
          </div>
        ) : (
          <>
            <ChartContainer
              bars={bars}
              mode={chartMode}
              height={350}
              onCrosshairMove={setHoveredBar}
            />

            <div className="mt-4 border-t border-black/8 pt-3 dark:border-white/8">
              <div className="mb-1.5 text-xs font-medium text-[#53645A] dark:text-[#91A197]">
                Trading Volume Histogram ({timeframe})
              </div>
              <ChartContainer bars={bars} mode="volume" height={110} />
            </div>
          </>
        )}
      </div>

      {/* Overview, Fundamentals & Technical Summary */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
            <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
              Company Overview
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
              {stock.description}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-black/8 pt-4 text-xs dark:border-white/8">
              <div>
                <div className="text-[#53645A] dark:text-[#91A197]">Headquarters</div>
                <div className="mt-0.5 font-medium text-[#101814] dark:text-[#E8F0EA]">
                  {stock.headquarters}
                </div>
              </div>
              <div>
                <div className="text-[#53645A] dark:text-[#91A197]">Leadership</div>
                <div className="mt-0.5 font-medium text-[#101814] dark:text-[#E8F0EA]">
                  {stock.ceo}
                </div>
              </div>
              <div>
                <div className="text-[#53645A] dark:text-[#91A197]">Founded</div>
                <div className="mt-0.5 font-mono-num font-medium text-[#101814] dark:text-[#E8F0EA]">
                  {stock.founded}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Price Table */}
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/8 dark:bg-[#18211C]">
            <div className="border-b border-black/8 px-5 py-3.5 dark:border-white/8">
              <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                Recent Historical Sessions (Sample)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 bg-black/[0.02] text-[#53645A] dark:border-white/8 dark:bg-[#141C17] dark:text-[#91A197]">
                    <th className="px-4 py-2.5">Session</th>
                    <th className="px-4 py-2.5 text-right">Open</th>
                    <th className="px-4 py-2.5 text-right">High</th>
                    <th className="px-4 py-2.5 text-right">Low</th>
                    <th className="px-4 py-2.5 text-right">Close</th>
                    <th className="px-4 py-2.5 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6 font-mono-num dark:divide-white/6">
                  {bars
                    .slice(-7)
                    .reverse()
                    .map((b) => (
                      <tr key={b.time} className="hover:bg-black/[0.02] dark:hover:bg-[#202B24]/60">
                        <td className="px-4 py-2.5 text-[#53645A] dark:text-[#91A197]">
                          {/^\d+$/.test(b.time)
                            ? new Date(Number(b.time) * 1000).toISOString().slice(11, 16)
                            : b.time}
                        </td>
                        <td className="px-4 py-2.5 text-right">{b.open.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right">{b.high.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right">{b.low.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold">{b.close.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-[#53645A] dark:text-[#91A197]">
                          {formatCompactNumber(b.volume)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          {/* Fundamentals */}
          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
            <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
              Key Fundamentals (Sample)
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              {[
                {
                  label: 'Market Cap',
                  value: formatMarketCap(stock.marketCapBillions, stock.currency, settings.currency),
                },
                { label: 'P/E Ratio', value: stock.fundamentals.peRatio.toFixed(1) },
                { label: 'P/B Ratio', value: stock.fundamentals.pbRatio.toFixed(2) },
                { label: 'EPS (TTM)', value: stock.fundamentals.eps.toFixed(2) },
                { label: 'ROE', value: `${stock.fundamentals.roe.toFixed(1)}%` },
                { label: 'Dividend Yield', value: `${stock.fundamentals.dividendYield.toFixed(2)}%` },
                {
                  label: '52W High',
                  value: formatCurrency(stock.fundamentals.week52High, stock.currency, settings.currency),
                },
                {
                  label: '52W Low',
                  value: formatCurrency(stock.fundamentals.week52Low, stock.currency, settings.currency),
                },
                { label: 'Beta', value: stock.fundamentals.beta.toFixed(2) },
                { label: 'Debt / Equity', value: stock.fundamentals.debtToEquity.toFixed(2) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-b border-black/8 pb-2.5 dark:border-white/8"
                >
                  <div className="text-[#53645A] dark:text-[#91A197]">{item.label}</div>
                  <div className="mt-1 font-mono-num text-sm font-semibold text-[#101814] dark:text-[#E8F0EA]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Indicators Snapshot */}
          <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/8 dark:bg-[#18211C]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                Technical Snapshot
              </h2>
              <Link
                to={`/app/technicals?symbol=${stock.symbol}`}
                className="text-xs font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
              >
                Full Analysis →
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-black/8 p-3 dark:border-white/8">
                <div className="text-[#53645A] dark:text-[#91A197]">RSI (14)</div>
                <div className="mt-1 font-mono-num text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  {technicals.rsi14.toFixed(1)}
                </div>
              </div>
              <div className="rounded-lg border border-black/8 p-3 dark:border-white/8">
                <div className="text-[#53645A] dark:text-[#91A197]">MACD Histogram</div>
                <div className="mt-1 font-mono-num text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  {technicals.macdHistogram.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg border border-black/8 p-3 dark:border-white/8">
                <div className="text-[#53645A] dark:text-[#91A197]">SMA (20)</div>
                <div className="mt-1 font-mono-num text-base font-bold text-[#101814] dark:text-[#E8F0EA]">
                  {technicals.sma20.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg border border-black/8 p-3 dark:border-white/8">
                <div className="text-[#53645A] dark:text-[#91A197]">Computed Bias</div>
                <div className="mt-1 font-display text-base font-bold text-[#137949] dark:text-[#36C982]">
                  {technicals.trendBias}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Company News */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-[#101814] dark:text-[#E8F0EA]">
          Related Company Briefings (Demonstration)
        </h2>
        {newsLoading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {relatedNews.map((article) => (
              <NewsCard key={article.id} article={article} onRead={setActiveArticle} />
            ))}
          </div>
        )}
      </section>

      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-white p-6 dark:bg-[#18211C]">
            <div className="flex items-center justify-between text-xs text-[#53645A] dark:text-[#91A197]">
              <span>
                {activeArticle.category} · {activeArticle.source}
              </span>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="rounded-lg border border-black/10 px-2.5 py-1 font-semibold dark:border-white/10"
              >
                Close
              </button>
            </div>
            <h3 className="mt-3 font-display text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
              {activeArticle.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#53645A] dark:text-[#91A197]">
              {activeArticle.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
