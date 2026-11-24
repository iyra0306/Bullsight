# BULLSIGHT Backend — Phase 2 REST API

Modular Node.js + Express.js ES Modules backend for the **BULLSIGHT** (*"See the Bull. Predict the Move."*) stock market intelligence platform.

Prepared for future phases:
- **Phase 3**: MongoDB & Mongoose persistence, JWT authentication, and bcrypt password hashing.
- **Later Phases**: Redis caching and Python FastAPI AI/ML prediction microservice.

---

## Setup & Running

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` inside `backend/`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |
| `NODE_ENV` | Runtime mode (`development`, `test`, `production`) | `development` |
| `MARKET_DATA_API_KEY` | Optional external market API key (server-side only) | `""` |
| `MARKET_DATA_PROVIDER_URL` | Optional external market API base URL | `""` |
| `NEWS_API_KEY` | Optional external news API key (server-side only) | `""` |
| `PYTHON_AI_SERVICE_URL` | Optional Python FastAPI ML prediction service URL | `""` |

### 3. Run Backend Independently
```bash
cd backend
npm run dev     # Node watch mode
# or
npm start       # Production start
```

### 4. Run Automated API Tests
```bash
cd backend
npm test
```

---

## Response Format

All endpoints return structured JSON:

**Success**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-23T23:00:00.000Z"
  }
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": {}
  },
  "timestamp": "2026-11-23T23:00:00.000Z"
}
```

---

## API Documentation

### 1. Health Check
- **Method & Path**: `GET /api/health`
- **Parameters**: None
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "application": "BULLSIGHT API",
    "status": "ok",
    "apiVersion": "v1",
    "environment": "development",
    "timestamp": "2026-11-23T23:00:00.000Z",
    "services": {
      "marketData": { "provider": "mock-sample-provider", "dataStatus": "sample", "isLiveConfigured": false },
      "news": { "provider": "demo-news-provider", "dataStatus": "demonstration", "isLiveConfigured": false },
      "aiPrediction": { "configured": false, "status": "not-configured" }
    }
  }
}
```

---

### 2. Market Overview
- **Method & Path**: `GET /api/market/overview`
- **Query Parameters**:
  - `region` (optional): `ALL` | `IN` | `US` (default `ALL`)
  - `period` (optional): `1D` | `1W` | `1M` | `3M` | `6M` | `1Y` | `5Y` | `MAX` (default `3M`)
- **Response (`200 OK`)**: Returns NIFTY 50, SENSEX, NASDAQ, and S&P 500 objects containing `name`, `symbol`, `latestValue`, `absoluteChange`, `percentageChange`, `dataTimestamp`, `dataSource`, `dataStatus` (`"sample"`), `sparkline`, and `history`.
- **Errors**: `400 INVALID_REGION`, `400 INVALID_PERIOD`

---

### 3. Market Movers
- **Method & Path**: `GET /api/market/movers`
- **Query Parameters**:
  - `region` (optional): `ALL` | `IN` | `US`
  - `limit` (optional): Integer `1..20` (default `4`)
- **Response (`200 OK`)**: Returns `topGainers`, `topLosers`, and `mostActive` arrays explicitly tagged `dataStatus: "sample"`.
- **Errors**: `400 INVALID_REGION`, `400 INVALID_PAGINATION`

---

### 4. List Supported Stocks
- **Method & Path**: `GET /api/stocks`
- **Query Parameters**:
  - `region` (`ALL` | `IN` | `US`), `exchange`, `sector`, `direction` (`ALL` | `GAINERS` | `LOSERS`)
- **Response (`200 OK`)**: `{ stocks: [...], count, dataSource, dataStatus }`

---

### 5. Search Stocks
- **Method & Path**: `GET /api/stocks/search?q=apple`
- **Query Parameters**:
  - `q` (required): Search term matched against company name, symbol, exchange, market, and sector.
- **Response (`200 OK`)**: `{ query, stocks: [...], count, dataSource, dataStatus }`
- **Errors**: `400 MISSING_SEARCH_QUERY`

---

### 6. Stock Details
- **Method & Path**: `GET /api/stocks/:symbol`
- **Path Parameters**: `symbol` (e.g. `NVDA`, `RELIANCE`, `TCS`)
- **Response (`200 OK`)**: Full stock quote, fundamentals, company metadata, `dataTimestamp`, `dataSource`, `dataStatus`.
- **Errors**: `400 INVALID_SYMBOL`, `404 STOCK_NOT_FOUND`

---

### 7. Stock Historical OHLCV
- **Method & Path**: `GET /api/stocks/:symbol/history`
- **Path Parameters**: `symbol`
- **Query Parameters**:
  - `period`: `1D` | `1W` | `1M` | `3M` | `6M` | `1Y` | `5Y` | `MAX` (default `3M`)
  - `interval`: `1m` | `5m` | `15m` | `1h` | `1d` | `1wk` | `1mo`
  - `from`: `YYYY-MM-DD`
  - `to`: `YYYY-MM-DD`
- **Response (`200 OK`)**: `{ symbol, market, exchange, currency, period, bars: [{ time, open, high, low, close, volume }], dataTimestamp, dataSource, dataStatus }`
- **Errors**: `400 INVALID_SYMBOL`, `400 INVALID_PERIOD`, `400 INVALID_INTERVAL`, `400 INVALID_DATE_RANGE`, `404 STOCK_NOT_FOUND`

---

### 8. Watchlist Foundation (Temporary In-Memory Dev Store)
- `GET /api/watchlist` — Returns saved watchlist items with current quote data and `isPersistentDatabase: false`.
- `POST /api/watchlist` — Body `{ "symbol": "MSFT", "notes": "Optional note" }` (`201 Created`). Errors: `400 INVALID_SYMBOL`, `404 STOCK_NOT_FOUND`, `409 WATCHLIST_DUPLICATE`.
- `DELETE /api/watchlist/:symbol` — Removes symbol from dev watchlist (`200 OK`). Errors: `400 INVALID_SYMBOL`, `404 WATCHLIST_ITEM_NOT_FOUND`.

---

### 9. News Foundation (Demonstration Articles)
- `GET /api/news` — Query params: `category`, `symbol`, `sentiment`, `q`, `page` (`1..1000`), `limit` (`1..50`). Returns paginated articles with `dataStatus: "demonstration"`.
- `GET /api/news/:id` — Returns a single demonstration article (`404 NEWS_NOT_FOUND`, `400 INVALID_NEWS_ID`).

---

### 10. AI Prediction Foundation (Python FastAPI Interface)
- `GET /api/predictions/:symbol?horizon=30D&model=lstm-ensemble-v1`
- `POST /api/predictions` — Body `{ "symbol": "NVDA", "horizon": "30D", "model": "lstm-ensemble-v1" }`
- `GET /api/predictions/:symbol/history`
- **Behavior**: Validates `symbol`, `horizon` (`7D`, `14D`, `30D`, `90D`), and `model` (`lstm-ensemble-v1`, `xgboost-quant-v1`, `transformer-ts-v1`). When `PYTHON_AI_SERVICE_URL` is not configured or unreachable, returns **`503 Service Unavailable`** (`AI_SERVICE_UNAVAILABLE`) with the expected FastAPI contract rather than fabricating AI predictions.

---

## Running Frontend + Backend Together

- **Unified Full-Stack Preview (Port `3000`)**:
  ```bash
  # From repository root:
  npm run dev
  ```
  Starts `server.ts`, which mounts `/api/*` using `backend/src/app.js` alongside Vite's frontend middleware.

- **Separate Terminals (Backend Port `5000` + Frontend Port `3000`)**:
  ```bash
  # Terminal 1 (Backend)
  cd backend && npm run dev

  # Terminal 2 (Frontend pointing to http://localhost:5000/api)
  VITE_API_BASE_URL="http://localhost:5000/api" npx vite --port=3000
  ```

