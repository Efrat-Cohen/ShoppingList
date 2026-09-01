import { UpstreamError, type FieldError, type Order } from '../types';
import type { OrdersService } from './types';

export function createHttpOrdersService(baseUrl: string): OrdersService {
  return {
    async createOrder(order) {
      const response = await send(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const body = (await response.json().catch(() => null)) as OrderResponse | null;

      if (!response.ok) {
        // A rejection from the orders service is passed through as-is: it already speaks in
        // the same field/code vocabulary the browser understands.
        throw new UpstreamError(response.status, body?.errors ?? fallback);
      }

      if (typeof body?.orderId !== 'string') {
        throw new UpstreamError(502, fallback);
      }

      return { orderId: body.orderId };
    },

    async getOrder(orderId) {
      const response = await send(`${baseUrl}/api/orders/${encodeURIComponent(orderId)}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new UpstreamError(502, fallback);
      }

      const body = (await response.json().catch(() => null)) as Order | null;

      if (!body) {
        throw new UpstreamError(502, fallback);
      }

      return body;
    },
  };
}

type OrderResponse = { orderId?: unknown; errors?: FieldError[] };

const fallback: FieldError[] = [{ field: '', code: 'orders_unavailable' }];

async function send(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new UpstreamError(503, fallback);
  }
}
