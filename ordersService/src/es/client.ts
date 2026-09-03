import { Client } from '@elastic/elasticsearch';

export const ORDERS_INDEX = process.env.ORDERS_INDEX ?? 'orders';

// A stalled cluster has to fail a request rather than hold it open indefinitely. Ten seconds
// rather than something tighter because writing an order uses refresh: 'wait_for', which
// blocks on purpose until the index refreshes - normally about a second, but several times
// that when the cluster is busy. A deadline under that turns a slow write into a failed one.
export const es = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  requestTimeout: 10_000,
  pingTimeout: 3000,
  maxRetries: 2,
});
