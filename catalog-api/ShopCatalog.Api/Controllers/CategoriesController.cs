using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopCatalog.Api.Data;
using ShopCatalog.Api.Dtos;

namespace ShopCatalog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(CatalogDbContext db) : ControllerBase
{
    // The shopping list screen loads the whole catalog in one request, so the products
    // are projected inline instead of forcing a second round trip per category.
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await db.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Products
                    .OrderBy(p => p.Name)
                    .Select(p => new ProductDto(p.Id, p.Name, p.Unit))
                    .ToList()))
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }
}
