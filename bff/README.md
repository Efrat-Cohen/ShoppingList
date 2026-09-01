# bff

The backend for frontend. The only backend the browser talks to; it sits in front of
`catalogService` and `ordersService` and neither of them is exposed to the host.

## What it does

It is the single entry point. The frontend has one backend to know about, one origin, one
error vocabulary - it does not need to know that categories come from a .NET service and
orders go to a Node one, or that either might move.

**It composes the catalog.** The catalog service exposes categories and products as two
resources, each describing itself. This service fetches both in parallel and returns
`{ categories, products }`, so one page load is still one request from the browser. Shaping
data for a screen is exactly what this layer is for - a service should not have a screen's
layout baked into its contract.

It does not re-fetch the catalog to build an order. The client loaded the whole catalog on
page load and picked each product out of a category, so a cart line already carries the
product name, unit and category. Asking the catalog service again on every submit would be a
round trip for data the caller already holds. What this service does do at that boundary is
validate the shape, reject a product that appears on two lines, and normalise failures from
either service into the same `{ field, code }` envelope.

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
| `GET /api/catalog` | `{ categories, products }` - both catalog resources, fetched in parallel |
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
