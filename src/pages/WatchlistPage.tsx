import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Info, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { stockService } from '../services/stockService';
import { Sparkline } from '../components/Sparkline';
import { StockMonogram } from '../components/StockMonogram';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ApiErrorState } from '../components/ApiErrorState';
import { StockQuote } from '../types/market';
import { formatCurrency, formatMarketCap, formatPercent } from '../utils/formatters';

export const WatchlistPage: React.FC = () => {
  const {
    watchlist,
    watchlistItems,
    watchlistLoading,
    watchlistError,
    watchlistNotice,
    refreshWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    settings,
  } = useApp();

  const [search, setSearch] = useState('');
  const [symbolToAdd, setSymbolToAdd] = useState('');
  const [allStocks, setAllStocks] = useState<StockQuote[]>([]);
  const [mutatingSymbol, setMutatingSymbol] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    stockService
      .fetchStocks(undefined, controller.signal)
      .then((res) => setAllStocks(res.stocks || []))
      .catch(() => {
        // Dropdown options gracefully remain empty if universe fetch fails
      });
    return () => controller.abort();
  }, []);

  const availableToAdd = useMemo(
    () => allStocks.filter((s) => !watchlist.includes(s.symbol)),
    [allStocks, watchlist]
  );

  const savedStocks = useMemo(() => {
    return watchlistItems
      .map((entry) => entry.quote)
      .filter((s): s is StockQuote => Boolean(s))
      .filter((s) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      });
  }, [watchlistItems, search]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolToAdd) return;
    setMutatingSymbol(symbolToAdd);
    await addToWatchlist(symbolToAdd);
    setMutatingSymbol(null);
    setSymbolToAdd('');
  };

  const handleRemove = async (sym: string) => {
    setMutatingSymbol(sym);
    await removeFromWatchlist(sym);
    setMutatingSymbol(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#137949] dark:text-[#36C982]">
            Express Backend Watchlist · Phase 2 In-Memory Dev Store
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101814] dark:text-[#E8F0EA]">
            Watchlist
          </h1>
        </div>
        <div className="text-xs text-[#53645A] dark:text-[#91A197]">
          <span className="font-mono-num font-semibold text-[#101814] dark:text-[#E8F0EA]">
            {watchlist.length}
          </span>{' '}
          saved {watchlist.length === 1 ? 'equity' : 'equities'}
        </div>
      </div>

      {watchlistNotice && (
        <div className="flex items-start gap-2.5 rounded-xl border border-[#36C982]/25 bg-[#36C982]/8 px-4 py-3 text-xs text-[#53645A] dark:text-[#91A197]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#137949] dark:text-[#36C982]" />
          <span>{watchlistNotice}</span>
        </div>
      )}

      {/* Add & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/8 dark:bg-[#18211C]">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#53645A] dark:text-[#91A197]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved stocks..."
            className="h-10 w-full rounded-lg border border-black/10 bg-[#f4f7f5] pl-9 pr-3 text-xs text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA]"
          />
        </div>

        <form onSubmit={handleQuickAdd} className="flex w-full items-center gap-2 sm:w-auto">
          <select
            value={symbolToAdd}
            onChange={(e) => setSymbolToAdd(e.target.value)}
            aria-label="Select stock to add to watchlist"
            className="h-10 flex-1 rounded-lg border border-black/10 bg-[#f4f7f5] px-3 text-xs font-medium text-[#101814] focus:border-[#36C982] focus:outline-none dark:border-white/10 dark:bg-[#141C17] dark:text-[#E8F0EA] sm:w-64"
          >
            <option value="">
              {availableToAdd.length === 0
                ? 'All sample stocks are saved'
                : 'Select equity to add...'}
            </option>
            {availableToAdd.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!symbolToAdd || mutatingSymbol !== null}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#36C982] px-4 text-xs font-semibold text-[#0B120E] transition-colors hover:bg-[#A5EBC3] disabled:opacity-45"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{mutatingSymbol === symbolToAdd && symbolToAdd ? 'Adding...' : 'Add'}</span>
          </button>
        </form>
      </div>

      {watchlistError && (
        <ApiErrorState
          compact
          title="Watchlist API error"
          message={watchlistError}
          onRetry={() => void refreshWatchlist()}
        />
      )}

      {/* Loading, Empty State, or Saved List */}
      {watchlistLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-black/10 bg-white px-6 py-16 text-center dark:border-white/8 dark:bg-[#18211C]">
          <Star className="h-8 w-8 text-[#36C982]" />
          <h2 className="mt-3 font-display text-lg font-bold text-[#101814] dark:text-[#E8F0EA]">
            Your watchlist is empty
          </h2>
          <p className="mt-1 max-w-md text-xs text-[#53645A] dark:text-[#91A197]">
            Add any Indian or US sample equity above or browse the Explore screener to track
            prices and sparklines via the backend watchlist API.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => void addToWatchlist('NVDA')}
              className="rounded-lg bg-[#36C982] px-4 py-2 text-xs font-semibold text-[#0B120E]"
            >
              Add Sample (NVDA)
            </button>
            <Link
              to="/app/explore"
              className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold text-[#101814] dark:border-white/10 dark:text-[#E8F0EA]"
            >
              Explore Stocks
            </Link>
          </div>
        </div>
      ) : savedStocks.length === 0 ? (
        <div className="rounded-xl border border-black/10 bg-white px-6 py-12 text-center text-xs text-[#53645A] dark:border-white/8 dark:bg-[#18211C] dark:text-[#91A197]">
          No saved equities matched &quot;{search}&quot;.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedStocks.map((stock) => {
            const positive = stock.change >= 0;
            const busy = mutatingSymbol === stock.symbol;
            return (
              <div
                key={stock.symbol}
                data-cursor="stock"
                className="flex flex-col justify-between rounded-xl border border-black/10 bg-white p-5 transition-colors hover:border-[#36C982]/45 dark:border-white/8 dark:bg-[#18211C]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/app/stocks/${stock.symbol}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <StockMonogram symbol={stock.symbol} bg={stock.monogramBg} />
                    <div className="min-w-0">
                      <div className="font-display text-base font-bold text-[#101814] hover:text-[#1EA866] dark:text-[#E8F0EA] dark:hover:text-[#A5EBC3]">
                        {stock.symbol}
                      </div>
                      <div className="truncate text-xs text-[#53645A] dark:text-[#91A197]">
                        {stock.name} · {stock.exchange}
                      </div>
                    </div>
                  </Link>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleRemove(stock.symbol)}
                    aria-label={`Remove ${stock.symbol} from watchlist`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-[#53645A] transition-colors hover:border-[#EF6461]/50 hover:text-[#EF6461] disabled:opacity-45 dark:border-white/10 dark:text-[#91A197]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Link
                  to={`/app/stocks/${stock.symbol}`}
                  className="mt-5 flex items-end justify-between gap-4"
                >
                  <div>
                    <div className="font-mono-num text-xl font-bold text-[#101814] dark:text-[#E8F0EA]">
                      {formatCurrency(stock.price, stock.currency, settings.currency)}
                    </div>
                    <div
                      className={`mt-1 flex items-center gap-1 font-mono-num text-xs font-semibold ${
                        positive
                          ? 'text-[#137949] dark:text-[#36C982]'
                          : 'text-[#D94848] dark:text-[#EF6461]'
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      <span>{formatPercent(stock.changePercent)}</span>
                      <span className="text-[#53645A] dark:text-[#91A197]">·</span>
                      <span className="text-[#53645A] dark:text-[#91A197]">
                        {formatMarketCap(stock.marketCapBillions, stock.currency, settings.currency)}
                      </span>
                    </div>
                  </div>
                  <Sparkline data={stock.sparkline} positive={positive} width={96} height={34} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
