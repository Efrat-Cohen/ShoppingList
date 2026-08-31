# orders-api

Takes the order from the summary screen and stores it in Elasticsearch. Express 5 on
TypeScript.

## Running it

```bash
docker compose up --build
```

That starts Elasticsearch and this API together, on port 4000.

Without docker, with Elasticsearch already reachable:

```bash
npm install
npm run dev
```

On startup the service pings Elasticsearch until it answers, then creates the `orders` index
from [`elasticsearch/orders-mapping.json`](elasticsearch/orders-mapping.json) if it does not
exist yet. That file is the mapping - it is read at runtime rather than duplicated in code,
so `curl -X PUT localhost:9200/orders -d @elasticsearch/orders-mapping.json` applies exactly
the same thing.

## Endpoints

**`POST /api/orders`**

```json
{
  "customer": { "fullName": "אפרת כהן", "address": "הרצל 15, תל אביב", "email": "efrat@example.com" },
  "items": [
    { "productId": 1, "productName": "עגבניות", "categoryId": 1, "categoryName": "פירות וירקות", "unit": "ק\"ג", "quantity": 2 }
  ]
}
```

Answers `201` with the stored document, including the generated `orderId` and `createdAt`.

**`GET /api/orders/:orderId`** reads one back. **`GET /health`** is the compose health check.

## Validation

zod, in [`src/schemas/order.ts`](src/schemas/order.ts). A rejected request comes back as
`400` with codes, not sentences:

```json
{ "errors": [{ "field": "customer.email", "code": "invalid_email" }] }
```

The UI is Hebrew and all of its copy lives in the client's strings file, so the server does
not ship user-facing text. Codes in use: `required`, `too_long`, `invalid_email`,
`empty_cart`, `not_found`, `server_error`.

## The mapping

`items` is a **nested** field so a query can match on one item's fields together rather than
across the whole array. `dynamic: strict` means a document with an unexpected field is
rejected instead of quietly widening the mapping. One shard, no replicas - it is a
single-node setup.

Hebrew text goes through the standard analyzer, which tokenizes it well enough for this. Real
Hebrew search would want a language-specific analyzer.

## Configuration

| Environment variable | Default |
| --- | --- |
| `ELASTICSEARCH_URL` | `http://localhost:9200` |
| `ORDERS_INDEX` | `orders` |
| `PORT` | `4000` |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` |
