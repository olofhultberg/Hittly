# API-konfiguration för fysisk enhet

När du kör appen på en fysisk telefon via Expo måste telefonen kunna ansluta till backend-servern på din utvecklingsdator.

## Steg 1: Hitta din dators IP-adress

### Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Windows:
```bash
ipconfig
```

Leta efter IPv4-adressen (t.ex. `192.168.1.100` eller `192.168.68.102`)

## Steg 2: Uppdatera konfigurationen

Öppna `mobile/src/lib/api/config.ts` och uppdatera `DEVICE_IP` med din datorns IP-adress:

```typescript
const DEVICE_IP = '192.168.68.102'; // Uppdatera med din IP-adress
```

## Steg 3: Kontrollera nätverk

- Telefonen och datorn måste vara på **samma WiFi-nätverk**
- Backend-servern måste köra på din dator
- Brandväggen måste tillåta anslutningar på port 5048

## Steg 4: Starta backend

```bash
cd backend
dotnet run
```

Backend kommer att köra på `http://localhost:5048` (och på din IP-adress för externa anslutningar).

## Testa anslutningen

Du kan testa om telefonen kan nå backend genom att öppna i telefonens webbläsare:
```
http://[DIN_IP]:5048/swagger
```

Om Swagger UI visas, fungerar anslutningen!


