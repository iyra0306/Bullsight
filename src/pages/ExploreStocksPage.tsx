import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { stockService } from '../services/stockService';
import { ApiClientError } from '../services/apiClient';
import { StockTable } from '../components/StockTable';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ApiErrorState } from '../components/ApiErrorState';
import { Exchange, MarketRegion, StockQuote } from '../types/market';

export const ExploreStocksPage: React.FC = () => {
  const { region, setRegion } = useApp();
  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState<'ALL' | Exchange>('ALL');
  const [sector, setSector] = useState<string>('ALL');
  const [direction, setDirection] = useState<'ALL' | 'GAINERS' | 'LOSERS'>('ALL');
  const [priceBand, setPriceBand] = useState<'ALL' | 'UNDER_500' | '500_2000' | 'OVER_2000'>('ALL');

  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [totalUniverse, setTotalUniverse] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  const loadStocks = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await stockService.fetchStocks(
        { region, exchange, sector, direction },
        signal
      );
      setStocks(res.stocks || []);
      if (region === 'ALL' && exchange === 'ALL' && sector === 'ALL' && direction === 'ALL') {
        setTotalUniverse(res.count || (res.stocks || []).length);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch stocks from backend API.',
        code: err instanceof ApiClientError ? err.code : undefined,
      });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [region, exchange, sector, direction]);

  useEffect(() => {
    const controller = new AbortController();
    void loadStocks(controller.signal);
    return () => controller.abort();
  }, [loadStocks]);

  const sectors = useMemo(
    () => [
      'ALL',
      'Semiconductors',
      'Energy & Digital',
      'IT Services',
      'Consumer Tech',
      'Banking & Finance',
      'Cloud & AI Software',
      'Automotive & Energy',
      'Automotive & EV',
      'Cloud & Commerce',
      'Telecom & Digital',
    ],
    []
  );

  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (priceBand === 'UNDER_500' && s.price >= 500) return false;
      if (priceBand === '500_2000' && (s.price < 500 || s.price > 2000)) return false;
      if (priceBand === 'OVER_2000' && s.price <= 2000) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q) ||
          s.exchange.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stocks, priceBand, search]);

  const resetFilters = () => {
    setSearch('');
    setRegion('ALL');
    setExchange('ALL');
    setSector('ALL');
    setDirection('ALL');
    setPriceBand('ALL');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#137949] dark:text-[#36C982]">
            Backend Market Screener · Clearly Labelled Sample Reference Data
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
            Explore Global Stocks
          </h1>
        </div>

        <div className="text-xs text-[#53645A] dark:text-[#91A197]">
          Showing <span className="font-mono-num font-semibold text-[#101814] dark:text-[#E8F0EA]">{filteredStocks.length}</span> of{' '}
          <span className="font-mono-num">{totalUniverse || stocks.length}</span> sample equities
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#53645A] dark:text-[#91A197]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by company name or ticker..."
              className="h-10 w-full rounded-lg border border-black/10 bg-[#f4f7f5] pl-9 pr-3 text-sm text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
            />
          </div>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as MarketRegion)}
            aria-label="Filter by market region"
            className="h-10 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-medium text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
          >
            <option value="ALL">All Markets (IN + US)</option>
            <option value="IN">India Markets</option>
            <option value="US">US Markets</option>
          </select>

          <select
            value={exchange}
            onChange={(e) => setExchange(e.target.value as 'ALL' | Exchange)}
            aria-label="Filter by exchange"
            className="h-10 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-medium text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
          >
            <option value="ALL">All Exchanges</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
            <option value="NASDAQ">NASDAQ</option>
            <option value="NYSE">NYSE</option>
          </select>

          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-label="Filter by sector"
            className="h-10 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-medium text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec === 'ALL' ? 'All Sectors' : sec}
              </option>
            ))}
          </select>

          <select
            value={priceBand}
            onChange={(e) => setPriceBand(e.target.value as typeof priceBand)}
            aria-label="Filter by price range"
            className="h-10 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-medium text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
          >
            <option value="ALL">Any Price (Native)</option>
            <option value="UNDER_500">Under 500</option>
            <option value="500_2000">500 – 2,000</option>
            <option value="OVER_2000">Above 2,000</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-3 dark:border-white/8">
          <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-[#f4f7f5] p-0.5 dark:border-white/8 dark:bg-[#141C17]">
            {(
              [
                { id: 'ALL', label: 'All Movers' },
                { id: 'GAINERS', label: 'Gainers Only' },
                { id: 'LOSERS', label: 'Losers Only' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDirection(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  direction === opt.id
                    ? 'bg-[#36C982] text-[#0B120E]'
                    : 'text-[#53645A] dark:text-[#91A197]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[#53645A] hover:text-[#101814] dark:border-white/10 dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {error ? (
        <ApiErrorState
          title="Could not load stocks"
          message={error.message}
          code={error.code}
          onRetry={() => void loadStocks()}
        />
      ) : loading ? (
        <LoadingSkeleton variant="table" rows={8} />
      ) : (
        <StockTable stocks={filteredStocks} onResetFilters={resetFilters} />
      )}
    </div>
  );
};
