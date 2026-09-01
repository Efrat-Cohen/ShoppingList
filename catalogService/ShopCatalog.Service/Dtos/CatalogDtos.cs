namespace ShopCatalog.Service.Dtos;

public record CategoryDto(int Id, string Name);

public record ProductDto(int Id, string Name, string Unit, int CategoryId);
