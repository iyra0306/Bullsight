const axios = require('axios');

// Python FastAPI ML Microservice URL
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';

const pythonClient = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'BullSight-Express-Gateway/1.0'
  }
});

// Generic forwarder to Python FastAPI with error transformation
async function forwardToFastAPI(endpoint, options = {}) {
  try {
    const response = await pythonClient({
      url: endpoint,
      method: options.method || 'GET',
      params: options.params,
      data: options.data,
      headers: options.headers
    });
    return response.data;
  } catch (err) {
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.detail || err.message;
      const error = new Error(detail);
      error.statusCode = status;
      throw error;
    } else if (err.code === 'ECONNREFUSED') {
      const error = new Error(`Python ML microservice unavailable at ${PYTHON_SERVICE_URL}. Please ensure backend is running.`);
      error.statusCode = 503;
      throw error;
    } else {
      throw err;
    }
  }
}

// Controller Handlers
async function getCatalog(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/stocks');
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function searchCatalog(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/stocks/search', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getStockSummary(req, res, next) {
  try {
    const { symbol } = req.params;
    const data = await forwardToFastAPI(`/api/stocks/${symbol}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getStockHistory(req, res, next) {
  try {
    const { symbol } = req.params;
    const data = await forwardToFastAPI(`/api/stocks/${symbol}/history`, { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getIndicators(req, res, next) {
  try {
    const { symbol } = req.params;
    const data = await forwardToFastAPI(`/api/stocks/${symbol}/indicators`);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getPrediction(req, res, next) {
  try {
    const { symbol } = req.params;
    const data = await forwardToFastAPI(`/api/stocks/${symbol}/prediction`, { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getMarketOverview(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/market/overview');
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getScreener(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/screener', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getNews(req, res, next) {
  try {
    const symbol = req.params.symbol || 'ALL';
    const data = await forwardToFastAPI(`/api/news/${symbol}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function askAIChat(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/ai/chat', { method: 'POST', data: req.body });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getModelMetrics(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/model/metrics');
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function triggerTraining(req, res, next) {
  try {
    const data = await forwardToFastAPI('/api/model/train', { method: 'POST', params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCatalog,
  searchCatalog,
  getStockSummary,
  getStockHistory,
  getIndicators,
  getPrediction,
  getMarketOverview,
  getScreener,
  getNews,
  askAIChat,
  getModelMetrics,
  triggerTraining,
  forwardToFastAPI,
  PYTHON_SERVICE_URL
};
