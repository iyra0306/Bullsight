import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  MarketRegion,
  NotificationItem,
  UserProfile,
  UserSettings,
} from '../types/market';
import { stockService, WatchlistEntry } from '../services/stockService';
import { ApiClientError } from '../services/apiClient';

interface AppContextValue {
  region: MarketRegion;
  setRegion: (region: MarketRegion) => void;
  watchlist: string[];
  watchlistItems: WatchlistEntry[];
  watchlistLoading: boolean;
  watchlistError: string | null;
  watchlistNotice: string | null;
  refreshWatchlist: () => Promise<void>;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  toggleWatchlist: (symbol: string) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  currency: 'AUTO',
  defaultChartStyle: 'candlestick',
  showChartGrid: true,
  compactTables: false,
  priceAlertsEnabled: true,
  aiDigestEnabled: true,
  newsAlertsEnabled: false,
  sessionTimeoutMinutes: 60,
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Aarav Mehta',
  email: 'analyst@bullsight.preview',
  role: 'Quantitative Analyst (Preview)',
  preferredRegion: 'ALL',
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'NVDA Sample Breakout Threshold',
    detail: 'Sample quote crossed above 20-day moving reference ($140.10).',
    timestamp: '12m ago',
    read: false,
    symbol: 'NVDA',
  },
  {
    id: 'notif-2',
    title: 'INFY Illustrative AI Update',
    detail: '30D illustrative scenario envelope updated for IT Services basket.',
    timestamp: '1h ago',
    read: false,
    symbol: 'INFY',
  },
  {
    id: 'notif-3',
    title: 'TATAMOTORS Volatility Alert',
    detail: 'Sample intraday pullback exceeded -2.0% threshold.',
    timestamp: '3h ago',
    read: true,
    symbol: 'TATAMOTORS',
  },
];

const AppContext = createContext<AppContextValue | undefined>(undefined);

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<MarketRegion>('ALL');
  const [watchlistItems, setWatchlistItems] = useState<WatchlistEntry[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState<boolean>(true);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);
  const [watchlistNotice, setWatchlistNotice] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>(() =>
    safeLoad('bullsight_settings', DEFAULT_SETTINGS)
  );
  const [profile, setProfile] = useState<UserProfile>(() =>
    safeLoad('bullsight_profile', DEFAULT_PROFILE)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const refreshWatchlist = useCallback(async (signal?: AbortSignal) => {
    setWatchlistLoading(true);
    setWatchlistError(null);
    try {
      const res = await stockService.fetchWatchlist(signal);
      setWatchlistItems(res.items || []);
      setWatchlist(res.symbols || (res.items || []).map((i) => i.symbol));
      setWatchlistNotice(res.persistenceNotice || null);
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'REQUEST_ABORTED') return;
      setWatchlistError(
        error instanceof Error ? error.message : 'Failed to load watchlist from backend.'
      );
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refreshWatchlist(controller.signal);
    return () => controller.abort();
  }, [refreshWatchlist]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('bg-[#101512]', 'text-[#E8F0EA]');
      document.body.classList.remove('bg-[#f4f7f5]', 'text-[#101814]');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('bg-[#101512]', 'text-[#E8F0EA]');
      document.body.classList.add('bg-[#f4f7f5]', 'text-[#101814]');
    }
    try {
      localStorage.setItem('bullsight_settings', JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('bullsight_profile', JSON.stringify(profile));
    } catch {
      // ignore storage errors
    }
  }, [profile]);

  const addToWatchlist = useCallback(async (symbol: string) => {
    const upper = symbol.trim().toUpperCase();
    setWatchlistError(null);
    try {
      const res = await stockService.addToWatchlist(upper);
      setWatchlistItems((prev) =>
        prev.some((i) => i.symbol === res.item.symbol) ? prev : [...prev, res.item]
      );
      setWatchlist((prev) => (prev.includes(res.item.symbol) ? prev : [...prev, res.item.symbol]));
      if (res.persistenceNotice) setWatchlistNotice(res.persistenceNotice);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        return;
      }
      setWatchlistError(
        error instanceof Error ? error.message : `Failed to add ${upper} to watchlist.`
      );
    }
  }, []);

  const removeFromWatchlist = useCallback(async (symbol: string) => {
    const upper = symbol.trim().toUpperCase();
    setWatchlistError(null);
    try {
      await stockService.removeFromWatchlist(upper);
      setWatchlistItems((prev) => prev.filter((item) => item.symbol !== upper));
      setWatchlist((prev) => prev.filter((item) => item !== upper));
    } catch (error) {
      setWatchlistError(
        error instanceof Error ? error.message : `Failed to remove ${upper} from watchlist.`
      );
    }
  }, []);

  const toggleWatchlist = useCallback(
    async (symbol: string) => {
      const upper = symbol.trim().toUpperCase();
      if (watchlist.includes(upper)) {
        await removeFromWatchlist(upper);
      } else {
        await addToWatchlist(upper);
      }
    },
    [watchlist, addToWatchlist, removeFromWatchlist]
  );

  const isInWatchlist = useCallback(
    (symbol: string) => watchlist.includes(symbol.toUpperCase()),
    [watchlist]
  );

  const updateSettings = (patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <AppContext.Provider
      value={{
        region,
        setRegion,
        watchlist,
        watchlistItems,
        watchlistLoading,
        watchlistError,
        watchlistNotice,
        refreshWatchlist: () => refreshWatchlist(),
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        settings,
        updateSettings,
        toggleTheme,
        profile,
        updateProfile,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
