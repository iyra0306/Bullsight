const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route modules
const healthRoutes = require('./routes/health.routes');
const stocksRoutes = require('./routes/stocks.routes');
const predictionsRoutes = require('./routes/predictions.routes');
const marketRoutes = require('./routes/market.routes');
const newsRoutes = require('./routes/news.routes');
const aiRoutes = require('./routes/ai.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers with Request Size Limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply Rate Limiting to all /api routes
app.use('/api', apiLimiter);

// Mount Modular API Routes under /api prefix
app.use('/api', healthRoutes);
app.use('/api', stocksRoutes);
app.use('/api', predictionsRoutes);
app.use('/api', marketRoutes);
app.use('/api', newsRoutes);
app.use('/api', aiRoutes);
app.use('/api', userRoutes);

// Root Health & Gateway Info
app.get('/', (req, res) => {
  res.json({
    name: 'BullSight Enterprise REST API Gateway',
    version: '1.0.0',
    tagline: 'See the Bull. Predict the Move.',
    status: 'online',
    docs: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
