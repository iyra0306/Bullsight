import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Loader2,
  Menu,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { stockService } from '../services/stockService';
import { ApiClientError } from '../services/apiClient';
import { MarketRegion, StockQuote } from '../types/market';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate();
  const {
    region,
    setRegion,
    settings,
    toggleTheme,
    profile,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError(null);

    const timer = window.setTimeout(async () => {
      try {
        const res = await stockService.searchStocks(trimmed, controller.signal);
        setSearchResults((res.stocks || []).slice(0, 6));
      } catch (err) {
        if (err instanceof ApiClientError && err.code === 'REQUEST_ABORTED') return;
        setSearchResults([]);
        setSearchError(err instanceof Error ? err.message : 'Search request failed.');
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectStock = (symbol: string) => {
    setQuery('');
    setSearchFocused(false);
    navigate(`/app/stocks/${symbol}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/10 bg-[#f4f7f5]/95 px-4 backdrop-blur-md dark:border-white/8 dark:bg-[#101512]/95 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/10 text-[#101814] dark:border-white/8 dark:text-[#E8F0EA] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Stock Search */}
        <div ref={searchWrapRef} className="relative w-full max-w-md">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#53645A] dark:text-[#91A197]" />
            <input
              type="search"
              value={query}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchResults.length > 0) {
                  handleSelectStock(searchResults[0].symbol);
                }
              }}
              placeholder="Search ticker or company (e.g. NVDA, RELIANCE, TCS)..."
              aria-label="Global stock search"
              className="h-10 w-full rounded-lg border border-black/10 bg-white pl-9 pr-9 text-sm text-[#101814] placeholder:text-[#53645A] focus:border-[#36C982] focus:outline-none dark:border-white/8 dark:bg-[#18211C] dark:text-[#E8F0EA] dark:placeholder:text-[#91A197]"
            />
            {searchLoading && (
              <Loader2 className="pointer-events-none absolute right-3 h-4 w-4 animate-spin text-[#36C982]" />
            )}
          </div>

          {searchFocused && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#18211C]">
              {searchLoading ? (
                <div className="px-4 py-3 text-xs text-[#53645A] dark:text-[#91A197]">
                  Searching backend equity directory...
                </div>
              ) : searchError ? (
                <div className="px-4 py-3 text-xs text-[#D94848] dark:text-[#EF6461]">
                  {searchError}
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-xs text-[#53645A] dark:text-[#91A197]">
                  No sample equities matched &quot;{query}&quot;.
                </div>
              ) : (
                <ul className="divide-y divide-black/6 dark:divide-white/6">
                  {searchResults.map((stock) => (
                    <li key={stock.symbol}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelectStock(stock.symbol)}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-[#202B24]"
                      >
                        <div className="min-w-0">
                          <div className="font-display text-sm font-bold text-[#101814] dark:text-[#E8F0EA]">
                            {stock.symbol}
                            <span className="ml-2 text-xs font-normal text-[#53645A] dark:text-[#91A197]">
                              {stock.exchange}
                            </span>
                          </div>
                          <div className="truncate text-xs text-[#53645A] dark:text-[#91A197]">
                            {stock.name}
                          </div>
                        </div>
                        <div className="text-right font-mono-num text-xs">
                          <div className="font-semibold text-[#101814] dark:text-[#E8F0EA]">
                            {formatCurrency(stock.price, stock.currency, settings.currency)}
                          </div>
                          <div
                            className={
                              stock.change >= 0
                                ? 'text-[#137949] dark:text-[#36C982]'
                                : 'text-[#D94848] dark:text-[#EF6461]'
                            }
                          >
                            {formatPercent(stock.changePercent)}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Market Selector */}
        <div
          className="hidden items-center rounded-lg border border-black/10 bg-white p-0.5 dark:border-white/8 dark:bg-[#18211C] sm:flex"
          role="group"
          aria-label="Market selector"
        >
          {(['ALL', 'IN', 'US'] as MarketRegion[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setRegion(m)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                region === m
                  ? 'bg-[#36C982] text-[#0B120E]'
                  : 'text-[#53645A] hover:text-[#101814] dark:text-[#91A197] dark:hover:text-[#E8F0EA]'
              }`}
            >
              {m === 'ALL' ? 'Global' : m === 'IN' ? 'India' : 'US'}
            </button>
          ))}
        </div>

        {/* Theme Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={settings.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-[#53645A] transition-colors hover:border-[#36C982]/40 hover:text-[#101814] dark:border-white/8 dark:bg-[#18211C] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
        >
          {settings.theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((p) => !p);
              setProfileOpen(false);
            }}
            aria-label="Toggle notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-[#53645A] transition-colors hover:border-[#36C982]/40 hover:text-[#101814] dark:border-white/8 dark:bg-[#18211C] dark:text-[#91A197] dark:hover:text-[#E8F0EA]"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#36C982]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-[#18211C]">
              <div className="flex items-center justify-between border-b border-black/8 px-4 py-3 dark:border-white/8">
                <span className="font-display text-xs font-bold text-[#101814] dark:text-[#E8F0EA]">
                  Preview Alerts ({unreadCount} unread)
                </span>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137949] hover:underline dark:text-[#36C982]"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 divide-y divide-black/6 overflow-y-auto dark:divide-white/6">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setNotifOpen(false);
                      if (n.symbol) navigate(`/app/stocks/${n.symbol}`);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-[#202B24] ${
                      !n.read ? 'bg-[#36C982]/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]">
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#53645A] dark:text-[#91A197]">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#53645A] dark:text-[#91A197]">
                      {n.detail}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((p) => !p);
              setNotifOpen(false);
            }}
            aria-label="Open user profile menu"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-black/10 bg-white px-2.5 text-xs font-medium text-[#101814] transition-colors hover:border-[#36C982]/40 dark:border-white/8 dark:bg-[#18211C] dark:text-[#E8F0EA]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#214B37] text-[#A5EBC3]">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="hidden max-w-[110px] truncate md:inline">{profile.name}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-black/10 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#18211C]">
              <div className="border-b border-black/8 px-3 py-2 dark:border-white/8">
                <div className="truncate text-xs font-semibold text-[#101814] dark:text-[#E8F0EA]">
                  {profile.name}
                </div>
                <div className="truncate text-[11px] text-[#53645A] dark:text-[#91A197]">
                  {profile.email}
                </div>
              </div>
              <div className="mt-1 space-y-0.5 text-xs">
                <Link
                  to="/app/watchlist"
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-[#101814] hover:bg-black/[0.04] dark:text-[#E8F0EA] dark:hover:bg-[#202B24]"
                >
                  Saved Watchlist
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-[#101814] hover:bg-black/[0.04] dark:text-[#E8F0EA] dark:hover:bg-[#202B24]"
                >
                  Display & Preferences
                </Link>
                <Link
                  to="/login"
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-[#101814] hover:bg-black/[0.04] dark:text-[#E8F0EA] dark:hover:bg-[#202B24]"
                >
                  Authentication Screens
                </Link>
                <Link
                  to="/"
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-[#53645A] hover:bg-black/[0.04] dark:text-[#91A197] dark:hover:bg-[#202B24]"
                >
                  Public Landing Page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
