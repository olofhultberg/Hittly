# Bakgrundsborttagning - Konfiguration

Denna applikation använder Remove.bg API för att automatiskt ta bort bakgrunden från bilder när användare tar foton på grejer.

## Konfiguration

1. **Skaffa en API-nyckel från Remove.bg**
   - Gå till https://www.remove.bg/api
   - Skapa ett konto (gratis tier finns tillgänglig)
   - Kopiera din API-nyckel

2. **Lägg till API-nyckeln i konfigurationen**
   
   Öppna `appsettings.json` eller `appsettings.Development.json` och lägg till din API-nyckel:

   ```json
   {
     "RemoveBg": {
       "ApiKey": "din-api-nyckel-här"
     }
   }
   ```

   **OBS:** För produktion bör du använda användarsecrets eller miljövariabler istället för att hårdkoda API-nyckeln i konfigurationsfilen.

3. **Starta om backend-servern**

## Funktioner

- Automatisk bakgrundsborttagning när användare tar foton på grejer
- Fungerar både när man tar foto direkt med kameran och när man väljer bild från biblioteket
- Om bakgrundsborttagning misslyckas används originalbilden som fallback

## API Endpoint

Backend-exponerar en endpoint för bakgrundsborttagning:

- **POST** `/api/Image/remove-background`
- **Body:** Multipart form data med bildfilen
- **Response:** JSON med base64-kodad bild

## Begränsningar

- Remove.bg gratis tier har begränsningar på antal förfrågningar per månad
- För produktion bör du överväga att uppgradera till en betalplan eller implementera caching


