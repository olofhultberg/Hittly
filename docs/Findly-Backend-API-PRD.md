# 📦 Hittly – MVP Backend API

## 1. Översikt

Backend API för Hittly-appen som tillhandahåller REST API för hantering av utrymmen, lådor, objekt och taggar. API:et är byggt med ASP.NET Core 9.0 och använder SQLite som databas.

## 2. Tech-stack

- **Backend**: ASP.NET Core 9.0, C#
- **Databas**: SQLite med Entity Framework Core
- **Autentisering**: ASP.NET Core Identity
- **API Dokumentation**: Swagger/OpenAPI

## 3. Projektstruktur

```
backend/
├── Controllers/          # API Controllers
│   ├── AuthController.cs
│   ├── SpacesController.cs
│   ├── BoxesController.cs
│   ├── ItemsController.cs
│   └── TagsController.cs
├── Data/                 # Data access layer
│   └── ApplicationDbContext.cs
├── Models/               # Entity Framework modeller
│   ├── ApplicationUser.cs
│   ├── Space.cs
│   ├── Zone.cs
│   ├── Box.cs
│   ├── Item.cs
│   ├── Tag.cs
│   ├── ItemTag.cs
│   ├── ItemImage.cs
│   └── BoxImage.cs
├── DTOs/                 # Data Transfer Objects
│   ├── AuthDto.cs
│   ├── SpaceDto.cs
│   ├── BoxDto.cs
│   └── ItemDto.cs
├── Migrations/           # Entity Framework migrations
├── Program.cs            # Applikationsstart och konfiguration
└── appsettings.json      # Konfiguration
```

## 4. Datamodell

### Entiteter

- **ApplicationUser**: Användare (ASP.NET Core Identity)
- **Space**: Utrymme (t.ex. "Vinden", "Källaren")
- **Zone**: Zon inom ett utrymme (valfritt)
- **Box**: Låda med unik label code
- **Item**: Objekt i en låda
- **Tag**: Tagg för kategorisering
- **ItemTag**: Many-to-many relation mellan Item och Tag
- **ItemImage**: Bild för ett objekt
- **BoxImage**: Bild för en låda

### Relationer

- Space → Zones (1:N)
- Space → Boxes (1:N)
- Space → Items (1:N)
- Zone → Boxes (1:N, optional)
- Zone → Items (1:N, optional)
- Box → Items (1:N)
- Item → Tags (N:M via ItemTag)
- Box → BoxImages (1:N)
- Item → ItemImages (1:N)

## 5. API Endpoints

### Autentisering

- `POST /api/Auth/register` - Registrera ny användare
- `POST /api/Auth/login` - Logga in
- `POST /api/Auth/logout` - Logga ut

### Spaces (Utrymmen)

- `GET /api/Spaces` - Hämta alla utrymmen
- `GET /api/Spaces/{id}` - Hämta specifikt utrymme
- `POST /api/Spaces` - Skapa nytt utrymme
- `PUT /api/Spaces/{id}` - Uppdatera utrymme
- `DELETE /api/Spaces/{id}` - Ta bort utrymme

### Boxes (Lådor)

- `GET /api/Boxes` - Hämta alla lådor
- `GET /api/Boxes/{id}` - Hämta specifik låda
- `GET /api/Boxes/space/{spaceId}` - Hämta lådor för ett utrymme
- `POST /api/Boxes` - Skapa ny låda
- `PUT /api/Boxes/{id}` - Uppdatera låda
- `DELETE /api/Boxes/{id}` - Ta bort låda
- `POST /api/Boxes/{id}/move` - Flytta låda till nytt utrymme/zon

### Items (Objekt)

- `GET /api/Items` - Hämta alla objekt
- `GET /api/Items/{id}` - Hämta specifikt objekt
- `GET /api/Items/box/{boxId}` - Hämta objekt för en låda
- `POST /api/Items` - Skapa nytt objekt
- `PUT /api/Items/{id}` - Uppdatera objekt
- `DELETE /api/Items/{id}` - Ta bort objekt
- `POST /api/Items/{id}/tags` - Lägg till tagg till objekt
- `DELETE /api/Items/{id}/tags?tagName={name}` - Ta bort tagg från objekt

### Tags

- `GET /api/Tags` - Hämta alla taggar
- `GET /api/Tags/{id}` - Hämta specifik tagg

## 6. Business logic

### Validering

- **Space**: Namn är obligatoriskt, max 100 tecken. Kan inte tas bort om den har lådor.
- **Box**: Namn är obligatoriskt. Label code genereras automatiskt och är unik. Måste tillhöra ett befintligt utrymme.
- **Item**: Namn är obligatoriskt. Måste tillhöra en befintlig låda. SpaceId och ZoneId måste matcha lådans utrymme/zon.
- **Tag**: Namn är unikt (case-insensitive). Skapas automatiskt vid första användning.

### Flytta låda

När en låda flyttas till ett nytt utrymme/zon flyttas alla objekt i lådan automatiskt med.

### Label Code

Varje låda får en unik label code i formatet `BOX-XXXXXXXX` där X är alfanumeriska tecken. Koden används för QR-kodgenerering och etiketter.

## 7. Autentisering & Säkerhet

### ASP.NET Core Identity

- Lösenordskrav: Minst 8 tecken, kräver siffror, små och stora bokstäver
- E-post måste vara unik
- Kontolåsning efter 5 misslyckade inloggningsförsök (5 minuters låstid)

### CORS

CORS är konfigurerad för att tillåta alla origins i utvecklingsläge. För produktion bör detta begränsas till specifika domäner.

## 8. Icke funktionellt

### Prestanda

- API:et är optimerat för små till medelstora datamängder
- Entity Framework Core använder lazy loading för navigation properties
- Index på LabelCode för snabb sökning

### Databas

- SQLite används för enkelhet och portabilitet
- Migrations hanteras via Entity Framework Core
- Databasfilen (`hittly.db`) skapas automatiskt vid första körning

### Deployment

- Backend kan köras lokalt eller på en server
- För produktion: Överväg att använda PostgreSQL eller SQL Server istället för SQLite
- HTTPS rekommenderas för produktion

## 9. Utveckling

### Kommandon

```bash
# Bygg projektet
dotnet build

# Kör projektet
dotnet run

# Skapa migration
dotnet ef migrations add MigrationName

# Applicera migrations
dotnet ef database update

# Ta bort senaste migration
dotnet ef migrations remove
```

### Swagger UI

När applikationen körs i Development-läge är Swagger UI tillgängligt på:
- `https://localhost:{port}/swagger`

### Testning

API:et kan testas via:
- Swagger UI
- Postman
- curl
- HTTP-filer (backend.http)

## 10. Nästa steg

- [ ] Lägg till sökfunktionalitet (fulltext search)
- [ ] Implementera JWT tokens för autentisering
- [ ] Lägg till bilduppladdning (filhantering)
- [ ] Implementera paginering för stora listor
- [ ] Lägg till caching för bättre prestanda
- [ ] Skapa integrationstester
- [ ] Konfigurera CI/CD pipeline
- [ ] Överväg att migrera till PostgreSQL för produktion

---

*Författad av: Auto (Cursor AI) + Olof Hultberg*  
*Datum: 2025-12-21*
