# 🐰 The Bunny Hop

A self-hosted cycling event app that scores riders based on Strava segment efforts completed on event day.

---

## Features

- **Strava OAuth** — riders sign in with their Strava account
- **Automatic scoring** — fetches all activities on the event date, matches against your checkpoint segment list, and computes total points
- **Personal scorecard** — riders see their score, a visual grid of completed/missed segments, and a progress bar
- **Public leaderboard** — ranked table with profile photos, checkpoint dots colour-coded by category, and expandable rows
- **Auto-refresh** — leaderboard polls every 60 seconds with a live countdown
- **No database** — results stored in a JSON file (`data/results.json`)
- **Fully typed** — TypeScript throughout

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js v4 with custom Strava OAuth provider |
| Styling | Tailwind CSS |
| Storage | Server-side JSON file |
| Deployment | Vercel |

---

## Project Structure

```
bunny-hop/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   │   ├── strava/sync/route.ts          # Strava data sync + scoring
│   │   │   └── leaderboard/route.ts          # Public leaderboard endpoint
│   │   ├── dashboard/page.tsx                # Personal scorecard (authenticated)
│   │   ├── leaderboard/page.tsx              # Public leaderboard
│   │   ├── page.tsx                          # Landing page
│   │   ├── layout.tsx                        # Root layout with SessionProvider
│   │   └── globals.css                       # Global styles
│   └── lib/
│       ├── config.ts         ← ⭐ EDIT THIS to configure your event
│       ├── types.ts                          # Shared TypeScript types
│       ├── auth.ts                           # NextAuth configuration
│       ├── strava.ts                         # Strava API client + scoring
│       ├── storage.ts                        # JSON file persistence
│       └── next-auth.d.ts                    # Session type augmentation
├── data/                                     # Auto-created; stores results.json
├── .env.local.example                        # Template for env vars
└── vercel.json
```

---

## Quick Start

### 1. Create a Strava App

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Create a new application
3. Set **Authorization Callback Domain** to `localhost` (dev) or your production domain
4. Note your **Client ID** and **Client Secret**

### 2. Clone & Install

```bash
git clone <your-repo>
cd bunny-hop
npm install
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
STRAVA_CLIENT_ID=12345            # From Strava API settings
STRAVA_CLIENT_SECRET=abc123...    # From Strava API settings
NEXTAUTH_SECRET=<random-string>   # Run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 4. Configure Your Event

Edit **`src/lib/config.ts`** — this is the only file you need to change for event setup:

```typescript
export const EVENT_CONFIG: EventConfig = {
  eventName: "The Bunny Hop",
  eventDate: "2026-04-12",       // ← Change to your event date (YYYY-MM-DD)
  segments: [
    {
      id: "123456",              // ← Real Strava segment ID
      name: "Hilltop Road",
      points: 10,
      category: "Road",          // ← "Road" | "Dirt" | "Bonus"
      description: "Optional description",
    },
    // ... more segments
  ],
};
```

**Finding Strava Segment IDs:**
- Open any segment on [strava.com](https://www.strava.com)
- The ID is in the URL: `https://www.strava.com/segments/12345678` → ID is `12345678`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
2. Framework: **Next.js** (auto-detected)

### 3. Add Environment Variables

In your Vercel project settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `STRAVA_CLIENT_ID` | From Strava API settings |
| `STRAVA_CLIENT_SECRET` | From Strava API settings |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### 4. Update Strava App Settings

In your Strava API app, update **Authorization Callback Domain** to your Vercel domain (e.g. `your-app.vercel.app`).

### 5. Deploy

Click **Deploy** in Vercel.

---

## Data Storage Notes

Results are stored in `data/results.json` on the server filesystem.

**On Vercel:** The `/tmp` directory is used automatically (ephemeral — resets on each function cold start). For a real event, consider:
- **Vercel KV** — replace `src/lib/storage.ts` with Vercel KV calls
- **PlanetScale / Supabase** — for a proper database
- **Vercel Blob** — for persistent file storage

For a one-day event with moderate traffic, the `/tmp` approach often works fine since function instances stay warm throughout the event.

---

## Scoring Logic

1. On sign-in, `POST /api/strava/sync` is called
2. The API fetches all Strava activities within a 24-hour UTC window of the event date
3. For each activity, it fetches the **detailed** version (which includes `segment_efforts`)
4. All matched segment IDs are collected into a set (deduped)
5. Each matched segment ID is cross-referenced against `EVENT_CONFIG.segments`
6. Total score = sum of `points` for each matched segment

A rider's result is upserted in `data/results.json` keyed by their Strava athlete ID.

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/leaderboard` | None | All rider results, ranked |
| `POST` | `/api/strava/sync` | Session | Fetch Strava data & compute score |
| `GET` | `/api/strava/sync` | Session | Get cached result for current rider |

---

## Customisation Tips

- **Add categories**: Edit `CATEGORIES` and `CATEGORY_COLORS` in `config.ts`
- **Change theme**: Edit `tailwind.config.ts` colour palette and `globals.css`
- **Persistent storage**: Replace `src/lib/storage.ts` with Vercel KV, Redis, or a DB
- **Email results**: Add a mailer call in `strava/sync/route.ts` after `saveRiderResult()`
