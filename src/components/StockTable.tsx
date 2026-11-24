import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowUpDown, ArrowUpRight, Star } from 'lucide-react';
import { StockQuote } from '../types/market';
import { useApp } from '../contexts/AppContext';
import {
  formatCompactNumber,
  formatCurrency,
  formatMarketCap,
  formatPercent,
} from '../utils/formatters';
import { Sparkline } from './Sparkline';
import { StockMonogram } from './StockMonogram';

type SortKey = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCapBillions';
type SortDir = 'asc' | 'desc';

interface StockTableProps {
  stocks: StockQuote[];
  emptyMessage?: string;
  onResetFilters?: () => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  emptyMessage = 'No sample equities match the current filter criteria.',
  onResetFilters,
}) => {
  const navigate = useNavigate();
  const { settings, isInWatchlist, toggleWatchlist } = useApp();
  const [sortKey, setSortKey] = useState<SortKey>('marketCapBillions');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sortedStocks = useMemo(() => {
    const copy = [...stocks];
    copy.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'asc'
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });
    return copy;
  }, [stocks, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'symbol' ? 'asc' : 'desc');
    }
  };

  if (sortedStocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-black/10 bg-white px-6 py-14 text-center dark:border-white/8 dark:bg-[#18211C]">
        <p className="text-sm font-medium text-[#101814] dark:text-[#E8F0EA]">{emptyMessage}</p>
        <p className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
          Try broadening your sector, exchange, or price threshold.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 rounded-lg border border-[#36C982]/40 bg-[#36C982]/15 px-4 py-2 text-xs font-semibold text-[#137949] transition-colors hover:bg-[#36C982]/25 dark:text-[#A5EBC3]"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  const rowPadding = settings.compactTables ? 'py-2.5' : 'py-3.5';

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/8 dark:bg-[#18211C]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-black/10 bg-black/[0.02] text-xs font-medium text-[#53645A] dark:border-white/8 dark:bg-[#141C17] dark:text-[#91A197]">
              <th className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleSort('symbol')}
                  className="inline-flex items-center gap-1.5 hover:text-[#101814] dark:hover:text-[#E8F0EA]"
                >
                  <span>Company & Symbol</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3">Market / Sector</th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('price')}
                  className="inline-flex items-center gap-1.5 hover:text-[#101814] dark:hover:text-[#E8F0EA]"
                >
                  <span>Sample Price</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('changePercent')}
                  className="inline-flex items-center gap-1.5 hover:text-[#101814] dark:hover:text-[#E8F0EA]"
                >
                  <span>24h Change</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('volume')}
                  className="inline-flex items-center gap-1.5 hover:text-[#101814] dark:hover:text-[#E8F0EA]"
                >
                  <span>Volume</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('marketCapBillions')}
                  className="inline-flex items-center gap-1.5 hover:text-[#101814] dark:hover:text-[#E8F0EA]"
                >
                  <span>Market Cap</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">Trend</th>
              <th className="px-4 py-3 text-right">Watch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/8 dark:divide-white/6">
            {sortedStocks.map((stock) => {
              const positive = stock.change >= 0;
              const saved = isInWatchlist(stock.symbol);
              return (
                <tr
                  key={stock.symbol}
                  onClick={() => navigate(`/app/stocks/${stock.symbol}`)}
                  data-cursor="stock"
                  className="group cursor-pointer transition-colors hover:bg-black/[0.02] dark:hover:bg-[#202B24]/65"
                >
                  <td className={`px-4 ${rowPadding}`}>
                    <div className="flex items-center gap-3">
                      <StockMonogram symbol={stock.symbol} bg={stock.monogramBg} size="sm" />
                      <div className="min-w-0">
                        <div className="font-display text-sm font-bold text-[#101814] group-hover:text-[#1EA866] dark:text-[#E8F0EA] dark:group-hover:text-[#A5EBC3]">
                          {stock.symbol}
                        </div>
                        <div className="max-w-[200px] truncate text-xs text-[#53645A] dark:text-[#91A197]">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-4 text-xs text-[#53645A] dark:text-[#91A197] ${rowPadding}`}>
                    <span>{stock.exchange}</span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span>{stock.sector}</span>
                  </td>
                  <td
                    className={`px-4 text-right font-mono-num text-sm font-semibold text-[#101814] dark:text-[#E8F0EA] ${rowPadding}`}
                  >
                    {formatCurrency(stock.price, stock.currency, settings.currency)}
                  </td>
                  <td className={`px-4 text-right font-mono-num text-xs font-medium ${rowPadding}`}>
                    <span
                      className={`inline-flex items-center justify-end gap-1 ${
                        positive
                          ? 'text-[#137949] dark:text-[#36C982]'
                          : 'text-[#D94848] dark:text-[#EF6461]'
                      }`}
                    >
                      {positive ? (
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {formatPercent(stock.changePercent)}
                    </span>
                  </td>
                  <td
                    className={`px-4 text-right font-mono-num text-xs text-[#53645A] dark:text-[#91A197] ${rowPadding}`}
                  >
                    {formatCompactNumber(stock.volume)}
                  </td>
                  <td
                    className={`px-4 text-right font-mono-num text-xs text-[#101814] dark:text-[#E8F0EA] ${rowPadding}`}
                  >
                    {formatMarketCap(stock.marketCapBillions, stock.currency, settings.currency)}
                  </td>
                  <td className={`px-4 ${rowPadding}`}>
                    <div className="flex justify-end">
                      <Sparkline data={stock.sparkline} positive={positive} width={74} height={24} />
                    </div>
                  </td>
                  <td className={`px-4 text-right ${rowPadding}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      aria-label={saved ? `Remove ${stock.symbol} from watchlist` : `Add ${stock.symbol} to watchlist`}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        saved
                          ? 'border-[#36C982]/40 bg-[#36C982]/15 text-[#137949] dark:text-[#36C982]'
                          : 'border-black/10 text-[#53645A] hover:border-[#36C982]/40 dark:border-white/8 dark:text-[#91A197]'
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
