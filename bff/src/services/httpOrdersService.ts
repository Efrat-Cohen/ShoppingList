import { createdOrderSchema, errorBodySchema } from '../schemas/upstream';
import { UpstreamError, type FieldError } from '../types';
import type { OrdersService } from './types';

export function createHttpOrdersService(baseUrl: string, timeoutMs: number): OrdersService {
  return {
    async createOrder(order) {
      const response = await send(`${baseUrl}/api/orders`, timeoutMs, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        // A rejection from the orders service is passed through as-is: it already speaks in
        // the same field/code vocabulary the browser understands. One that does not becomes
        // ours to describe.
        const errors = errorBodySchema.safeParse(body);
        throw new UpstreamError(response.status, errors.success ? errors.data.errors : fallback);
      }

      const created = createdOrderSchema.safeParse(body);

      if (!created.success) {
        throw new UpstreamError(502, fallback);
      }

      return created.data;
    },
  };
}

const fallback: FieldError[] = [{ field: '', code: 'orders_unavailable' }];

async function send(url: string, timeoutMs: number, init?: RequestInit): Promise<Response> {
  try {
    // See httpCatalogService: a hung service must fail this request rather than hold it open.
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    throw new UpstreamError(503, fallback);
  }
}
