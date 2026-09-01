using Microsoft.EntityFrameworkCore;
using ShopCatalog.Service.Models;

namespace ShopCatalog.Service.Data;

// The catalog is static for this assignment, so it ships inside the migration.
// A fresh database is therefore usable without any manual seeding step.
internal static class SeedData
{
    private const string Kg = "ק\"ג";
    private const string Each = "יח'";

    public static void Apply(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "פירות וירקות", DisplayOrder = 1 },
            new Category { Id = 2, Name = "מוצרי חלב", DisplayOrder = 2 },
            new Category { Id = 3, Name = "בשר ודגים", DisplayOrder = 3 },
            new Category { Id = 4, Name = "מאפים", DisplayOrder = 4 },
            new Category { Id = 5, Name = "יבשים ושימורים", DisplayOrder = 5 },
            new Category { Id = 6, Name = "ניקיון", DisplayOrder = 6 });

        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, CategoryId = 1, Name = "עגבניות", Unit = Kg },
            new Product { Id = 2, CategoryId = 1, Name = "מלפפונים", Unit = Kg },
            new Product { Id = 3, CategoryId = 1, Name = "בננות", Unit = Kg },
            new Product { Id = 4, CategoryId = 1, Name = "תפוחים", Unit = Kg },
            new Product { Id = 5, CategoryId = 1, Name = "גזר", Unit = Kg },
            new Product { Id = 6, CategoryId = 1, Name = "חסה", Unit = Each },

            new Product { Id = 7, CategoryId = 2, Name = "חלב 3%", Unit = Each },
            new Product { Id = 8, CategoryId = 2, Name = "קוטג' 5%", Unit = Each },
            new Product { Id = 9, CategoryId = 2, Name = "גבינה צהובה", Unit = Each },
            new Product { Id = 10, CategoryId = 2, Name = "יוגורט טבעי", Unit = Each },
            new Product { Id = 11, CategoryId = 2, Name = "חמאה", Unit = Each },
            new Product { Id = 12, CategoryId = 2, Name = "שמנת מתוקה", Unit = Each },

            new Product { Id = 13, CategoryId = 3, Name = "חזה עוף", Unit = Kg },
            new Product { Id = 14, CategoryId = 3, Name = "שניצל הודו", Unit = Kg },
            new Product { Id = 15, CategoryId = 3, Name = "בשר טחון", Unit = Kg },
            new Product { Id = 16, CategoryId = 3, Name = "פילה סלמון", Unit = Kg },
            new Product { Id = 17, CategoryId = 3, Name = "נקניקיות", Unit = Each },

            new Product { Id = 18, CategoryId = 4, Name = "לחם אחיד פרוס", Unit = Each },
            new Product { Id = 19, CategoryId = 4, Name = "לחמניות", Unit = Each },
            new Product { Id = 20, CategoryId = 4, Name = "פיתות", Unit = Each },
            new Product { Id = 21, CategoryId = 4, Name = "חלה", Unit = Each },
            new Product { Id = 22, CategoryId = 4, Name = "בורקס גבינה", Unit = Each },

            new Product { Id = 23, CategoryId = 5, Name = "אורז", Unit = Each },
            new Product { Id = 24, CategoryId = 5, Name = "פסטה", Unit = Each },
            new Product { Id = 25, CategoryId = 5, Name = "קמח", Unit = Each },
            new Product { Id = 26, CategoryId = 5, Name = "סוכר", Unit = Each },
            new Product { Id = 27, CategoryId = 5, Name = "טונה בשמן", Unit = Each },
            new Product { Id = 28, CategoryId = 5, Name = "תירס משומר", Unit = Each },

            new Product { Id = 29, CategoryId = 6, Name = "נוזל כלים", Unit = Each },
            new Product { Id = 30, CategoryId = 6, Name = "אבקת כביסה", Unit = Each },
            new Product { Id = 31, CategoryId = 6, Name = "מגבות נייר", Unit = Each },
            new Product { Id = 32, CategoryId = 6, Name = "שקיות זבל", Unit = Each },
            new Product { Id = 33, CategoryId = 6, Name = "מטהר אוויר", Unit = Each });
    }
}
