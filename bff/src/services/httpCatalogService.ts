import type { z } from 'zod';
import { categoriesSchema, productsSchema } from '../schemas/upstream';
import { UpstreamError, type Category, type Product } from '../types';
import type { CatalogService } from './types';

export function createHttpCatalogService(baseUrl: string, timeoutMs: number): CatalogService {
  return {
    getCategories: () => get<Category[]>(`${baseUrl}/api/categories`, categoriesSchema, timeoutMs),
    getProducts: () => get<Product[]>(`${baseUrl}/api/products`, productsSchema, timeoutMs),
  };
}

const unavailable = [{ field: '', code: 'catalog_unavailable' }];

async function get<T>(url: string, schema: z.ZodType<T>, timeoutMs: number): Promise<T> {
  let response: Response;

  try {
    // Without a deadline a service that hangs rather than fails takes this request with it,
    // and the browser waits on a response that is never coming.
    response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    throw new UpstreamError(503, unavailable);
  }

  if (!response.ok) {
    throw new UpstreamError(503, unavailable);
  }

  // A 200 is not a promise that the body is what we asked for. 502 rather than 503: the
  // service answered, its answer is the thing we cannot use.
  const parsed = schema.safeParse(await response.json().catch(() => null));

  if (!parsed.success) {
    throw new UpstreamError(502, unavailable);
  }

  return parsed.data;
}
