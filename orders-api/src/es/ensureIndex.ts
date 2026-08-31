import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { es, ORDERS_INDEX } from './client';

// The index definition lives in elasticsearch/orders-mapping.json rather than in code, so the
// exact same file can be applied by hand (curl -X PUT localhost:9200/orders -d @...) and by
// the server on startup. Resolved relative to the compiled file: dist/es -> ../../elasticsearch.
const mappingFile = path.join(__dirname, '..', '..', 'elasticsearch', 'orders-mapping.json');

export async function waitForElasticsearch(maxAttempts = 20): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await es.ping();
      return;
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
      console.warn(`elasticsearch not reachable yet (attempt ${attempt}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

export async function ensureOrdersIndex(): Promise<void> {
  if (await es.indices.exists({ index: ORDERS_INDEX })) {
    return;
  }

  const definition = JSON.parse(await readFile(mappingFile, 'utf8'));
  await es.indices.create({ index: ORDERS_INDEX, ...definition });
  console.log(`created index "${ORDERS_INDEX}" from ${path.basename(mappingFile)}`);
}
