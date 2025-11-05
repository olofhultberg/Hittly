# Mobile App Structure

## Mappstruktur

- `components/` - Återanvändbara UI-komponenter
- `screens/` - Skärmar/vyer för appen
- `hooks/` - Custom React hooks
- `types/` - TypeScript-typer och interfaces
- `utils/` - Hjälpfunktioner och utilities

## Exempel

### Komponent
```tsx
// src/components/Logo.tsx
export function Logo({ withText = true }: LogoProps) {
  // ...
}
```

### Skärm
```tsx
// src/screens/HomeScreen.tsx
export function HomeScreen() {
  // ...
}
```

### Hook
```tsx
// src/hooks/useSpaces.ts
export function useSpaces() {
  // ...
}
```

