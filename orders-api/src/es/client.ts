import { Client } from '@elastic/elasticsearch';

export const ORDERS_INDEX = process.env.ORDERS_INDEX ?? 'orders';

export const es = new Client({
  node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
});
