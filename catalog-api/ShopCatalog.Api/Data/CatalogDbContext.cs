using Microsoft.EntityFrameworkCore;
using ShopCatalog.Api.Models;

namespace ShopCatalog.Api.Data;

public class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(80).IsRequired();
            entity.HasIndex(c => c.DisplayOrder);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.Property(p => p.Name).HasMaxLength(120).IsRequired();
            entity.Property(p => p.Unit).HasMaxLength(20).IsRequired();
            entity.HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        SeedData.Apply(modelBuilder);
    }
}
