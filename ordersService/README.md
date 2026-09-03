# ordersService

Stores submitted orders in Elasticsearch. Express 5 on TypeScript.

In the full stack it sits behind the BFF and is not published to the host. The compose file
here runs it on its own with its port exposed, so it can be called directly; it validates its
own input either way.

## Running it

```bash
docker compose up --build
```

That starts Elasticsearch and this API together, on port 4000. Without docker, with
Elasticsearch already reachable: `npm install && npm run dev`.

On startup the service pings Elasticsearch until it answers, then creates the `orders` index
from [`elasticsearch/orders-mapping.json`](elasticsearch/orders-mapping.json) if it is
missing. The mapping is read at runtime rather than duplicated in code, so
`curl -X PUT localhost:9200/orders -d @elasticsearch/orders-mapping.json` applies exactly the
same thing.

## Endpoints

**`POST /api/orders`** answers `201` with the stored document, including the generated
`orderId` and `createdAt`. **`GET /health`** is the compose health check. There is no route
for reading an order back - an order holds a name, an address and an email, and nothing here
authenticates anyone.

```json
{
  "customer": { "fullName": "אפרת כהן", "address": "הרצל 15, תל אביב", "email": "efrat@example.com" },
  "items": [
    { "productId": 1, "productName": "עגבניות", "categoryId": 1, "categoryName": "פירות וירקות", "unit": "ק\"ג", "quantity": 2 }
  ]
}
```

Validation is zod, in [`src/schemas/order.ts`](src/schemas/order.ts). A rejected request comes
back as `400` with codes, not sentences -
`{ "errors": [{ "field": "customer.email", "code": "invalid_email" }] }` - because the UI is
Hebrew and all of its copy lives in the client.

## The mapping

`items` is a **nested** field so a query can match one item's fields together rather than
across the whole array. `dynamic: strict` rejects a document with an unexpected field instead
of quietly widening the mapping. One shard, no replicas - it is a single-node setup. Hebrew
goes through the standard analyzer, which tokenizes it well enough for this; real Hebrew
search would want a language-specific one.

## Configuration

| Environment variable | Default |
| --- | --- |
| `ELASTICSEARCH_URL` | `http://localhost:9200` |
| `ORDERS_INDEX` | `orders` |
| `PORT` | `4000` |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` |
