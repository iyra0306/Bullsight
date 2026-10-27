const { dbAsync } = require('../config/db');

/**
 * Controller for User Watchlist & Portfolio Persistence
 */

const DEFAULT_WATCHLIST = ['AAPL', 'RELIANCE.NS', 'NVDA', 'TCS.NS', 'MSFT'];

const DEFAULT_HOLDINGS = [
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', quantity: 15.0, buy_price: 180.00 },
  { id: 2, symbol: 'RELIANCE.NS', name: 'Reliance Industries', quantity: 50.0, buy_price: 2850.00 },
  { id: 3, symbol: 'NVDA', name: 'NVIDIA Corp', quantity: 10.0, buy_price: 110.00 }
];

// --- Watchlist Handlers ---

async function getWatchlist(req, res, next) {
  try {
    const rows = await dbAsync.all('SELECT symbol FROM watchlists ORDER BY created_at DESC');
    if (!rows || rows.length === 0) {
      return res.json(DEFAULT_WATCHLIST);
    }
    res.json(rows.map(r => r.symbol));
  } catch (err) {
    next(err);
  }
}

async function addWatchlist(req, res, next) {
  try {
    const { symbol } = req.body;
    const existing = await dbAsync.get('SELECT id FROM watchlists WHERE symbol = ?', [symbol]);
    if (!existing) {
      await dbAsync.run('INSERT INTO watchlists (symbol) VALUES (?)', [symbol]);
    }
    res.status(201).json({ status: 'success', symbol });
  } catch (err) {
    next(err);
  }
}

async function deleteWatchlist(req, res, next) {
  try {
    const symbol = req.params.symbol.toUpperCase();
    await dbAsync.run('DELETE FROM watchlists WHERE symbol = ?', [symbol]);
    res.json({ status: 'removed', symbol });
  } catch (err) {
    next(err);
  }
}

// --- Portfolio Handlers ---

async function getPortfolio(req, res, next) {
  try {
    const rows = await dbAsync.all('SELECT id, symbol, name, quantity, buy_price FROM holdings ORDER BY created_at DESC');
    if (!rows || rows.length === 0) {
      return res.json(DEFAULT_HOLDINGS);
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function addHolding(req, res, next) {
  try {
    const { symbol, name, quantity, buy_price } = req.body;
    const result = await dbAsync.run(
      'INSERT INTO holdings (portfolio_id, symbol, name, quantity, buy_price) VALUES (?, ?, ?, ?, ?)',
      [1, symbol, name, quantity, buy_price]
    );
    res.status(201).json({
      status: 'holding_added',
      id: result.lastID,
      symbol,
      quantity,
      buy_price
    });
  } catch (err) {
    next(err);
  }
}

async function deleteHolding(req, res, next) {
  try {
    const { identifier } = req.params;
    let result;
    if (/^\d+$/.test(identifier)) {
      result = await dbAsync.run('DELETE FROM holdings WHERE id = ?', [parseInt(identifier, 10)]);
    } else {
      result = await dbAsync.run('DELETE FROM holdings WHERE symbol = ?', [identifier.toUpperCase()]);
    }

    if (result && result.changes > 0) {
      res.json({ status: 'removed', identifier });
    } else {
      res.status(404).json({ success: false, detail: `Holding '${identifier}' not found.` });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWatchlist,
  addWatchlist,
  deleteWatchlist,
  getPortfolio,
  addHolding,
  deleteHolding
};
