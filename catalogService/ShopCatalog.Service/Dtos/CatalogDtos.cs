namespace ShopCatalog.Service.Dtos;

public record ProductDto(int Id, string Name, string Unit);

public record CategoryDto(int Id, string Name, IReadOnlyList<ProductDto> Products);
