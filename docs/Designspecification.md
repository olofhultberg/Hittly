# 🎨 Designspecifikation – Findly

## 1. Varumärke och känsla

**Namn:** Findly  
**Tagline (förslag):** Hitta grejerna. Håll ordning.  
**Ton:** Lekfull, hjälpsam, smart och pålitlig.  
**Kärnkänsla:** Struktur utan stress – ett digitalt förråd med glimten i ögat.

Findly ska kännas lättanvänd, lugn och modern.  
Appen ska inge känslan av “jag hittar alltid det jag letar efter”.

---

## 2. Färgpalett

| Roll | Färg | Tailwind-klass | Användning |
|------|------|----------------|-------------|
| Primär | `#2563EB` | `indigo-600` | Knapp, ikoner, länkfärg |
| Sekundär | `#10B981` | `emerald-500` | Bekräftelser, highlight |
| Bakgrund ljus | `#F8FAFC` | `slate-50` | Appens standardbakgrund |
| Text mörk | `#0F172A` | `slate-900` | Primär text |
| Grå yta / komponenter | `#E2E8F0` | `slate-200` | Inputfält, kort, listor |
| Fel / varning | `#EF4444` | `red-500` | Valideringsfel, radera-knapp |
| Framgång | `#22C55E` | `green-500` | Bekräftelser, sparat-meddelanden |

**Kontrastnivå:**  
Appen ska ha tillräcklig kontrast (WCAG AA) för att fungera i ljus/mörk miljö.  
Mörkt tema får läggas till efter MVP.

---

## 3. Typografi

| Typ | Font | Vikt | Användning |
|------|------|------|-------------|
| Primär | Systemfont (SF Pro / Inter / Roboto) | 400–700 | All text |
| Rubrik (H1/H2) | Semibold (600) | Rubriker och skärmtitlar |
| Brödtext | Regular (400) | Objektlistor och formulär |
| Sekundär text | Medium (500) | Taggar, metadata |

**Exempel:**  
```tsx
<Text className="text-xl font-semibold text-slate-900">Mina saker</Text>
<Text className="text-sm text-slate-600">Vinden / Låda 3</Text>

4. Ikon och logotyp

Appikon:
	•	Vit låda + förstoringsglas på blå bakgrund (#2563EB → #3B82F6 gradient).
	•	Rundade hörn (iOS standard).
	•	Minimalistisk, igenkännbar även i liten storlek.

Splashscreen:
	•	Blå gradient (mörk till ljus).
	•	Ikon centrerad, appnamnet Findly i vit text under.
	•	Font: Semibold, rundad sans-serif (SF Pro / Inter).

Format:
	•	Appikon 1024×1024 PNG
	•	Splashscreen 2732×2732 PNG (Expo splash.image)

⸻

5. UI-komponenter

Buttons
	•	Primär: fylld, blå bakgrund, vit text (bg-indigo-600 text-white)
	•	Sekundär: outline (border-indigo-600 text-indigo-600)
	•	Ghost: ikon utan bakgrund


    <Button className="bg-indigo-600 text-white rounded-lg px-5 py-3">Spara</Button>

    Inputs
	•	Rundade kanter (rounded-lg), tunn border (border-slate-200)
	•	Färgändring vid fokus (focus:border-indigo-500)
	•	Placeholder i text-slate-400

Taggar (chips)
	•	Fyllda (bg-slate-100 text-slate-700)
	•	Aktivt val: (bg-indigo-600 text-white)

Kort
	•	bg-white shadow-sm rounded-xl border border-slate-200
	•	Innehåller bild, titel, plats och taggar.

⸻

6. Ikoner & bildstil
	•	Ikoner från @expo/vector-icons (Feather / Heroicons)
	•	Enkel linjeikonografi (outline) i indigo 600
	•	Bilder i listor beskärs till rundade fyrkanter (rounded-md)
	•	Tomt-tillstånd: lätt illustrerade ikoner i grått/blått (inte foton)

⸻

7. Layout och navigering

Navigering: Expo Router med 3 tabbar
	1.	Hem / Sök
	2.	Platser
	3.	Inställningar

Floating Action Button (FAB):
	•	Placering: nederhöger
	•	Färg: bg-indigo-600
	•	Ikon: plus (Feather)
	•	Åtgärd: skapa ny sak

Spacing:
	•	Yttermarginaler: 16–20px (px-4)
	•	Komponentavstånd: gap-3–gap-4

⸻

8. Illustrationer och bilder
	•	Stil: platta ikoner (flat), 2D-illustrationer.
	•	Använd gärna SVG eller PNG (vikt < 100 KB).
	•	Bilder ska ha konsekvent stil — ljus bakgrund, neutrala färger.
	•	Rekommenderade färger: #E0F2FE (blåtoner), #D1FAE5 (grön ton).

⸻

9. Animationer (enkla)
	•	Fade-in på splashscreen.
	•	Lätt scale på knapptryck.
	•	Slide-transition mellan skärmar (Expo Router standard).

⸻

10. Tonalitet i text & microcopy

Situation
Exempeltext
Tom lista
“Här var det tomt! Lägg till din första grej.”
Spara lyckat
“Sparat! Grejen är på plats.”
Radera bekräftelse
“Ta bort ‘Julpynt’? Det går inte att ångra.”
Gästvy aktiv
“Gästvy – du kan bara titta, inte ändra.”

Tonaliteten ska vara:
	•	Vänlig men inte barnslig.
	•	Korta meningar.
	•	Inga utropstecken i överdrift.

⸻

11. Ikonografi exempel
Funktion
Ikon
Paket
Sök
search
Feather
Ny sak
plus
Feather
Flytta
move
Feather
Gästvy
eye
Feather
Export
share
Feather
Lås (PIN)
lock
Feather
Inställningar
settings
Feather

12. Responsivitet och webbanpassning
	•	Web-version ska följa samma färger och komponentstil.
	•	Maxbredd för layout: 960px.
	•	Centrera innehåll på stora skärmar.
	•	Buttons skalas upp till h-12, text text-base.

⸻

13. Ikonfilnamn (för Expo-konfiguration)
{
  "expo": {
    "name": "Findly",
    "slug": "findly",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    }
  }
}

