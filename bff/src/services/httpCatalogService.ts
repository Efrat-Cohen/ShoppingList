import { UpstreamError, type Category } from '../types';
import type { CatalogService } from './types';

export function createHttpCatalogService(baseUrl: string): CatalogService {
  return {
    async getCategories() {
      let response: Response;

      try {
        response = await fetch(`${baseUrl}/api/categories`);
      } catch {
        throw new UpstreamError(503, [{ field: '', code: 'catalog_unavailable' }]);
      }

      if (!response.ok) {
        throw new UpstreamError(503, [{ field: '', code: 'catalog_unavailable' }]);
      }

      return (await response.json()) as Category[];
    },
  };
}
