import { ApiError } from '../utils/apiError.js';
import { marketDataService } from './marketDataService.js';

/**
 * Temporary Phase 2 Development Watchlist Store
 * Uses in-memory process state; data resets when the Node.js process restarts.
 * Designed with async method boundaries for direct migration to MongoDB/Mongoose in Phase 3.
 */
const devWatchlistStore = new Map([
  ['NVDA', { symbol: 'NVDA', addedAt: '2026-11-23T08:00:00.000Z', notes: '' }],
  ['RELIANCE', { symbol: 'RELIANCE', addedAt: '2026-11-23T08:05:00.000Z', notes: '' }],
  ['TCS', { symbol: 'TCS', addedAt: '2026-11-23T08:10:00.000Z', notes: '' }],
  ['AAPL', { symbol: 'AAPL', addedAt: '2026-11-23T08:15:00.000Z', notes: '' }],
  ['INFY', { symbol: 'INFY', addedAt: '2026-11-23T08:20:00.000Z', notes: '' }],
]);

export const watchlistService = {
  getStorageMetadata() {
    return {
      storageMode: 'in-memory-dev-store',
      isPersistentDatabase: false,
      persistenceNotice:
        'Temporary in-memory watchlist for Phase 2 development. Migrates to MongoDB & Mongoose in Phase 3.',
    };
  },

  async getAll() {
    const entries = Array.from(devWatchlistStore.values());
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const quote = await marketDataService.getStockDetails(entry.symbol);
        return {
          ...entry,
          quote,
        };
      })
    );

    return {
      items: enriched,
      symbols: entries.map((e) => e.symbol),
      ...this.getStorageMetadata(),
    };
  },

  async add(symbol, notes = '') {
    // Verify symbol exists in market universe before adding
    const quote = await marketDataService.getStockDetails(symbol);
    const normalizedSymbol = quote.symbol;

    if (devWatchlistStore.has(normalizedSymbol)) {
      throw ApiError.conflict(
        `Symbol "${normalizedSymbol}" is already in the development watchlist.`,
        { symbol: normalizedSymbol },
        'WATCHLIST_DUPLICATE'
      );
    }

    const sanitizedNotes = typeof notes === 'string' ? notes.trim().slice(0, 240) : '';
    const record = {
      symbol: normalizedSymbol,
      addedAt: new Date().toISOString(),
      notes: sanitizedNotes,
    };

    devWatchlistStore.set(normalizedSymbol, record);

    return {
      item: { ...record, quote },
      ...this.getStorageMetadata(),
    };
  },

  async remove(symbol) {
    const normalized = symbol.trim().toUpperCase();
    if (!devWatchlistStore.has(normalized)) {
      throw ApiError.notFound(
        `Symbol "${normalized}" is not present in the watchlist.`,
        { symbol: normalized },
        'WATCHLIST_ITEM_NOT_FOUND'
      );
    }
    devWatchlistStore.delete(normalized);
    return {
      removedSymbol: normalized,
      ...this.getStorageMetadata(),
    };
  },
};
