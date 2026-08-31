# Shopping list

A two-screen shopping list: pick products from a catalog, then fill in delivery details and
send the order. The UI is in Hebrew; everything else - code, comments, docs - is in English.

Three parts, each in its own folder and each runnable on its own:

| Folder | What it is | Stack |
| --- | --- | --- |
| [`client/`](client) | Both screens | React 19, Redux Toolkit, Vite |
| [`catalog-api/`](catalog-api) | Categories and products for screen one | .NET 10, EF Core, SQL Server |
| [`orders-api/`](orders-api) | Stores submitted orders for screen two | Express 5, TypeScript, Elasticsearch |

## Running it

Docker is the only thing you need installed.

```bash
docker compose up --build
```

Then open **http://localhost:3000**.

There is no setup step. The catalog API applies its migrations and seeds the database on
startup, and the orders API creates its Elasticsearch index from
[`orders-api/elasticsearch/orders-mapping.json`](orders-api/elasticsearch/orders-mapping.json)
if it is missing. The web container waits for both APIs to report healthy before it starts,
so the first page load already has data behind it.

The first build pulls SQL Server, Elasticsearch and the .NET SDK image - roughly 4 GB, a few
minutes. Give Docker at least 4 GB of memory; SQL Server alone wants 2 GB.

| Service | URL | Notes |
| --- | --- | --- |
| Web | http://localhost:3000 | The app. Also proxies both APIs, so the browser sees one origin |
| Catalog API | http://localhost:5080/api/categories | |
| Orders API | http://localhost:4000/api/orders | `POST` to create, `GET /:orderId` to read back |
| SQL Server | `localhost,1433` | user `sa`, password `Str0ng.Passw0rd` |
| Elasticsearch | http://localhost:9200/orders/_search | |

Each service also has its own `docker-compose.yml` if you want to run just that one, and its
own README with the details.

## The two screens

**Screen one - shopping list.** The whole catalog, categories with their products, arrives in
a single request when the page mounts. Two dropdowns: choosing a category filters the product
dropdown to that category's products. Quantity starts at 1. "הוסף מוצר לסל" puts the product
in the cart, which is shown alongside; adding a product that is already there tops up its
quantity rather than adding a second line.

**Screen two - order summary.** Full name, address and email, all required, plus an email
format check. The selected products and their quantities are listed next to the form.
"אשר הזמנה" posts the whole thing to the orders API, which stores it in Elasticsearch and
answers with an order id.

## A few decisions worth explaining

**No prices anywhere.** The assignment does not ask for them, so the model does not carry
them. Products do carry a unit, which is what makes a quantity mean something - "2 ק"ג"
rather than a bare "2".

**Thunks and slices, not RTK Query.** Two separate backends with one endpoint each. RTK Query
would be infrastructure without a payoff at this size.

**One origin.** nginx proxies `/api/catalog/*` and `/api/orders/*` to the two services, and
Vite's dev server does the same thing in development, so CORS never comes up in the browser.
CORS is still configured on both APIs for anyone running the client from somewhere else.

**All Hebrew lives in one file.** [`client/src/i18n/strings.ts`](client/src/i18n/strings.ts)
holds every string the user sees, including error messages. The orders API validates with
zod but answers with stable codes (`required`, `invalid_email`, `empty_cart`) rather than
sentences, and the client turns those into Hebrew. A server has no business shipping copy.

## What is not here

No tests, no authentication, no pagination. The database credentials are in
`docker-compose.yml` in plain text, which is fine for a demo and not fine anywhere else.
Elasticsearch runs with security disabled and a single node.
