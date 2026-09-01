import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import express from 'express';
import { createCatalogRouter } from './routes/catalog';
import { createOrdersRouter } from './routes/orders';
import type { CatalogService, OrdersService } from './services/types';
import { UpstreamError } from './types';

export type Dependencies = {
  catalog: CatalogService;
  orders: OrdersService;
  allowedOrigins: string[];
};

// Everything the app needs is handed in. Nothing in here knows how to reach the two
// services, which is what makes the whole app testable against fakes.
export function createApp({ catalog, orders, allowedOrigins }: Dependencies) {
  const app = express();

  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/catalog', createCatalogRouter(catalog));
  app.use('/api/orders', createOrdersRouter(catalog, orders));

  app.use(handleErrors);

  return app;
}

const handleErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  // A failure behind this service keeps its own status and codes rather than collapsing
  // into a 500 the browser cannot say anything useful about.
  if (error instanceof UpstreamError) {
    console.warn(`upstream failure: ${error.status}`, error.errors);
    res.status(error.status).json({ errors: error.errors });
    return;
  }

  console.error(error);
  res.status(500).json({ errors: [{ field: '', code: 'server_error' }] });
};
