using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopCatalog.Service.Data;
using ShopCatalog.Service.Dtos;

namespace ShopCatalog.Service.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(CatalogDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await db.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }
}
