import { Router } from 'express';
import type { Catalog } from '../types';
import type { CatalogService } from '../services/types';

export function createCatalogRouter(catalog: CatalogService): Router {
  const router = Router();

  // The catalog service exposes categories and products as two flat resources, each
  // describing itself. This layer fetches both in parallel and hands them over together, so
  // one page load is one request without either list carrying the other's shape.
  router.get('/', async (_req, res) => {
    const [categories, products] = await Promise.all([
      catalog.getCategories(),
      catalog.getProducts(),
    ]);

    const body: Catalog = { categories, products };

    res.json(body);
  });

  return router;
}
