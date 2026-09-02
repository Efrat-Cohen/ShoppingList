# bff

The backend for frontend. The only backend the browser talks to; it sits in front of
`catalogService` and `ordersService` and neither of them is exposed to the host.

## What it does

It is the single entry point. The frontend has one backend to know about, one origin, one
error vocabulary - it does not need to know that categories come from a .NET service and
orders go to a Node one, or that either might move.

**It composes the catalog.** The catalog service exposes categories and products as two
resources, each describing itself. This service fetches both in parallel and answers with the
pair, so one page load is still one request from the browser. Both lists stay flat - a product
carries its `categoryId` and the screen filters by it - which keeps one screen's layout out of
the contract and lets the store hold a normalised catalog.

```json
{
  "categories": [{ "id": 1, "name": "פירות וירקות" }],
  "products": [{ "id": 3, "name": "בננות", "unit": "ק\"ג", "categoryId": 1 }]
}
```

**It resolves an order.** An order line the browser sends is `{ productId, categoryId,
quantity }` - nothing else. This service looks each line up in the catalog and fills in the
product name, its unit and the category name before handing the order on, so a stored order
says what the catalog says and not what a client claimed. A line whose product is not in the
catalog, or sits in a different category than the client thinks, comes back as `400` with
`unknown_product`. It also rejects a product that appears on two lines and normalises failures
from either service into the same `{ field, code }` envelope.

## Dependency injection

[`src/services/types.ts`](src/services/types.ts) declares the two ports this service is
written against:

```ts
export interface CatalogService { getCategories(): Promise<Category[]>; }
export interface OrdersService  { createOrder(...): Promise<{ orderId: string }>; ... }
```

Routers take those interfaces as arguments - `createOrdersRouter(catalog, orders)` - and
`createApp({ catalog, orders, allowedOrigins })` takes everything it needs from outside.
[`src/index.ts`](src/index.ts) is the composition root and the only file that names the HTTP
implementations. Running the whole app against fakes is a change in that one file.

No DI container. In an Express app of this size, factory functions taking their dependencies
as arguments are dependency injection, and a container would be machinery around three
objects.

## Running it

It needs both services behind it, so the sensible way is the root `docker compose up --build`.
Standalone, against services already running:

```bash
npm install
CATALOG_SERVICE_URL=http://localhost:5080 ORDERS_SERVICE_URL=http://localhost:4000 npm run dev
```

## Endpoints

| | |
| --- | --- |
| `GET /api/catalog` | `{ categories, products }` - both resources fetched in parallel, returned in one response |
| `POST /api/orders` | Takes `{ productId, categoryId, quantity }` per line, resolves each against the catalog, then stores. `201` with `{ orderId }` |
| `GET /api/orders/:orderId` | Reads one back |
| `GET /health` | Compose health check |

Errors are `{ errors: [{ field, code }] }`, never prose - the UI is Hebrew and its copy lives
in the frontend. A rejection from a service behind this one keeps its status and codes rather
than collapsing into a 500; an unreachable service becomes `503` with `catalog_unavailable`
or `orders_unavailable`.

## Configuration

| Environment variable | Default |
| --- | --- |
| `CATALOG_SERVICE_URL` | `http://localhost:5080` |
| `ORDERS_SERVICE_URL` | `http://localhost:4000` |
| `PORT` | `4100` |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` |
