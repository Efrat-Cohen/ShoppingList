namespace ShopCatalog.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    // What a quantity of this product counts - kilograms or single items.
    public string Unit { get; set; } = string.Empty;

    public int CategoryId { get; set; }

    public Category? Category { get; set; }
}
