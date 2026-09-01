import { Router } from 'express';
import type { CatalogService } from '../services/types';

export function createCatalogRouter(catalog: CatalogService): Router {
  const router = Router();

  router.get('/categories', async (_req, res) => {
    res.json(await catalog.getCategories());
  });

  return router;
}
