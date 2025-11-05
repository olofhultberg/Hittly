# 📦 GrejFinder – MVP PRD Smartphone APP

## 1. Översikt

**Syfte:**  
GrejFinder-appen hjälper användare hålla ordning på saker som förvaras i förråd, vindar och källare.  
Appen låter dig skapa struktur (Utrymmen, Lådor, Saker), spara bilder och beskrivningar, och hitta saker snabbt.  
MVP:n ska vara **offline-first** och fungera utan backend.

**Primärt mål:**  
En fullt fungerande lokal app som kan testas via **Apple TestFlight**, byggd i **React Native (Expo)**.

**Sekundära mål:**  
Förberedd för:
- framtida backend-synk (Firebase/Supabase),
- inbjudningar och delning via e-post,
- web-adminpanel.

---

## 2. Målgrupp

- **Primär användare:** hushållsägare med mycket förrådsprylar.  
- **Sekundär användare:** gäst/familjemedlem som behöver hitta något (via gästvy).
- **Extra:** Skapa försäljningsobjekt på online app likt Blocket och liknande.

---

## 3. Mål för MVP

| Prioritet | Funktion | Beskrivning |
|------------|-----------|--------------|
| 🟢 | Offline-lagring | All data (platser, lådor, objekt) sparas lokalt i SQLite |
| 🟢 | CRUD för objekt | Skapa/redigera/ta bort saker med bild och beskrivning |
| 🟢 | Hierarki | Utrymme → Zon → Låda → Objekt |
| 🟢 | Flytta låda | Flytta alla objekt till ny plats i ett steg |
| 🟢 | Sök & filter | Text, taggar, plats; sortering per låda eller plats |
| 🟢 | Taggar | Lägg till, ta bort och filtrera på taggar |
| 🟢 | Gästvy | Read-only-läge skyddat med PIN |
| 🟢 | Export | PDF-export (per låda/plats) och ZPL-etikett för Zebra-skrivare |
| 🟡 | Säkerhetskopia | Export/import av data som JSON |
| 🟡 | UI/Design | Tailwind (NativeWind) + ljus/mörk-läge |
| 🟡 | Felhantering | Grundläggande validering och meddelanden |
| 🔵 | TestFlight | Byggbar via EAS, med metadata och skärmdumpar för TestFlight |

---

## 4. Användarflöden

### 4.1 Grundflöde
1. Starta appen → onboarding → skapa första Utrymme ("Vinden").
2. Skapa lådor i utrymmet.
3. Lägg till saker med bild, beskrivning och taggar.
4. Sök efter sak via ord eller tagg.
5. Visa plats/låda → hitta föremålet.
6. Exportera etikett eller PDF-lista för utskrift/delning.

### 4.2 Gästflöde
1. Aktivera Gästvy via startsidan.  
2. Ange PIN (samma för alla i MVP).  
3. Gäst kan söka och visa bilder och beskrivningar (ingen redigering).

---

## 5. Funktionella krav

### 5.1 Datamodell (SQLite)

**Tabeller:**  
`spaces`, `zones`, `boxes`, `items`, `item_images`, `tags`, `item_tags`, `guests_local`, `exports`.

**Viktiga fält:**
- Item: `id`, `name`, `description`, `space_id`, `zone_id`, `box_id`, `created_at`, `updated_at`
- Box: `id`, `name`, `space_id`, `zone_id`, `label_code`
- Tag: `id`, `name`
- Export: `id`, `type`, `created_at`, `file_uri`

**Exempel:**  
- Flytta låda → `UPDATE items SET space_id=?, zone_id=? WHERE box_id=?`
- Sök → `WHERE name LIKE ? OR description LIKE ?` + joins till taggar.

---

## 6. PDF & Etiketter

### 6.1 PDF-export
- Använd `expo-print` för att skapa PDF.
- Layout: sortering **per låda eller plats**, valbart i UI.
- Innehåll: lådans namn, plats, lista med objekt, bilder och beskrivning.
- Metadata: datum, app-version.

### 6.2 Etikett (Zebra ZPL)
- Generera enkel etikett i **ZPL**-kod:
  - Lådans namn (stor text)
  - QR-kod eller textkod (`label_code`)
  - Utrymme/Zon
- Använd `expo-file-system` för att spara `.zpl`-fil.
- Möjlighet att dela/skriva ut via AirPrint eller exportera fil.

Exempel ZPL:
^XA
^FO50,50^A0N,40,40^FDLåda 3^FS
^FO50,100^BQN,2,6^FDQA12345^FS
^FO50,300^A0N,30,30^FDVinden - Zon A^FS
^XZ

---

## 7. Gästvy

- Aktiveras från startsida.
- PIN (fyrsiffrig, lagras lokalt).
- Låst till read-only: sök, filtrera, visa detaljer.
- Visuell markering ("Gästvy aktiv").

---

## 8. Design & UI

**Ramverk:** React Native + Expo + Tailwind (NativeWind).  
**Stil:** ren, ljus bakgrund (slate-50), accentfärg indigo/emerald.  
**Komponenter:** `Button`, `Chip`, `Card`, `TagInput`, `ItemCard`.  
**Navigering:** Expo Router (Tabs + Stack).  
**Layout:**  
- Tab 1: Hem/Sök  
- Tab 2: Platser/Lådor  
- Tab 3: Inställningar

---

## 9. Tekniska krav

| Komponent | Val |
|------------|------|
| Framework | React Native (Expo) |
| Navigation | Expo Router |
| UI | NativeWind (Tailwind) |
| State | Zustand |
| Form | React Hook Form + Zod |
| Lagring | expo-sqlite |
| Bilder | expo-image-picker + expo-file-system |
| PDF | expo-print |
| Delning | expo-sharing |
| QR | react-native-qrcode-svg |
| PIN | react-native-keychain eller lokal MMKV |

---

## 10. Icke-funktionella krav

- **Offline-first:** 100 % av appens kärnfunktioner fungerar utan internet.  
- **Prestanda:** Sök och listning < 300ms för 500+ objekt.  
- **Dataintegritet:** Lokala backuper/export/import via JSON.  
- **Säkerhet:** Enkel PIN-låsning av gästläge.  
- **Utbyggbarhet:** Kod organiserad i moduler per domän (items, boxes, tags).

---

## 11. Miljö & byggprocess

- **Version control:** Git (frekventa commits, små steg)
- **Repo-struktur (Monorepo):**  
  - `/mobile` – React Native (Expo) mobilapp
    - `/src` – app-kod
      - `/components` – UI-komponenter
      - `/screens` – skärmar/vyer
      - `/hooks` – custom React hooks
      - `/types` – TypeScript-typer
      - `/utils` – hjälpfunktioner
    - `/lib` – datalager, db, export
      - `/auth` – användarhantering och autentisering
      - `/onboarding` – onboarding-flöde
      - `/spaces` – utrymmen CRUD
      - `/boxes` – lådor CRUD
      - `/items` – objekt CRUD
      - `/search` – sökfunktionalitet
      - `/guest` – gästvy
      - `/db` – SQLite-databas
    - `/__tests__` – TDD-tester
    - `/assets` – ikoner, bilder
  - `/web` – React webbapp
    - `/src/components` – UI-komponenter
    - `/src/pages` – sidor
  - `/backend` – Backend API (kommer senare)
  - `/shared` – delad kod (TypeScript-typer, validering)
  - `/docs` – PRD, design, testplan  

- **Bygg & test:**
  - Lokalt via `expo start`
  - iOS via `eas build -p ios`
  - TestFlight via App Store Connect

---

## 12. Testning

**Enhetstester (valfritt i MVP):**
- CRUD-funktioner för items/boxes.
- SQLite DB-init.

**Manuell testplan:**
- Skapa → sök → visa → flytta låda → exportera PDF → starta gästvy → lås/lås upp.

---

## 13. Versionsplan

| Version | Fokus | Kommentar |
|----------|--------|------------|
| 0.1 | MVP offline | Lokalt, inga nätberoenden |
| 0.2 | QR / etikettförbättringar | Export direkt till Zebra |
| 0.3 | Auth + molnsynk (valfri) | Firebase/Supabase |
| 1.0 | Publik version | App Store release |

---

## 14. Öppen designfråga

- Färgschema (du väljer under arbetets gång).
- Typsnitt – system default i MVP.

---

## 15. Nästa steg

1. Skapa repo i Cursor/GitHub.  
2. Lägg in denna PRD i `docs/PRD.md`.  
3. Kör `npx create-expo-app` + installera kärnpaket.  
4. Skapa migrationsfil för SQLite.  
5. Börja med "Spaces → Boxes → Items"-flödet.  
6. Skapa web app som kommer kunna "spegla" ditt konto i GrejFinder
7. Lägg in i samma repo
---

*Författad av: GPT-5 + Olof Hultberg*  
*Datum: 20251105 *  

