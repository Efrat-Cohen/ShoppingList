FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ShopCatalog.Api/ShopCatalog.Api.csproj ShopCatalog.Api/
RUN dotnet restore ShopCatalog.Api/ShopCatalog.Api.csproj

COPY . .
RUN dotnet publish ShopCatalog.Api/ShopCatalog.Api.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# curl is here only so docker compose can health-check /health; the image ships without it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ShopCatalog.Api.dll"]
