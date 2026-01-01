# Hittly Backend API

ASP.NET Core 9.0 Web API för Hittly-appen.

## Krav

- .NET 9.0 SDK
- Entity Framework Core Tools (installeras automatiskt med projektet)

## Installation

1. Navigera till backend-mappen:
```bash
cd backend
```

2. Restaurera NuGet-paket:
```bash
dotnet restore
```

3. Skapa databasen (migrations appliceras automatiskt vid första körning):
```bash
dotnet ef database update
```

## Körning

Kör projektet:
```bash
dotnet run
```

API:et kommer att vara tillgängligt på:
- HTTP: `http://localhost:5048` (porten kan variera, se output vid start)
- Swagger UI: `http://localhost:5048/swagger` (endast i Development-läge)
- Swagger JSON: `http://localhost:5048/swagger/v1/swagger.json`

## Projektstruktur

- **Controllers/**: API endpoints
- **Models/**: Entity Framework entiteter
- **Data/**: DbContext och databaslogik
- **DTOs/**: Data Transfer Objects för API requests/responses
- **Migrations/**: Entity Framework migrations

## API Endpoints

Se [PRD-dokumentationen](../../docs/Hittly-Backend-API-PRD.md) för fullständig API-dokumentation.

## Utveckling

### Skapa ny migration

```bash
dotnet ef migrations add MigrationName
```

### Applicera migrations

```bash
dotnet ef database update
```

### Ta bort senaste migration

```bash
dotnet ef migrations remove
```

## Konfiguration

Konfiguration finns i `appsettings.json`:
- Connection string för SQLite (lokalt)
- Logging-inställningar
- RemoveBg API-nyckel

## Deployment till Render

Projektet är konfigurerat för deployment till Render med PostgreSQL-databas.

### Förutsättningar
- Ett Render-konto (gratis tier)
- GitHub-repository med projektet

### Steg för deployment

1. **Pusha koden till GitHub** (om du inte redan gjort det)

2. **Logga in på Render** (https://render.com)

3. **Skapa ny PostgreSQL-databas:**
   - Klicka på "New +" → "PostgreSQL"
   - Välj "Free" plan
   - Namn: `hittly-db`
   - Klicka på "Create Database"

4. **Skapa ny Web Service:**
   - Klicka på "New +" → "Web Service"
   - Anslut ditt GitHub-repository
   - Välj repository och branch
   - Konfigurera:
     - **Name:** `hittly-backend`
     - **Environment:** `Docker`
     - **Region:** Välj närmaste region
     - **Branch:** `main` (eller din default branch)
     - **Root Directory:** `backend`
     - **Dockerfile Path:** `backend/Dockerfile`
     - **Plan:** `Free`

5. **Sätt Environment Variables:**
   - `ASPNETCORE_ENVIRONMENT` = `Production`
   - `ASPNETCORE_URLS` = `http://0.0.0.0:8080`
   - `ConnectionStrings__DefaultConnection` = (kopiera från PostgreSQL-databasens "Connection String" i Render dashboard)
   - `RemoveBg__ApiKey` = (din RemoveBg API-nyckel)

6. **Alternativt: Använd render.yaml**
   - Om du använder `render.yaml` i root-mappen, kan Render automatiskt skapa både web service och databas
   - Klicka på "New +" → "Blueprint"
   - Anslut repository och välj `render.yaml`
   - Render skapar automatiskt både web service och databas
   - Du behöver bara manuellt lägga till `RemoveBg__ApiKey` environment variable

7. **Deploy:**
   - Klicka på "Create Web Service"
   - Render kommer automatiskt bygga och deploya din applikation
   - Migrations appliceras automatiskt vid första start

### Kör migrations via Render CLI

**OBS:** Runtime-containern använder endast .NET runtime (inte SDK), så `dotnet ef` är inte tillgängligt direkt. Migrations körs automatiskt vid app-start via `Program.cs`, men om det misslyckas kan du använda följande metoder:

#### Metod 1: Kolla loggar först (Rekommenderat)

Kontrollera om migrations körs automatiskt och varför de misslyckas:
```bash
# Hitta service ID
render services

# Kolla loggar för migrations-relaterade meddelanden
render logs --resources <service-id> --text "migration" --tail
render logs --resources <service-id> --text "Database" --tail
```

#### Metod 2: Använd Program.cs Migrate() (Automatiskt)

Applikationen försöker automatiskt köra migrations vid start via `context.Database.Migrate()` i `Program.cs`. Om detta misslyckas:

1. **Kontrollera connection string:**
   ```bash
   render services  # Hitta service ID
   # I Render dashboard, kontrollera att ConnectionStrings__DefaultConnection är korrekt satt
   ```

2. **Starta om servicen:**
   ```bash
   render restart <service-id>
   ```

3. **Följ loggarna:**
   ```bash
   render logs --resources <service-id> --tail
   ```

#### Metod 3: Kör migrations lokalt mot Render-databasen

Om du behöver köra migrations manuellt, gör det lokalt mot Render-databasen:

1. **Hämta connection string från Render dashboard:**
   - Gå till din PostgreSQL-databas i Render
   - Kopiera "Internal Database URL" eller "Connection String"

2. **Kör migrations lokalt:**
   ```bash
   cd backend
   export ConnectionStrings__DefaultConnection="<din-render-connection-string>"
   dotnet ef database update
   ```

#### Metod 4: Uppdatera Dockerfile (Avancerat)

Om du behöver köra migrations i containern, uppdatera Dockerfile för att inkludera SDK eller EF tools. Detta kräver dock en större ändring av Dockerfile.

### Viktigt
- På Render Free tier sover applikationen efter 15 minuters inaktivitet
- Första requesten efter sleep kan ta 30-60 sekunder
- PostgreSQL connection string hämtas automatiskt från databasen i Render
- Om migrations misslyckas, kontrollera att `ConnectionStrings__DefaultConnection` är korrekt satt

## Testning

API:et kan testas via:
- **Swagger UI** (`/swagger`) - Interaktiv API-dokumentation och testning i webbläsaren (endast lokalt)
- **Swagger JSON** (`/swagger/v1/swagger.json`) - Kan importeras i Postman eller Swagger Editor
- Postman
- curl
- HTTP-filer (backend.http)
