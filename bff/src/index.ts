import { createApp } from './app';
import { createHttpCatalogService } from './services/httpCatalogService';
import { createHttpOrdersService } from './services/httpOrdersService';

// Composition root: the only place that picks implementations for the two ports.
// Swapping either one for a fake - in a test, or against a stub service - happens here
// and nowhere else.
// Two deadlines, not one, because the two calls are not alike. Reading the catalog is a
// lookup that should be quick or not happen. Writing an order is a write that the orders
// service deliberately waits on: it holds the request until Elasticsearch has refreshed.
//
// The order here has to stay this way round. Giving up on a write before the service behind
// us has given up on it is the one failure worth avoiding entirely - the order gets stored,
// the customer is told it did not, and they place it again.
const catalogTimeoutMs = Number(process.env.CATALOG_TIMEOUT_MS ?? 5000);
const ordersTimeoutMs = Number(process.env.ORDERS_TIMEOUT_MS ?? 15_000);

const catalog = createHttpCatalogService(
  process.env.CATALOG_SERVICE_URL ?? 'http://localhost:5080',
  catalogTimeoutMs,
);

const orders = createHttpOrdersService(
  process.env.ORDERS_SERVICE_URL ?? 'http://localhost:4000',
  ordersTimeoutMs,
);

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const port = Number(process.env.PORT ?? 4100);

createApp({ catalog, orders, allowedOrigins }).listen(port, () => {
  console.log(`bff listening on port ${port}`);
});
