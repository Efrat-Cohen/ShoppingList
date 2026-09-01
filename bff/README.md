# bff

The backend for frontend. The only backend the browser talks to; it sits in front of
`catalogService` and `ordersService` and neither of them is exposed to the host.

## What it actually does

It is not a proxy. Two jobs earn it its place:

**It resolves products.** The browser posts an order as ids and quantities only:

```json
{ "customer": { "...": "..." }, "items": [{ "productId": 16, "quantity": 2 }] }
```

The BFF looks each id up in the catalog service and fills in the product name, unit, category
id and category name before handing the order to the orders service. The client is never the
source of truth for what it is buying, and an id that is not in the catalog comes back as
`unknown_product` instead of being stored.

**It gives the two screens one API.** Screen one reads from the catalog service, screen two
writes to the orders service, and the frontend does not need to know that.

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
| `GET /api/catalog/categories` | Every category with its products |
| `POST /api/orders` | Resolves products, then stores. `201` with `{ orderId }` |
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
