# Guide: Skapa PostgreSQL Migration

## Steg 1: Hämta Connection String från Render

1. Gå till [Render Dashboard](https://dashboard.render.com)
2. Öppna din PostgreSQL-databas (`hittly-db`)
3. Kopiera **"Internal Database URL"** eller **"Connection String"**
   - Format: `postgresql://user:password@host:port/database`
   - Eller: `Host=...;Port=...;Database=...;Username=...;Password=...`

## Steg 2: Sätt Connection String

### Alternativ A: Environment Variable (Rekommenderat)
```bash
export ConnectionStrings__DefaultConnection="<din-connection-string-här>"
```

### Alternativ B: Temporär appsettings.Development.json
Lägg till connection string i `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<din-connection-string-här>"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## Steg 3: Skapa Migration

```bash
cd backend
dotnet ef migrations add FixPostgreSQLMigration
```

## Steg 4: Testa Migration Lokalt

```bash
dotnet ef database update
```

## Steg 5: Verifiera

Kontrollera att migrationen skapades korrekt:
```bash
dotnet ef migrations list
```

## Steg 6: Committa och Pusha

```bash
git add backend/Migrations/
git commit -m "Fix: Add proper PostgreSQL migration"
git push
```

## OBS

- **Ta bort connection string från appsettings.Development.json efter testning** (för säkerhet)
- Migrationen kommer automatiskt köras vid nästa deployment till Render
- Om du använder environment variable, kom ihåg att den bara gäller för den nuvarande terminal-sessionen

