import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

test.before(async () => {
  process.env.NODE_ENV = 'test';
  const app = createApp();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function apiFetch(path, options = {}) {
  const res = await fetch(`${baseUrl}${path}`, options);
  const body = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, body };
}

test('GET /api/health returns application health and timestamp', async () => {
  const { status, body } = await apiFetch('/api/health');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.application, 'BULLSIGHT API');
  assert.equal(body.data.status, 'ok');
  assert.equal(body.data.apiVersion, 'v1');
  assert.ok(Date.parse(body.data.timestamp));
});

test('GET /api/market/overview returns NIFTY 50, SENSEX, NASDAQ, and S&P 500 sample indices', async () => {
  const { status, body } = await apiFetch('/api/market/overview');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.isSampleData, true);
  assert.equal(body.data.dataStatus, 'sample');
  const symbols = body.data.indices.map((i) => i.symbol);
  assert.deepEqual(symbols, ['NIFTY 50', 'SENSEX', 'NASDAQ', 'S&P 500']);
});

test('GET /api/market/movers returns topGainers, topLosers, and mostActive', async () => {
  const { status, body } = await apiFetch('/api/market/movers?region=ALL&limit=3');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.topGainers.length, 3);
  assert.equal(body.data.topLosers.length, 3);
  assert.equal(body.data.mostActive.length, 3);
});

test('GET /api/stocks returns supported stocks list', async () => {
  const { status, body } = await apiFetch('/api/stocks');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.stocks.length >= 10);
});

test('GET /api/stocks/search?q=apple finds Apple Inc.', async () => {
  const { status, body } = await apiFetch('/api/stocks/search?q=apple');
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.stocks.some((s) => s.symbol === 'AAPL'));
});

test('GET /api/stocks/search without q returns 400 validation error', async () => {
  const { status, body } = await apiFetch('/api/stocks/search');
  assert.equal(status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'MISSING_SEARCH_QUERY');
});

test('GET /api/stocks/:symbol returns stock details and handles unknown/invalid symbols', async () => {
  const valid = await apiFetch('/api/stocks/nvda');
  assert.equal(valid.status, 200);
  assert.equal(valid.body.data.symbol, 'NVDA');

  const missing = await apiFetch('/api/stocks/UNKNOWNXYZ');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.error.code, 'STOCK_NOT_FOUND');

  const invalid = await apiFetch('/api/stocks/BAD$SYM!');
  assert.equal(invalid.status, 400);
  assert.equal(invalid.body.error.code, 'INVALID_SYMBOL');
});

test('GET /api/stocks/:symbol/history supports periods and validates invalid parameters', async () => {
  const ok = await apiFetch('/api/stocks/RELIANCE/history?period=1M&interval=1d');
  assert.equal(ok.status, 200);
  assert.equal(ok.body.data.symbol, 'RELIANCE');
  assert.equal(ok.body.data.period, '1M');
  assert.ok(ok.body.data.bars.length > 0);

  const badPeriod = await apiFetch('/api/stocks/RELIANCE/history?period=2W');
  assert.equal(badPeriod.status, 400);
  assert.equal(badPeriod.body.error.code, 'INVALID_PERIOD');

  const badInterval = await apiFetch('/api/stocks/RELIANCE/history?period=1M&interval=9h');
  assert.equal(badInterval.status, 400);
  assert.equal(badInterval.body.error.code, 'INVALID_INTERVAL');

  const badRange = await apiFetch(
    '/api/stocks/RELIANCE/history?period=1Y&from=2026-11-20&to=2026-10-01'
  );
  assert.equal(badRange.status, 400);
  assert.equal(badRange.body.error.code, 'INVALID_DATE_RANGE');
});

test('Watchlist GET, POST, and DELETE lifecycle works with validation', async () => {
  const initial = await apiFetch('/api/watchlist');
  assert.equal(initial.status, 200);
  assert.equal(initial.body.data.storageMode, 'in-memory-dev-store');
  assert.equal(initial.body.data.isPersistentDatabase, false);

  const added = await apiFetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: 'MSFT', notes: 'Cloud watch' }),
  });
  assert.equal(added.status, 201);
  assert.equal(added.body.data.item.symbol, 'MSFT');

  const dup = await apiFetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: 'MSFT' }),
  });
  assert.equal(dup.status, 409);

  const removed = await apiFetch('/api/watchlist/MSFT', { method: 'DELETE' });
  assert.equal(removed.status, 200);
  assert.equal(removed.body.data.removedSymbol, 'MSFT');

  const notFound = await apiFetch('/api/watchlist/MSFT', { method: 'DELETE' });
  assert.equal(notFound.status, 404);
});

test('GET /api/news and GET /api/news/:id return demonstration articles with filtering', async () => {
  const list = await apiFetch('/api/news?category=Macro&page=1&limit=5');
  assert.equal(list.status, 200);
  assert.equal(list.body.data.dataStatus, 'demonstration');
  assert.ok(list.body.data.articles.every((a) => a.category === 'Macro'));

  const detail = await apiFetch('/api/news/news-1');
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.id, 'news-1');

  const missing = await apiFetch('/api/news/news-999');
  assert.equal(missing.status, 404);
});

test('AI Prediction endpoints return explicit 503 when Python service is unconfigured and 400 on invalid params', async () => {
  const getPred = await apiFetch('/api/predictions/NVDA?horizon=30D');
  assert.equal(getPred.status, 503);
  assert.equal(getPred.body.success, false);
  assert.equal(getPred.body.error.code, 'AI_SERVICE_UNAVAILABLE');

  const postPred = await apiFetch('/api/predictions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol: 'NVDA', horizon: '14D', model: 'lstm-ensemble-v1' }),
  });
  assert.equal(postPred.status, 503);
  assert.equal(postPred.body.error.code, 'AI_SERVICE_UNAVAILABLE');

  const badHorizon = await apiFetch('/api/predictions/NVDA?horizon=365D');
  assert.equal(badHorizon.status, 400);
  assert.equal(badHorizon.body.error.code, 'INVALID_FORECAST_HORIZON');

  const history = await apiFetch('/api/predictions/NVDA/history');
  assert.equal(history.status, 503);
});

test('404 handler, malformed JSON error handler, and CORS policy work properly', async () => {
  const notFound = await apiFetch('/api/does-not-exist');
  assert.equal(notFound.status, 404);
  assert.equal(notFound.body.error.code, 'ROUTE_NOT_FOUND');

  const badJson = await apiFetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{bad json',
  });
  assert.equal(badJson.status, 400);
  assert.equal(badJson.body.error.code, 'INVALID_JSON_BODY');

  const allowedCors = await apiFetch('/api/health', {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(allowedCors.status, 200);
  assert.equal(
    allowedCors.headers.get('access-control-allow-origin'),
    'http://localhost:3000'
  );

  const blockedCors = await apiFetch('/api/health', {
    headers: { Origin: 'https://untrusted-site.example.com' },
  });
  assert.equal(blockedCors.status, 403);
});
