import express, { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { buildCorsOptions } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * Creates a self-contained Express Router for `/api` containing
 * security headers, CORS, JSON parsing, logging, routes, 404, and error handling.
 * Can be mounted inside standalone `backend/server.js` or the single-port preview server.
 */
export function createApiBundle() {
  const apiRouter = Router();

  apiRouter.use(helmet());
  apiRouter.use(cors(buildCorsOptions()));
  apiRouter.use(express.json({ limit: '100kb' }));

  if (env.NODE_ENV !== 'test') {
    apiRouter.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  apiRouter.use(apiRoutes);
  apiRouter.use(notFound);
  apiRouter.use(errorHandler);

  return apiRouter;
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', createApiBundle());
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
