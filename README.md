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

## Installing it

Docker is the only prerequisite - [Docker Desktop](https://docs.docker.com/get-started/get-docker/)
on Windows or macOS, Docker Engine with the Compose plugin on Linux. Give it at least 4 GB;
SQL Server alone wants 2. Ports 3000, 4100 and 9200 have to be free on the host.

```bash
git clone https://github.com/Efrat-Cohen/ShoppingList.git
cd ShoppingList
docker compose up --build
```

Nothing else has to be installed: Node, the .NET SDK, SQL Server and Elasticsearch all live
inside the containers.

## Running it

Once the stack is up, open **http://localhost:3000**. The first build pulls around 4 GB and
takes a few minutes; after that it is cached. Later runs need only `docker compose up`.

Migrations, seed data and the Elasticsearch index are applied on startup, and each layer waits
for the one below it to report healthy, so the first page load already has data behind it.

| Reachable from the host | |
| --- | --- |
| The app | http://localhost:3000 |
| BFF | http://localhost:4100/api/catalog |
| Elasticsearch | http://localhost:9200/orders/_search |

`catalogService`, `ordersService` and SQL Server are on the internal network only - the BFF is
the entry point.

### From source, without Docker

Only worth it while working on the code. It needs Node 24 and the .NET 10 SDK, plus the two
databases - the per-service compose files publish them to the host, which the root one does
not:

```bash
docker compose -f catalogService/docker-compose.yml up sqlserver       # localhost:1433
docker compose -f ordersService/docker-compose.yml up elasticsearch    # localhost:9200
```

Then one terminal each, in this order:

```bash
cd catalogService/ShopCatalog.Service && dotnet run   # http://localhost:5080
cd ordersService && npm install && npm run dev        # http://localhost:4000
cd bff           && npm install && npm run dev        # http://localhost:4100
cd frontend      && npm install && npm run dev        # http://localhost:5173
```

Those are the ports each service defaults to when its environment variables are unset, so the
four find each other with no configuration, and Vite proxies `/api` to the BFF exactly as
nginx does in Docker. The one thing not in the file is the SQL Server password:
`appsettings.Development.json` deliberately leaves it out, so pass it in - `dotnet user-secrets`,
or `ConnectionStrings__Catalog` in the environment with `Password=Str0ng.Passw0rd` appended.

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
