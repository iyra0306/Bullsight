/**
 * Request Validation Middleware for Enterprise REST APIs
 */

function validateSymbol(req, res, next) {
  const symbol = (req.params.symbol || req.query.symbol || '').trim().toUpperCase();
  if (!symbol) {
    return res.status(400).json({ success: false, detail: 'Stock symbol parameter is required.' });
  }

  // Allow standard tickers (AAPL), Indian NSE (.NS / .BO), and Crypto/ETF pairs (BTC-USD)
  const symbolRegex = /^[A-Z0-9_\-\.]{1,20}$/;
  if (!symbolRegex.test(symbol)) {
    return res.status(400).json({
      success: false,
      detail: `Invalid stock symbol format: '${symbol}'. Expected valid equity or crypto ticker.`
    });
  }

  req.params.symbol = symbol;
  next();
}

function validateWatchlistAdd(req, res, next) {
  const { symbol } = req.body || {};
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ success: false, detail: 'Field "symbol" is required and must be a string.' });
  }

  const clean = symbol.trim().toUpperCase();
  const symbolRegex = /^[A-Z0-9_\-\.]{1,20}$/;
  if (!symbolRegex.test(clean)) {
    return res.status(400).json({ success: false, detail: 'Invalid symbol format.' });
  }

  req.body.symbol = clean;
  next();
}

function validateHoldingAdd(req, res, next) {
  const { symbol, quantity, buy_price, name } = req.body || {};
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ success: false, detail: 'Field "symbol" is required.' });
  }

  const parsedQty = parseFloat(quantity);
  const parsedPrice = parseFloat(buy_price);

  if (isNaN(parsedQty) || parsedQty <= 0) {
    return res.status(400).json({ success: false, detail: 'Field "quantity" must be a positive number.' });
  }

  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ success: false, detail: 'Field "buy_price" must be a positive number.' });
  }

  req.body.symbol = symbol.trim().toUpperCase();
  req.body.quantity = parsedQty;
  req.body.buy_price = parsedPrice;
  req.body.name = (name || `${req.body.symbol} Position`).trim();
  next();
}

function validateAIChat(req, res, next) {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, detail: 'Field "message" must be a non-empty string.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ success: false, detail: 'Message length exceeds maximum allowable 2000 characters.' });
  }

  next();
}

module.exports = {
  validateSymbol,
  validateWatchlistAdd,
  validateHoldingAdd,
  validateAIChat
};
