using Microsoft.EntityFrameworkCore;

namespace ShopCatalog.Api.Data;

internal static class DbInitializer
{
    private const int MaxAttempts = 20;

    // In docker the API starts before SQL Server finishes booting, so the first few
    // attempts are expected to fail. Each one gets its own scope: a DbContext that has
    // already thrown is not something to keep reusing.
    public static async Task ApplyMigrationsAsync(IServiceProvider services, ILogger logger)
    {
        for (var attempt = 1; ; attempt++)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();

            try
            {
                await db.Database.MigrateAsync();
                logger.LogInformation("Database is up to date.");
                return;
            }
            catch (Exception ex) when (attempt < MaxAttempts)
            {
                logger.LogWarning("Database not reachable yet (attempt {Attempt}/{Max}): {Error}",
                    attempt, MaxAttempts, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(3));
            }
        }
    }
}
