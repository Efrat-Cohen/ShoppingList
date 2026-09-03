# Shopping list

Two screens: pick products from a catalog, then fill in delivery details and send the order.
The UI is in Hebrew; the code is in English.

```
browser ─▶ frontend (nginx)
              └── /api/* ─▶ bff ─┬─▶ catalogService  .NET 10  ─▶ SQL Server
                                 └─▶ ordersService   Express  ─▶ Elasticsearch
```

| Folder | What it is | Stack |
| --- | --- | --- |
| [`frontend/`](frontend) | Both screens | React 19, Redux Toolkit, Vite |
| [`bff/`](bff) | The only backend the browser talks to | Express 5, TypeScript |
| [`catalogService/`](catalogService) | Categories and products | .NET 10, EF Core, SQL Server |
| [`ordersService/`](ordersService) | Stores submitted orders | Express 5, TypeScript, Elasticsearch |

The assignment asks for three components; the BFF is a fourth, added on purpose. It gives the
browser one origin and one error vocabulary, and it resolves every order line against the
catalog so a stored order says what the catalog says rather than what a client claimed.

Each service folder has its own `docker-compose.yml` too, so it can be run and called on its
own - they are written to stand alone.

## Running it

Docker is the only prerequisite. Give it at least 4 GB; SQL Server alone wants 2.

```bash
docker compose up --build
```

Then open **http://localhost:3000**. The first build pulls around 4 GB and takes a few
minutes; after that it is cached.

Migrations, seed data and the Elasticsearch index are applied on startup, and each layer waits
for the one below it to report healthy, so the first page load already has data behind it.

| Reachable from the host | |
| --- | --- |
| The app | http://localhost:3000 |
| BFF | http://localhost:4100/api/catalog |
| Elasticsearch | http://localhost:9200/orders/_search |

`catalogService`, `ordersService` and SQL Server are on the internal network only - the BFF is
the entry point.

To remove everything this project put on the machine and nothing else:

```bash
docker compose down -v --rmi all --remove-orphans && \
  docker image rm mcr.microsoft.com/dotnet/sdk:10.0 mcr.microsoft.com/dotnet/aspnet:10.0 node:24-alpine nginx:alpine; \
  docker builder prune -f
```

The second line is what compose cannot do on its own: it only removes images a service
declares, so the base images the build pulled - the 1.25 GB .NET SDK in particular - survive
it. Docker refuses to delete one something else still uses, so it is safe as written.

## Tests

```bash
cd bff && npm test          # 9
cd frontend && npm test     # 9
```

Node's built-in test runner in both - no test framework and no assertion library anywhere in
the repository. The BFF tests drive the app against fakes of its two ports; the frontend tests
cover the two reducers that hold rules rather than plumbing. `catalogService` and
`ordersService` are thin over their databases and are not covered.
[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint, typecheck and tests on every
push.

## The two screens

**Shopping list.** The whole catalog arrives in one request when the page mounts. Choosing a
category filters the product dropdown to that category. "הוסף מוצר לסל" puts the product in the
cart, which is shown alongside; adding one that is already there tops up its quantity rather
than adding a second line.

**Order summary.** Name, address and email, all required, plus an email format check. The
selected products are listed next to the form. "אשר הזמנה" posts the order to the BFF, which
validates it, hands it to the orders service, and answers with an order id.
