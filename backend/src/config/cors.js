import { env } from './env.js';

export function buildCorsOptions() {
  const configuredOrigins = env.CLIENT_URL.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const appOrigins = [];
  if (process.env.APP_URL) {
    try {
      appOrigins.push(new URL(process.env.APP_URL).origin);
    } catch {
      // Ignore invalid runtime APP_URL
    }
  }

  const allowedOrigins = new Set([
    ...configuredOrigins,
    ...appOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
  ]);

  return {
    origin(origin, callback) {
      // Allow same-origin, server-to-server, curl, and test runner requests with no Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // Allow hosted Cloud Run / AI Studio preview origins on HTTPS when in non-strict dev
      if (env.NODE_ENV !== 'production' && /^https:\/\/[a-z0-9.-]+\.run\.app$/i.test(origin)) {
        return callback(null, true);
      }

      const corsError = new Error(`Origin "${origin}" is not allowed by BULLSIGHT CORS policy.`);
      corsError.statusCode = 403;
      corsError.code = 'CORS_ORIGIN_FORBIDDEN';
      return callback(corsError);
    },
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
}
