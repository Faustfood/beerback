# 🍺 Beerback

> **Trink Bier. Krieg Beerback.**

Eine Bier-Loyalty-App nach dem Payback-Prinzip. User dokumentieren ihre Biere, sammeln Hopfen-Punkte und lösen sie bei Partner-Bars gegen echte Belohnungen ein.

**Live:** https://beerback.craftmichel-brauerei.de

## Tech-Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)
- Vercel Hosting

## Quick-Start

### 1. Repo klonen

```bash
git clone https://github.com/[USERNAME]/beerback.git
cd beerback
npm install
```

### 2. Supabase einrichten

1. Auf https://supabase.com → New Project (Region: Frankfurt)
2. SQL Editor → `beerback-database-schema.sql` ausführen
3. Storage → Bucket `beer-photos` anlegen (public, max 5MB, image/*)
4. Authentication → Email-Magic-Link aktivieren

### 3. Environment Variables

```bash
cp .env.local.example .env.local
# Werte aus Supabase Project Settings → API eintragen
```

### 4. Lokal starten

```bash
npm run dev
# → http://localhost:3000
```

### 5. Test-Flow

1. Auf Landing-Page "Jetzt loslegen"
2. Email eingeben → Magic Link bekommen
3. Klicken → Onboarding (Pseudonym, Alter)
4. Home → "Bier hinzufügen"
5. Foto + Sorte + Bewertung → speichern
6. Hopfen sehen in Wallet

## Projekt-Struktur

Siehe [CLAUDE.md](./CLAUDE.md) für ausführliche Erklärung.

## Deployment

Auf Vercel:
1. Repo importieren
2. Environment Variables setzen
3. Domain `beerback.craftmichel-brauerei.de` verbinden:
   - DNS-CNAME bei deinem Hoster: `beerback.craftmichel-brauerei.de` → `cname.vercel-dns.com`
4. In Supabase: Authentication → URL Configuration:
   - Site URL: `https://beerback.craftmichel-brauerei.de`
   - Redirect URLs: `https://beerback.craftmichel-brauerei.de/auth/callback`

## Roadmap

Siehe [CLAUDE.md](./CLAUDE.md) für vollständige Roadmap mit allen Phasen.

## License

Proprietär – © 2026 Michael Wilkat / Craftmichel-Brauerei
