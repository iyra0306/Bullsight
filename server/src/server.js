const app = require('./app');
const { DB_PATH } = require('./config/db');
const { PYTHON_SERVICE_URL } = require('./controllers/stocksController');

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('================================================================');
  console.log(`🐂 BULLSIGHT ENTERPRISE REST API GATEWAY`);
  console.log(`   Status:       ONLINE`);
  console.log(`   Port:         ${PORT}`);
  console.log(`   Gateway URL:  http://127.0.0.1:${PORT}`);
  console.log(`   Database:     ${DB_PATH}`);
  console.log(`   FastAPI ML:   ${PYTHON_SERVICE_URL}`);
  console.log('================================================================');
});

// Graceful Shutdown on termination signals
function gracefulShutdown(signal) {
  console.log(`[Express Gateway] Received ${signal}. Initiating graceful shutdown...`);
  server.close(() => {
    console.log('[Express Gateway] Closed remaining connections. Exiting process.');
    process.exit(0);
  });

  // Force exit after 5s if still hanging
  setTimeout(() => {
    console.error('[Express Gateway] Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
