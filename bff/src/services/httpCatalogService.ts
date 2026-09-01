import { UpstreamError, type Category, type Product } from '../types';
import type { CatalogService } from './types';

export function createHttpCatalogService(baseUrl: string): CatalogService {
  return {
    getCategories: () => get<Category[]>(`${baseUrl}/api/categories`),
    getProducts: () => get<Product[]>(`${baseUrl}/api/products`),
  };
}

async function get<T>(url: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new UpstreamError(503, [{ field: '', code: 'catalog_unavailable' }]);
  }

  if (!response.ok) {
    throw new UpstreamError(503, [{ field: '', code: 'catalog_unavailable' }]);
  }

  return (await response.json()) as T;
}
