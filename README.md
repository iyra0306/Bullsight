# 🐂 BULLSIGHT — AI Stock Intelligence

> **Tagline:** “See the Bull. Predict the Move.”  
> **Academic Project Title:** *“Real-Time Stock Trend Prediction and Analytics Dashboard Using Deep Learning”*  
> **Evaluation Profile:** BEE (Backend Engineering & Enterprise Web Development) + AI/ML Capstone

---

## 📌 Project Overview

**BullSight** is an enterprise-grade financial technology platform combining quantitative stock market intelligence, deep learning price forecasting, and a scalable multi-tier web architecture.

The platform continuously processes real-time equity market data from Yahoo Finance (`yfinance`), computes institutional-grade technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands), executes time-series inference via a **2-layer Sequential LSTM (Long Short-Term Memory) Neural Network**, and provides real-time portfolio management, watchlist persistence, and conversational AI guidance.

---

## 🏛️ BEE Compliant Enterprise Architecture

To meet rigorous enterprise backend requirements, BullSight implements a decoupled **Three-Tier Microservices Architecture**:

```text
+-----------------------------------------------------------------------+
|                       CLIENT TIER (Port 3000)                         |
|     React 18 + Vite • Tailwind CSS • Plotly Pro & Recharts • Lucide   |
+-----------------------------------+-----------------------------------+
                                    |
                                    | REST API (HTTP/JSON)
                                    v
+-----------------------------------------------------------------------+
|             ENTERPRISE REST API GATEWAY (Port 5000)                  |
|                   Node.js 20+ & Express.js                            |
|-----------------------------------------------------------------------|
|  • Security Middleware (Helmet HTTP headers, CORS whitelisting)      |
|  • Rate Limiting (express-rate-limit: general & AI strict tiers)      |
|  • Request Validation & Sanitization (Ticker, Body, Param schemas)   |
|  • Centralized Error Handling & Uniform JSON Responses                |
|  • SQLite3 Database Persistence (Watchlist & Portfolio CRUD)          |
|  • Reverse Proxy & Microservice Orchestration                         |
+------------------+--------------------------------+-------------------+
                   |                                |
       Database    |                    Proxied ML  |
       Operations  |                    Inference   |
                   v                                v
+---------------------------+    +--------------------------------------+
|     PERSISTENCE TIER      |    |        AI / ML SERVICE TIER          |
|   SQLite / PostgreSQL     |    |            (Port 8000)               |
|  (bullsight.db / PG)      |    |       Python 3.11+ / FastAPI         |
|---------------------------|    |--------------------------------------|
| • users                   |    | • TensorFlow / Keras 2-Layer LSTM    |
| • watchlists              |    | • Feature Engineering (Pandas/NumPy) |
| • portfolios & holdings   |    | • Technical Indicators (RSI, MACD)   |
| • prediction_records      |    | • Real-Time Yahoo Finance Ingestion  |
+---------------------------+    +--------------------------------------+
```

---

## 🎯 BEE Requirements & Syllabus Compliance Mapping

| BEE Syllabus Area | BullSight Enterprise Implementation | Location in Codebase |
| :--- | :--- | :--- |
| **1. Frontend Development** | React 18, Vite build tool, modular UI components, centralized Axios client, responsive Tailwind CSS styling, dynamic loading/error states, dark/light themes. | [`frontend/src/`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/frontend/src) |
| **2. Node.js & Express.js** | Production Express.js application acting as an Enterprise API Gateway with routing, modular controllers, and service orchestration. | [`server/src/app.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/app.js), [`server/src/server.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/server.js) |
| **3. REST API Design** | Standards-compliant REST endpoints (`GET`, `POST`, `DELETE`), semantic HTTP codes (`200`, `201`, `400`, `404`, `500`), uniform JSON formats. | [`server/src/routes/`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/routes/) |
| **4. Database Integration** | SQLite3 persistence layer with connection pooling, parameterized SQL queries against SQL injection, schema migrations, and relational modeling. | [`server/src/config/db.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/config/db.js), [`server/src/controllers/userController.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/controllers/userController.js) |
| **5. Frontend-Backend Integration** | Reverse-proxying via Vite (`/api` -> port 5000), cross-origin request handling (CORS), environment variable base URLs, seamless microservice handoff. | [`frontend/vite.config.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/frontend/vite.config.js), [`server/src/controllers/stocksController.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/controllers/stocksController.js) |
| **6. Validation & Error Handling** | Regex-based ticker sanitization, payload property validation, global Express error-handling middleware preventing stack leakages. | [`server/src/middleware/validator.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/middleware/validator.js), [`server/src/middleware/errorHandler.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/middleware/errorHandler.js) |
| **7. API Security & Rate Limiting** | Helmet HTTP security headers, CORS origin whitelisting, IP-based sliding-window rate limiters (300 req/5m standard, 60 req/1m strict for AI). | [`server/src/middleware/rateLimiter.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/src/middleware/rateLimiter.js) |
| **8. Automated Testing** | Automated unit and integration testing suite in Jest + Supertest for Express gateway, plus pytest suite for Python ML backend. | [`server/tests/api.test.js`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/server/tests/api.test.js), [`backend/tests/test_api.py`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/backend/tests/test_api.py) |
| **9. Deployment & DevOps** | Multi-container Docker Compose configuration (`postgres`, `backend`, `gateway`, `frontend`) and one-click automated cross-platform startup scripts. | [`docker-compose.yml`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/docker-compose.yml), [`run_project.bat`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/run_project.bat), [`run_project.ps1`](file:///c:/Users/Iyra's/OneDrive/Desktop/college/aiml/bullsight/run_project.ps1) |

---

## 🚀 Quick Start Instructions

### Prerequisites
- **Python 3.10+** (installed with PATH enabled)
- **Node.js 18+** & **npm** (installed with PATH enabled)

### Option 1: One-Click Startup (Recommended for Teammates)

#### Windows:
Double-click `run_project.bat` or run in PowerShell:
```powershell
.\run_project.ps1
```

#### macOS / Linux:
```bash
chmod +x run_project.sh
./run_project.sh
```

The script automatically:
1. Creates the Python virtual environment and installs backend packages.
2. Configures environment variables.
3. Installs Express Gateway dependencies in `server/`.
4. Installs React frontend dependencies in `frontend/`.
5. Spawns all three services and launches `http://localhost:3000` in your default browser.

---

### Option 2: Manual Step-by-Step Launch

#### 1. Start Python FastAPI ML Engine
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Express.js Enterprise API Gateway
```bash
cd server
npm install
npm start
# Gateway listens on http://localhost:5000
```

#### 3. Start React Vite Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard opens on http://localhost:3000
```

---

## 📡 REST API Gateway Endpoints (`server/`)

| Method | Endpoint | Description | Handled By |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Multi-tier health check (Gateway, DB, ML Service) | Express Gateway |
| `GET` | `/api/user/watchlist` | Retrieve saved stocks from SQLite database | Express Gateway (SQLite) |
| `POST` | `/api/user/watchlist` | Add stock symbol to persistent watchlist | Express Gateway (SQLite) |
| `DELETE`| `/api/user/watchlist/:symbol` | Remove stock symbol from persistent watchlist | Express Gateway (SQLite) |
| `GET` | `/api/user/portfolio` | Retrieve user portfolio holdings from SQLite | Express Gateway (SQLite) |
| `POST` | `/api/user/portfolio` | Record a portfolio purchase (symbol, qty, buy price) | Express Gateway (SQLite) |
| `DELETE`| `/api/user/portfolio/:identifier` | Delete a holding by symbol or ID | Express Gateway (SQLite) |
| `GET` | `/api/stocks/:symbol` | Validates ticker, proxies live quote from ML engine | Express -> FastAPI |
| `GET` | `/api/stocks/:symbol/history` | Historical OHLCV candlesticks | Express -> FastAPI |
| `GET` | `/api/stocks/:symbol/indicators` | Real-time technical indicators (RSI, MACD, SMA) | Express -> FastAPI |
| `GET` | `/api/predictions/:symbol` | Deep learning LSTM sequence forecast & metrics | Express -> FastAPI |
| `GET` | `/api/market/overview` | Major indices (S&P 500, Nifty 50, NASDAQ, Sensex) | Express -> FastAPI |
| `GET` | `/api/screener` | Quantitative stock screening results | Express -> FastAPI |
| `GET` | `/api/news/:symbol` | Financial news feed & NLP sentiment analysis | Express -> FastAPI |
| `POST` | `/api/ai/chat` | AI Copilot query answering & conversational advisor | Express -> FastAPI |

---

## 🧪 Automated Testing & Verification

### Running Express Gateway Tests (Jest & Supertest)
```bash
cd server
npm test
```
**Results:**
- `11 passed, 11 total`
- Tests verify: Service health check, ticker validation regex, payload body validation, watchlist CRUD, portfolio holdings CRUD, and centralized 404 error formatting.

### Running Python ML Service Tests (Pytest)
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests/test_api.py -v
```
**Results:**
- `5 passed, 5 total`
- Tests verify: FastAPI health check, market overview endpoint, live equity quote retrieval, technical indicator calculations, and LSTM prediction inference outputs.

### Running Frontend Production Build (Vite)
```bash
cd frontend
npm run build
```
**Results:**
- Clean compile with 2,293 modules transformed and production assets created in `frontend/dist/`.

---

## 🐳 Docker Containerization

To run the entire multi-tier stack in isolated Docker containers:
```bash
docker-compose up --build
```
This provisions:
- `bullsight-postgres` (PostgreSQL relational database)
- `bullsight-backend` (FastAPI Python ML service)
- `bullsight-gateway` (Node.js/Express.js REST API Gateway)
- `bullsight-frontend` (Nginx serving production React Vite bundle)

---

## 👥 Contributors & Academic Evaluation
- **Course:** BEE (Backend Engineering & Enterprise Web Development) / AI-ML Capstone
- **Project:** BullSight AI Stock Market Intelligence
- **Repository:** [https://github.com/iyra0306/Bullsight.git](https://github.com/iyra0306/Bullsight.git)
