using Microsoft.EntityFrameworkCore;
using ShopCatalog.Service.Data;

const string ClientCorsPolicy = "client";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<CatalogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Catalog")));

// Only relevant when this service is run standalone; in the full stack the BFF calls it
// server-side and no browser ever reaches it directly.
builder.Services.AddCors(options => options.AddPolicy(ClientCorsPolicy, policy => policy
    .WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [])
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

await DbInitializer.ApplyMigrationsAsync(app.Services, app.Logger);

app.UseCors(ClientCorsPolicy);
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();
