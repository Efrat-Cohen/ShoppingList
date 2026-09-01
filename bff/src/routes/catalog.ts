import { Router } from 'express';
import type { CatalogService } from '../services/types';

export function createCatalogRouter(catalog: CatalogService): Router {
  const router = Router();

  // The catalog service exposes categories and products as two resources. Putting them
  // together for the screen that needs both is this layer's job, not the service's - and
  // one page load stays one request.
  router.get('/', async (_req, res) => {
    const [categories, products] = await Promise.all([
      catalog.getCategories(),
      catalog.getProducts(),
    ]);

    res.json({ categories, products });
  });

  return router;
}
