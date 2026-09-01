import { createApp } from './app';
import { createHttpCatalogService } from './services/httpCatalogService';
import { createHttpOrdersService } from './services/httpOrdersService';

// Composition root: the only place that picks implementations for the two ports.
// Swapping either one for a fake - in a test, or against a stub service - happens here
// and nowhere else.
const catalog = createHttpCatalogService(process.env.CATALOG_SERVICE_URL ?? 'http://localhost:5080');
const orders = createHttpOrdersService(process.env.ORDERS_SERVICE_URL ?? 'http://localhost:4000');

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const port = Number(process.env.PORT ?? 4100);

createApp({ catalog, orders, allowedOrigins }).listen(port, () => {
  console.log(`bff listening on port ${port}`);
});
