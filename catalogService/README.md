# catalogService

Serves the product catalog. .NET 10 Web API, EF Core code-first against SQL Server.

In the full stack it sits behind the BFF and is not published to the host. The compose file
here runs it on its own with its port exposed, so it can be called directly.

## Running it

```bash
docker compose up --build
```

That starts SQL Server and this API together. `GET http://localhost:5080/api/categories`.

Migrations are applied on startup, retrying while SQL Server finishes booting, and the seed
data ships inside the migration - a fresh database is populated with nothing to run by hand.

Without docker you need the .NET 10 SDK and a reachable SQL Server. `appsettings.json` ships
without a password in it, so supply one once:

```bash
dotnet user-secrets set "ConnectionStrings:Catalog" \
  "Server=localhost,1433;Database=ShopCatalog;User Id=sa;Password=<password>;TrustServerCertificate=True;Encrypt=False" \
  --project ShopCatalog.Service
dotnet run --project ShopCatalog.Service
```

## Endpoints

```
GET /api/categories  ->  [{ "id": 1, "name": "פירות וירקות" }]
GET /api/products    ->  [{ "id": 3, "name": "בננות", "unit": "ק\"ג", "categoryId": 1 }]
```

Two resources, not one shape for one screen. Products carry a `categoryId`; nesting them
inside a category would make this service's contract a function of a screen's layout, which is
the BFF's job. The BFF fetches both in parallel and hands the screen one payload.

`GET /health` is `AddDbContextCheck`: it opens a connection to the database rather than
answering `ok` unconditionally, so compose stops reporting this service healthy - and stops
starting the BFF in front of it - once SQL Server is gone.

## Layout

```
ShopCatalog.Service/
├─ Models/          Category, Product
├─ Data/            CatalogDbContext, the seed, the migration runner
├─ Dtos/            what the API returns
├─ Controllers/     CategoriesController, ProductsController
└─ Migrations/      generated; the seed lives in here
```

No repository layer over EF Core - at this size it would be indirection for its own sake, and
the controllers project straight into DTOs. Products have no price; they do have a unit, which
is what a quantity is counted in.

```bash
dotnet ef migrations add <Name> --project ShopCatalog.Service
```

## Configuration

| Setting | Environment variable | Default |
| --- | --- | --- |
| Connection string | `ConnectionStrings__Catalog` | `localhost,1433`, see `appsettings.json` |
| Password | part of the connection string | none in source: compose passes `MSSQL_SA_PASSWORD` (default `Str0ng.Passw0rd`), a local run reads user-secrets |
| CORS origins | `AllowedOrigins__0`, `AllowedOrigins__1` | `http://localhost:3000`, `http://localhost:5173` |
