# Beerback · Projekt-Kontext für Claude Code

> **Hi Claude!** Lies diese Datei am Anfang jeder Session. Sie enthält alles, was du über dieses Projekt wissen musst.

## Was ist das?

**Beerback** ist eine Bier-Loyalty-App nach dem Payback-Prinzip. User dokumentieren ihre Biere, sammeln Hopfen-Punkte und lösen sie bei Partner-Bars (zuerst Faustfood Erfurt) gegen Freibier, Probiersets oder Erlebnisse ein.

**Tagline:** "Trink Bier. Krieg Beerback."

**Owner:** Michael (Inhaber Faustfood Erfurt, Craftmichel-Brauerei)

**Live-URL:** https://beerback.craftmichel-brauerei.de (Subdomain)

## Tech-Stack

- **Next.js 14** (App Router)
- **TypeScript** strict mode
- **Tailwind CSS** mit Custom Brand Colors
- **Supabase** (Postgres + Auth + Storage)
- **Vercel** Deployment
- **GitHub** Versionskontrolle

## Projekt-Struktur

```
beerback/
├── app/
│   ├── page.tsx              # Landing Page (öffentlich)
│   ├── login/                # Magic-Link Login
│   ├── auth/callback/        # Auth-Callback Handler
│   ├── onboarding/           # Pseudonym, Alter, AGB
│   ├── (app)/                # Geschützter Bereich (mit Tab-Bar)
│   │   ├── layout.tsx        # App-Layout mit TabBar
│   │   ├── home/             # Home / Feed
│   │   ├── add-beer/         # Bier hinzufügen
│   │   ├── map/              # Welt-Karte
│   │   ├── wallet/           # Hopfen-Wallet
│   │   └── profile/          # Profil + Sammlung
│   └── api/                  # Server-Side API Routes
├── components/
│   ├── layout/               # TabBar, LogoutButton
│   ├── beer/                 # Bier-Karten etc.
│   └── ui/                   # Generische UI
├── lib/
│   ├── supabase/             # Client/Server Supabase
│   └── hopfen/               # Hopfen-Berechnung (calculate.ts)
├── types/
│   └── database.ts           # TypeScript Types für DB
├── middleware.ts             # Auth-Schutz für Routen
└── tailwind.config.ts        # Brand Colors
```

## Brand-Identity

### Farben (in Tailwind verfügbar)

- `bg`: #faf6f0 (Cream-Hintergrund)
- `bg-card`: #ffffff (Karten)
- `bg-deep`: #0f0a08 (Dunkel-Modus / Akzent)
- `ink`: #1a1410 (Haupt-Text)
- `ink-soft`: #6b5b4f (Sekundär-Text)
- `gold` mit `light` (#f4d97a) und `deep` (#8b5e0f)
- `foam`: #fff8e7 (Highlight)

### Fonts

- **Display**: Bricolage Grotesque (Überschriften, Zahlen, Brand)
- **Body**: Inter (alles andere)

### Komponenten-Klassen

In `globals.css` definiert: `.btn-primary`, `.btn-gold`, `.input-field`, `.card`, `.label`

## Datenbank (Supabase)

**14 Tabellen** – Schema in `beerback-database-schema.sql` (Repo-Root oder im Master-Doc).

**Wichtigste:**
- `profiles` – User-Daten + Hopfen-Konto + Streak
- `beers` – jedes geloggte Bier
- `transactions` – kompletter Hopfen-Verlauf
- `daily_limits` – Tageslimits-Tracking (Schutzmechanismus!)
- `partner_venues` – Partner-Bars (Faustfood ist die erste)
- `rewards` – Marketplace-Items
- `redemptions` – eingelöste Belohnungen
- `quiz_questions` – Wissensdatenbank
- `wheel_spins`, `quiz_sessions`, `game_scores` – Spiele-Verlauf
- `achievements`, `user_achievements` – Erfolge

**RLS aktiviert** auf allen User-Tabellen. User sieht nur eigene Daten.

## Hopfen-System (Single Source of Truth: lib/hopfen/calculate.ts)

| Aktion | Hopfen | Limit |
|---|---|---|
| Bier-Sorte | +5 | max. 3/Tag |
| Foto | +10 | s.o. |
| Bewertung | +5 | s.o. |
| Tasting-Notiz | +10 | s.o. |
| GPS verifiziert | +20 | s.o. |
| Erste neue Sorte/Bar | +25 | unbegrenzt |
| Erste Stadt | +50 | unbegrenzt |
| Erstes Land | +150 | unbegrenzt |
| Wheel | 10–500 | 1/Tag |
| Quiz richtig | +5 pro Frage | 5/Tag |
| Streak 7 Tage | +75 | rollend |
| Pause 7 Tage | +200 | belohnt Pausen! |

## Schutzmechanismen (NICHT entfernen!)

Die App belohnt **App-Nutzung & Vielfalt**, NICHT **Trinkmenge**. Diese Mechanismen sind rechtlich Pflicht:

- ✅ Altersverifikation 18+ im Onboarding
- ✅ Tageslimit auf belohnte Biere (max. 3)
- ✅ Streak basiert auf App-Öffnung, nicht Trinken
- ✅ Wasser-Logging möglich (gibt auch Hopfen)
- ✅ Pause-Quest (7 Tage = +200 Bonus)
- ✅ Selbst-Pause-Funktion (User kann sich sperren)
- ✅ Hopfen NICHT mit Echtgeld kaufbar
- ✅ Glücksrad max. 1× pro Tag

## Coding-Konventionen

- **TypeScript strict** – keine `any`-Types
- **Server Components default** – nur `'use client'` wenn nötig (Forms, Interaktionen)
- **Tailwind statt CSS** – Custom CSS nur in `globals.css` und nur für Komponenten-Klassen
- **Datenbank-Zugriff:**
  - Server Component → `import { createClient } from '@/lib/supabase/server'`
  - Client Component → `import { createClient } from '@/lib/supabase/client'`
- **Errors handling** – immer try/catch um Supabase-Calls
- **Deutsch first** – UI-Texte auf Deutsch, Code-Kommentare gemischt

## Was als Nächstes gebaut werden muss

### Phase 1 MVP (8-10 Wochen)

**Schon gebaut (Grundgerüst):**
- ✅ Projekt-Setup mit Tailwind
- ✅ Supabase-Anbindung (Client + Server)
- ✅ Middleware mit Auth-Schutz
- ✅ Landing-Page
- ✅ Login mit Magic Link
- ✅ Onboarding (Pseudonym, Alter, AGB)
- ✅ Home-Screen
- ✅ Bier hinzufügen (mit Foto + GPS)
- ✅ Wallet mit Verlauf
- ✅ Map-Placeholder
- ✅ Profil mit Sammlung

**TODO Phase 1:**
- [ ] Welt-Karte mit echten Pins (SVG-basiert)
- [ ] Reward-Marketplace
- [ ] Reward-Code-Einlösung
- [ ] Bar-Dashboard für Code-Prüfung
- [ ] Hopfen-Wheel
- [ ] Daily Quiz
- [ ] Bierglas-Master Spiel
- [ ] Achievement-Logik (auto-vergeben)
- [ ] Daily-Limit-Logic vollständig
- [ ] Wasser-Logging
- [ ] Selbst-Pause-Funktion
- [ ] AGB & Datenschutz-Seiten
- [ ] PWA-Manifest + Service Worker

### Phase 2 (Sozial)
- Freunde, Stammtisch, Activity Feed, Leaderboards

### Phase 3 (Engagement)
- Quests-Engine, mehr Spiele, Sponsored Content

### Phase 4 (Skalierung)
- NFC, White-Label, Native App-Wrap

## Deployment-Setup

1. GitHub Repo: `beerback`
2. Vercel mit Repo verbunden, Auto-Deploy on push
3. Subdomain: `beerback.craftmichel-brauerei.de` → DNS-CNAME auf Vercel
4. Environment Variables in Vercel gesetzt:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`

## Wichtige Befehle

```bash
# Lokal entwickeln
npm run dev

# Type-Check
npm run type-check

# Build prüfen
npm run build

# Linter
npm run lint
```

## Bekannte Issues

- GPS-Permission-Prompt auf iOS Safari kann zickig sein → Fallback ohne GPS funktioniert
- Foto-Upload bei sehr großen Dateien (>5MB) wird abgelehnt → User-Hinweis ist drin
- Magic-Link braucht im Free-Supabase-Tier ggf. Custom-SMTP für Production

## Bei Fragen oder Bugs

1. Supabase Dashboard → Logs prüfen
2. Vercel Dashboard → Deployment Logs
3. Browser DevTools → Console + Network

---

*Dieses Dokument hält Claude Code im Kontext. Updates beim Bauen direkt hier eintragen.*
