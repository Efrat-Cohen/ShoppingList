# bff

The only backend the browser talks to. It sits in front of `catalogService` and
`ordersService`, neither of which is published to the host.

## What it does

**Composes the catalog.** The catalog service exposes categories and products as two
resources. This service fetches both in parallel and answers with the pair, so one page load
is still one request from the browser.

```json
{
  "categories": [{ "id": 1, "name": "פירות וירקות" }],
  "products": [{ "id": 3, "name": "בננות", "unit": "ק\"ג", "categoryId": 1 }]
}
```

**Resolves an order.** A line the browser sends is `{ productId, categoryId, quantity }` and
nothing else. This service looks each one up in the catalog and fills in the product name, its
unit and the category name before handing the order on, so a stored order says what the
catalog says and not what a client claimed. A line whose product is not in the catalog, or
sits in a different category than the client thinks, comes back as `400` with
`unknown_product`. It also rejects a product that appears on two lines.

**Calls both services with a deadline.** Five seconds for the catalog, fifteen for an order:
writing waits on Elasticsearch refreshing, and giving up before the orders service has is the
one failure worth avoiding outright - the order is stored, the customer is told it was not,
and they send it again. Neither service is believed on its word either; a `200` whose body is
not the shape we asked for is a `502`.

There is deliberately **no route for reading an order back**. A stored order holds a name, an
address and an email, nothing in front of this service authenticates anyone, and no screen
asks for one.

## Dependency injection

[`src/services/types.ts`](src/services/types.ts) declares the two ports this service is
written against:

```ts
export interface CatalogService { getCategories(): Promise<Category[]>; }
export interface OrdersService  { createOrder(...): Promise<{ orderId: string }>; }
```

Routers take them as arguments - `createOrdersRouter(catalog, orders)` - and
[`src/index.ts`](src/index.ts) is the composition root, the only file that names the HTTP
implementations. Running the whole app against fakes is a change in that one file. No DI
container: in an Express app this size, factory functions taking their dependencies as
arguments are dependency injection.

## Endpoints

| | |
| --- | --- |
| `GET /api/catalog` | `{ categories, products }` - both resources fetched in parallel |
| `POST /api/orders` | Resolves each line against the catalog, then stores. `201` with `{ orderId }` |
| `GET /health` | Compose health check |

Errors are `{ errors: [{ field, code }] }`, never prose - the UI is Hebrew and its copy lives
in the frontend. A rejection from a service behind this one keeps its status and codes; an
unreachable one becomes `503` with `catalog_unavailable` or `orders_unavailable`.

## Running it

It needs both services behind it, so the sensible way is the root `docker compose up --build`.
Standalone, against services already running:

```bash
npm install
CATALOG_SERVICE_URL=http://localhost:5080 ORDERS_SERVICE_URL=http://localhost:4000 npm run dev
```

## Tests

```bash
npm test
npm run lint
```

Nine, on Node's own test runner through `tsx`. Seven cover the two routes:
[`src/testing/support.ts`](src/testing/support.ts) holds a fake for each port and starts the
app on a port the OS picks, so a test asserts on what the app actually handed to
`OrdersService` rather than on a call log - the payoff of the injection above. The other two,
in [`src/services/httpCatalogService.test.ts`](src/services/httpCatalogService.test.ts), run
against a real HTTP server for the two failures that only exist in the layer speaking HTTP: a
service that never answers, and a `200` that is not a catalog.

## Configuration

| Environment variable | Default |
| --- | --- |
| `CATALOG_SERVICE_URL` | `http://localhost:5080` |
| `ORDERS_SERVICE_URL` | `http://localhost:4000` |
| `PORT` | `4100` |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` |
| `CATALOG_TIMEOUT_MS` | `5000` |
| `ORDERS_TIMEOUT_MS` | `15000` - must stay above the orders service's own deadline |
