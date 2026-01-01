# Testa PostgreSQL lokalt

Denna guide hjälper dig att testa backend med PostgreSQL lokalt innan deployment till Render.

## Förutsättningar

1. PostgreSQL installerat lokalt (eller Docker)
2. .NET 9.0 SDK

## Steg 1: Installera PostgreSQL

### macOS (med Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Alternativt med Docker:
```bash
docker run --name postgres-hittly -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hittly -p 5432:5432 -d postgres:16
```

## Steg 2: Skapa databas

```bash
# Om du använder lokal PostgreSQL
createdb hittly

# Eller via psql:
psql -U postgres
CREATE DATABASE hittly;
\q
```

## Steg 3: Sätt connection string

Sätt environment variable innan du kör applikationen:

```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=hittly;Username=postgres;Password=postgres"
```

Eller skapa en `appsettings.Development.json` fil (eller uppdatera den befintliga):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hittly;Username=postgres;Password=postgres"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## Steg 4: Skapa ny migration för PostgreSQL

Eftersom befintliga migrations är för SQLite, behöver vi skapa en ny migration för PostgreSQL:

```bash
cd backend
dotnet ef migrations add PostgreSQLInitialCreate
```

## Steg 5: Applicera migrations

```bash
dotnet ef database update
```

## Steg 6: Kör applikationen

```bash
dotnet run
```

API:et bör nu vara tillgängligt på `http://localhost:5048`

## Felsökning

Om du får fel om att migrations redan finns:
- Ta bort gamla migrations (eller skapa en ny databas)
- Eller använd `dotnet ef database drop` för att ta bort databasen och börja om

Om du får connection errors:
- Kontrollera att PostgreSQL körs: `pg_isready` eller `docker ps`
- Kontrollera att port 5432 är tillgänglig
- Verifiera användarnamn och lösenord

