import type { ErrorRequestHandler } from 'express';
import cors from 'cors';
import express from 'express';
import { ensureOrdersIndex, waitForElasticsearch } from './es/ensureIndex';
import { ordersRouter } from './routes/orders';

const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/orders', ordersRouter);

const handleErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ errors: [{ field: '', code: 'server_error' }] });
};

app.use(handleErrors);

async function start(): Promise<void> {
  await waitForElasticsearch();
  await ensureOrdersIndex();

  app.listen(port, () => {
    console.log(`orders-api listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('orders-api failed to start', error);
  process.exit(1);
});
