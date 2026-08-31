# catalog-api

Serves the product catalog for the shopping list screen. .NET 10 Web API, EF Core code-first
against SQL Server.

## Running it

```bash
docker compose up --build
```

That starts SQL Server and this API together. `GET http://localhost:5080/api/categories`.

The API applies its migrations on startup, retrying while SQL Server finishes booting, and
the seed data ships inside the migration - so a fresh database is populated with no manual
step. There is nothing to run by hand.

Without docker you need the .NET 10 SDK and a reachable SQL Server:

```bash
dotnet run --project ShopCatalog.Api
```

## Endpoints

`GET /api/categories` returns every category with its products nested inside. The shopping
list screen loads the whole catalog in one request, so there is no per-category endpoint.

```json
[
  {
    "id": 1,
    "name": "פירות וירקות",
    "products": [{ "id": 3, "name": "בננות", "unit": "ק\"ג" }]
  }
]
```

`GET /health` is what the compose health check calls.

## Configuration

| Setting | Environment variable | Default |
| --- | --- | --- |
| Connection string | `ConnectionStrings__Catalog` | `localhost,1433`, see `appsettings.json` |
| Allowed CORS origins | `AllowedOrigins__0`, `AllowedOrigins__1` | `http://localhost:3000`, `http://localhost:5173` |

## Layout

```
ShopCatalog.Api/
├─ Models/          Category, Product
├─ Data/            CatalogDbContext and the seed
├─ Dtos/            what the API actually returns
├─ Controllers/     CategoriesController
└─ Migrations/      generated; the seed lives in here
```

Products have no price - the assignment does not ask for one. They do have a unit, which is
what a quantity is counted in.

There is no repository layer over EF Core. At this size it would be indirection for its own
sake; the controller projects straight into DTOs.

## Changing the model

```bash
dotnet ef migrations add <Name> --project ShopCatalog.Api
```
