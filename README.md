# Findly

Monorepo-struktur för Findly-projektet.

## Struktur

- `/mobile` - React Native (Expo) mobilapp
- `/web` - React webbapp
- `/backend` - Backend API (kommer senare)
- `/shared` - Delad kod (TypeScript-typer, validering)
- `/docs` - Dokumentation och PRD-filer

## Mobilapp

Utvecklas med TDD (Test-Driven Development). Alla tester finns i `/mobile/__tests__/`.

### Kör tester

```bash
cd mobile
yarn test
```

### Teststatus

För närvarande: **52 tester misslyckas** (som förväntat i TDD - funktionalitet saknas ännu)

