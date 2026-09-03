using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using ShopCatalog.Service.Data;

const string ClientCorsPolicy = "client";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<CatalogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Catalog")));

// Answering "ok" while the database is unreachable would have compose report this service as
// healthy and start everything in front of it. AddDbContextCheck opens a connection rather
// than querying, so a health check costs the database nothing.
builder.Services.AddHealthChecks().AddDbContextCheck<CatalogDbContext>("database");

// Only relevant when this service is run standalone; in the full stack the BFF calls it
// server-side and no browser ever reaches it directly.
builder.Services.AddCors(options => options.AddPolicy(ClientCorsPolicy, policy => policy
    .WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [])
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

await DbInitializer.ApplyMigrationsAsync(app.Services, app.Logger);

// An unhandled failure answers application/problem+json rather than whatever the host would
// have done with it. The BFF turns any failure here into catalog_unavailable, so this is for
// whoever calls this service directly through its own compose file.
app.UseExceptionHandler();

app.UseCors(ClientCorsPolicy);
app.MapControllers();

// The same body the other two services answer with, so one health check reads like the next.
app.MapHealthChecks("/health", new()
{
    ResponseWriter = (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var status = report.Status == HealthStatus.Healthy ? "ok" : "unhealthy";
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { status }));
    },
});

app.Run();
