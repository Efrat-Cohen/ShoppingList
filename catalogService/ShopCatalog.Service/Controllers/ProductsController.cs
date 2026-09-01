using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopCatalog.Service.Data;
using ShopCatalog.Service.Dtos;

namespace ShopCatalog.Service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(CatalogDbContext db) : ControllerBase
{
    // Products carry their category id rather than being nested inside a category. Which of
    // the two a caller wants together is the caller's business, not this service's.
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAll(CancellationToken cancellationToken)
    {
        var products = await db.Products
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto(p.Id, p.Name, p.Unit, p.CategoryId))
            .ToListAsync(cancellationToken);

        return Ok(products);
    }
}
