# Shopping list

A two-screen shopping list: pick products from a catalog, then fill in delivery details and
send the order. The UI is in Hebrew; everything else - code, comments, docs - is in English.

```
browser ──▶ frontend (nginx)
                └── /api/* ──▶ bff ──┬──▶ catalogService   .NET 10  ──▶ SQL Server
                                     └──▶ ordersService    Express  ──▶ Elasticsearch
```

| Folder | What it is | Stack |
| --- | --- | --- |
| [`frontend/`](frontend) | Both screens | React 19, Redux Toolkit, Vite |
| [`bff/`](bff) | The only backend the browser talks to | Express 5, TypeScript |
| [`catalogService/`](catalogService) | Categories and products | .NET 10, EF Core, SQL Server |
| [`ordersService/`](ordersService) | Stores submitted orders | Express 5, TypeScript, Elasticsearch |

The two services are not published to the host - the BFF is the single entry point in front
of them. Each service folder has its own `docker-compose.yml` if you want to run one on its
own and call it directly.

## Running it

Docker is the only thing you need installed.

```bash
docker compose up --build
```

Then open **http://localhost:3000**.

There is no setup step. The catalog service applies its migrations and seeds the database on
startup, and the orders service creates its Elasticsearch index from
[`ordersService/elasticsearch/orders-mapping.json`](ordersService/elasticsearch/orders-mapping.json)
if it is missing. Each layer waits for the one below it to report healthy, so the first page
load already has data behind it.

The first build pulls SQL Server, Elasticsearch and the .NET SDK image - roughly 4 GB, a few
minutes. Give Docker at least 4 GB of memory; SQL Server alone wants 2 GB.

| Reachable from the host | URL |
| --- | --- |
| The app | http://localhost:3000 |
| BFF | http://localhost:4100/api/catalog/categories |
| Elasticsearch | http://localhost:9200/orders/_search |

## The two screens

**Screen one - shopping list.** The whole catalog, categories with their products, arrives in
a single request when the page mounts. Two dropdowns: choosing a category filters the product
dropdown to that category's products. Quantity starts at 1. "הוסף מוצר לסל" puts the product
in the cart, which is shown alongside; adding a product that is already there tops up its
quantity rather than adding a second line.

**Screen two - order summary.** Full name, address and email, all required, plus an email
format check. The selected products and their quantities are listed next to the form.
"אשר הזמנה" posts the order to the BFF, which validates it, hands it to the orders service,
and answers with an order id.

## A few decisions worth explaining

**The BFF is the single entry point.** The frontend has one backend to know about and one
error vocabulary, and does not need to know that categories come from a .NET service and
orders go to a Node one. It deliberately does not re-fetch the catalog when an order is
submitted: the client loaded it on page load and picked each product out of a category, so a
cart line already carries the product name, unit and category. What the BFF does at that
boundary is validate, reject a product that appears twice, and normalise failures from either
service.

**The BFF's dependencies are injected.** `bff/src/services/types.ts` declares the two ports
it is written against. `bff/src/index.ts` is the only file that picks the HTTP
implementations; routers and the app itself never import them. Swapping either service for a
fake is a one-line change in one place.

**No prices anywhere.** The assignment does not ask for them, so the model does not carry
them. Products do carry a unit, which is what makes a quantity mean something - "2 ק"ג"
rather than a bare "2".

**Thunks and slices, not RTK Query.** One backend with two endpoints, no caching or
invalidation to speak of. RTK Query would be infrastructure without a payoff at this size.

**One origin.** nginx serves the built app and proxies `/api/*` to the BFF; Vite's dev server
does the same in development. CORS never comes up in the browser.

**All Hebrew lives in one file.** [`frontend/src/i18n/strings.ts`](frontend/src/i18n/strings.ts)
holds every string the user sees, including error messages and the tab title. The backends
validate but answer with stable codes (`required`, `invalid_email`, `duplicate_product`) rather
than sentences, and the frontend turns those into Hebrew.

## What is not here

No tests, no authentication, no pagination. The database credentials are in
`docker-compose.yml` in plain text, which is fine for a demo and not fine anywhere else.
Elasticsearch runs with security disabled and a single node.
