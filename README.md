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

Docker is the only thing you need installed - no .NET SDK, no Node, no SQL Server, no
Elasticsearch. Docker Desktop on Windows or macOS, or Docker Engine with the Compose plugin
on Linux.

```bash
git clone <repository-url>
cd homeTest
docker compose up --build
```

Then open **http://localhost:3000**.

There is no setup step. The catalog service applies its migrations and seeds the database on
startup, and the orders service creates its Elasticsearch index from
[`ordersService/elasticsearch/orders-mapping.json`](ordersService/elasticsearch/orders-mapping.json)
if it is missing. Each layer waits for the one below it to report healthy, so the first page
load already has data behind it.

The first build is heavy: about 6.8 GB of images on disk once everything is unpacked, a
smaller compressed download, and a few minutes. Nearly three quarters of that is SQL Server
(2.3 GB) and Elasticsearch (2.6 GB), both of which the assignment asked for and neither of
which publishes a slim image. Of the rest, the 1.25 GB .NET SDK image is build-time only and
never runs. It is all cached after the first time.

Give Docker at least 4 GB of memory; SQL Server alone wants 2 GB.

| Reachable from the host | URL |
| --- | --- |
| The app | http://localhost:3000 |
| BFF | http://localhost:4100/api/catalog |
| Elasticsearch | http://localhost:9200/orders/_search |

`catalogService`, `ordersService` and SQL Server are on the internal network only - the BFF is
the entry point. To reach one directly, use its own compose file, or go through a container
that is on the network:

```bash
docker compose exec bff node -e "fetch('http://catalog-service:8080/api/products').then(r => r.text()).then(console.log)"
```

### Checking it worked

```bash
docker compose ps                          # six services, the five with checks say healthy
curl http://localhost:3000/api/catalog     # 6 categories, 33 products
curl http://localhost:9200/orders/_search  # orders you have placed
```

### If something goes wrong

| Symptom | Cause and fix |
| --- | --- |
| `port is already allocated` | Something else holds 3000, 4100 or 9200. Change the left-hand number of the `ports:` entry in `docker-compose.yml`. |
| `catalog-service` never turns healthy | SQL Server wants 2 GB to itself. Raise Docker's memory limit to at least 4 GB and bring the stack up again. |
| `elasticsearch` exits straight away on Linux | `vm.max_map_count` is too low: `sudo sysctl -w vm.max_map_count=262144`. |
| The page loads but the catalog does not | `docker compose logs catalog-service bff`. The catalog service is most likely still applying migrations. |
| The first build looks stuck | It is pulling around 4 GB of images. `docker compose logs -f` shows progress. |

### Removing it

Three levels, each including the one above it:

```bash
docker compose down                  # containers and network; keeps the databases and images
docker compose down -v               # also deletes the seeded SQL Server and Elasticsearch data
docker compose down -v --rmi all     # also deletes the images, including the ones that were pulled
```

The last one leaves nothing behind - use it when you are finished reviewing. Docker will not
delete an image another container is still using, so shared bases like `node:24-alpine` stay
if something else on your machine needs them. Use `--rmi local` instead of `--rmi all` to drop
only the four images built from this repository and keep the pulled ones.

Running `docker compose down -v` and then `docker compose up --build` is also how you start
over from empty databases without removing anything else.

If you also ran a service on its own from its folder, that is a separate compose project with
its own container and volume, and the command above does not touch it:

```bash
docker compose -f catalogService/docker-compose.yml down -v --rmi local
docker compose -f ordersService/docker-compose.yml down -v --rmi local
```

To confirm the machine is clean, both of these should print nothing but a header:

```bash
docker ps -a   --filter name=shopping-list --filter name=catalog-service --filter name=orders-service
docker volume ls --filter name=shopping-list --filter name=catalog-service --filter name=orders-service
```

## The two screens

**Screen one - shopping list.** The whole catalog arrives in a single request when the page
mounts. Two dropdowns: choosing a category filters the product
dropdown to that category's products. Quantity starts at 1. "הוסף מוצר לסל" puts the product
in the cart, which is shown alongside; adding a product that is already there tops up its
quantity rather than adding a second line.

**Screen two - order summary.** Full name, address and email, all required, plus an email
format check. The selected products and their quantities are listed next to the form.
"אשר הזמנה" posts the order to the BFF, which validates it, hands it to the orders service,
and answers with an order id.

## A few decisions worth explaining

**Categories and products are two resources.** The catalog service exposes
`GET /api/categories` and `GET /api/products`, and products carry a `categoryId`. Nesting the
products inside a category would bake one screen's layout into the service's contract, and
would mean you cannot ask for the category list without downloading the whole catalog. The
BFF fetches both in parallel and hands the screen one payload, so a page load is still a
single request. The store keeps the two lists flat and filters.

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
