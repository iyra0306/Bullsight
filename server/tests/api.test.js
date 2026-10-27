const request = require('supertest');
const app = require('../src/app');

describe('Express REST API Gateway Test Suite', () => {
    describe('GET /api/health', () => {
        it('should return health status for Express gateway and downstream services', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'healthy');
            expect(res.body).toHaveProperty('gateway', 'BullSight Node.js/Express Enterprise Gateway');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('services');
            expect(res.body.services).toHaveProperty('database');
        });
    });

    describe('Validation Middleware', () => {
        it('should reject invalid stock symbol formats', async () => {
            const res = await request(app).get('/api/stocks/INVALID$$SYMBOL');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.detail).toContain('Invalid stock symbol format');
        });

        it('should reject watchlist item with missing or invalid symbol', async () => {
            const res = await request(app)
                .post('/api/user/watchlist')
                .send({ symbol: '' });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.detail).toContain('Field "symbol" is required');
        });

        it('should reject portfolio holding with invalid quantity or price', async () => {
            const res = await request(app)
                .post('/api/user/portfolio')
                .send({ symbol: 'AAPL', quantity: -5, buy_price: 150 });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.detail).toContain('Field "quantity" must be a positive number');
        });
    });

    describe('User Watchlist Persistence (SQLite Database)', () => {
        const testSymbol = 'NVDA';

        it('should add a stock to watchlist', async () => {
            const res = await request(app)
                .post('/api/user/watchlist')
                .send({ symbol: testSymbol });
            expect([200, 201]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('symbol', testSymbol);
        });

        it('should retrieve watchlist containing the symbol', async () => {
            const res = await request(app).get('/api/user/watchlist');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const found = res.body.some(item => (typeof item === 'string' ? item : item.symbol) === testSymbol);
            expect(found).toBe(true);
        });

        it('should remove the stock from watchlist', async () => {
            const res = await request(app).delete(`/api/user/watchlist/${testSymbol}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'removed');
            expect(res.body).toHaveProperty('symbol', testSymbol);
        });
    });

    describe('User Portfolio Persistence (SQLite Database)', () => {
        const holding = { symbol: 'AAPL', quantity: 10, buy_price: 180.50 };

        it('should add a portfolio holding', async () => {
            const res = await request(app)
                .post('/api/user/portfolio')
                .send(holding);
            expect([200, 201]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('status', 'holding_added');
            expect(res.body).toHaveProperty('symbol', 'AAPL');
            expect(res.body).toHaveProperty('quantity', 10);
        });

        it('should retrieve portfolio with holdings', async () => {
            const res = await request(app).get('/api/user/portfolio');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            const found = res.body.some(item => item.symbol === 'AAPL');
            expect(found).toBe(true);
        });

        it('should delete a portfolio holding', async () => {
            const res = await request(app).delete(`/api/user/portfolio/${holding.symbol}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'removed');
            expect(res.body).toHaveProperty('identifier', holding.symbol);
        });
    });

    describe('404 Route Handling', () => {
        it('should return standardized 404 JSON for non-existent endpoint', async () => {
            const res = await request(app).get('/api/non-existent-route');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('success', false);
            expect(res.body.detail).toContain('not found');
        });
    });
});
