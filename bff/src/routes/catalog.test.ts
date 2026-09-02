import assert from 'node:assert/strict';
import test from 'node:test';
import { categories, fakeCatalog, products, startApp } from '../testing/support';
import { UpstreamError } from '../types';

test('answers with both catalog lists in a single response', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const response = await app.request('/api/catalog');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { categories, products });
});

test('asks the catalog service for both resources at once', async (t) => {
  const asked: string[] = [];
  const app = await startApp({
    catalog: fakeCatalog({
      getCategories: async () => {
        asked.push('categories');
        return categories;
      },
      getProducts: async () => {
        asked.push('products');
        return products;
      },
    }),
  });
  t.after(app.close);

  await app.request('/api/catalog');

  assert.deepEqual(asked.sort(), ['categories', 'products']);
});

test('passes on a failure from the catalog service as 503', async (t) => {
  const app = await startApp({
    catalog: fakeCatalog({
      getProducts: async () => {
        throw new UpstreamError(503, [{ field: '', code: 'catalog_unavailable' }]);
      },
    }),
  });
  t.after(app.close);

  const response = await app.request('/api/catalog');

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { errors: [{ field: '', code: 'catalog_unavailable' }] });
});
