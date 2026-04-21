<div align="center">
  <h1>QuestLog</h1>
  <p>
    <strong>Track your games. Know your time.</strong>
  </p>
  <p>
    A minimalist, data-driven gaming platform for tracking completion times,
    syncing Steam libraries, and visualizing playtime data.
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-18-black?style=flat-square" />
    <img src="https://img.shields.io/badge/Node.js-20-black?style=flat-square" />
    <img src="https://img.shields.io/badge/MongoDB-7-black?style=flat-square" />
    <img src="https://img.shields.io/badge/Redis-7-black?style=flat-square" />
    <img src="https://img.shields.io/badge/license-MIT-black?style=flat-square" />
  </p>
</div>

---

## Overview

QuestLog is a full-stack SaaS platform inspired by HowLongToBeat, built with
a premium Apple × Linear × Vercel design sensibility. Users submit completion
times, browse community aggregates, sync their Steam library, and track their
gaming backlog — all inside a zero-clutter, typography-driven interface.

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend    | Node.js 20, Express.js                      |
| Database   | MongoDB 7 (Mongoose)                        |
| Cache      | Redis 7 (ioredis)                           |
| Auth       | Firebase Auth + Admin SDK                   |
| Real-time  | Socket.io                                   |
| Game data  | IGDB API (Twitch OAuth)                     |
| Steam data | Steam Web API                               |
| Charts     | Recharts                                    |
| Deployment | Docker + Nginx                              |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  React Client (Vite)                     │
│   Zustand ──► Pages ──► Components ──► React Query      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS + WS
┌────────────────────────▼────────────────────────────────┐
│                  Express API Server                      │
│  Routes ──► Middleware ──► Controllers ──► Services     │
│               │                                          │
│        ┌──────┴──────┐                                  │
│        │    Redis     │  Cache-aside, TTL per endpoint   │
│        └─────────────┘                                  │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│   MongoDB   │          │  External APIs   │
│  Mongoose   │          │  IGDB + Steam    │
└─────────────┘          └─────────────────┘
       │
┌──────▼──────┐
│  Socket.io  │  Live stat push after playtime submission
└─────────────┘
```

## Features

**Core**

- Community-sourced playtime tracking (main story / sides / completionist)
- Outlier-filtered stat aggregation (mean, median, p25, p75, min, max)
- Steam library sync with IGDB fuzzy matching
- Debounced live search — 500K+ games via IGDB
- Bento grid dashboard with real-time updates

**Advanced**

- Redis cache-aside on all IGDB + IGDB match calls (7-day Steam match cache)
- AI playtime predictor — genre-weighted heuristic with confidence score
- Pile of Shame calculator — unplayed games × estimated hours × years-at-pace
- Socket.io stat push — game page updates live after any user submission
- Optimistic UI updates with automatic rollback on error

**Performance**

- Code-split per route + manual vendor chunks (React, Motion, Charts, Firebase)
- `LazyImage` with IntersectionObserver — 300px prefetch margin
- Virtual scroll for large library pages
- `⌘K` command palette with keyboard navigation
- Scroll progress indicator, page transitions, skeleton states

## Quick Start

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- IGDB (Twitch) credentials — [get them here](https://dev.twitch.tv/console/apps)
- Firebase project — [console.firebase.google.com](https://console.firebase.google.com)
- Steam API key (optional) — [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)

### 1. Clone

```bash
git clone https://github.com/yourorg/questlog.git
cd questlog
```

### 2. Infrastructure

```bash
docker-compose up -d mongo redis
```

### 3. Server

```bash
cd server
cp .env.example .env       # fill required values
npm install
npm run dev                # http://localhost:5000
```

### 4. Client

```bash
cd client
cp .env.example .env       # fill Firebase config
npm install
npm run dev                # http://localhost:5173
```

## Environment Variables

### Server (`server/.env`)

| Variable                | Required | Description                                       |
| ----------------------- | -------- | ------------------------------------------------- |
| `MONGODB_URI`           | ✓        | MongoDB connection string                         |
| `IGDB_CLIENT_ID`        | ✓        | Twitch app client ID                              |
| `IGDB_CLIENT_SECRET`    | ✓        | Twitch app client secret                          |
| `FIREBASE_PROJECT_ID`   | ✓        | Firebase project ID                               |
| `FIREBASE_PRIVATE_KEY`  | ✓        | Firebase service account private key              |
| `FIREBASE_CLIENT_EMAIL` | ✓        | Firebase service account email                    |
| `STEAM_API_KEY`         | —        | Steam Web API key (disables Steam sync if absent) |
| `REDIS_HOST`            | —        | Redis host (defaults to localhost)                |
| `REDIS_PASSWORD`        | —        | Redis auth password                               |
| `CLIENT_URL`            | —        | CORS origin (default: http://localhost:5173)      |

### Client (`client/.env`)

| Variable                    | Required | Description          |
| --------------------------- | -------- | -------------------- |
| `VITE_FIREBASE_API_KEY`     | ✓        | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✓        | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID`  | ✓        | Firebase project ID  |
| `VITE_FIREBASE_APP_ID`      | ✓        | Firebase app ID      |
| `VITE_API_URL`              | ✓        | Backend API base URL |

## API Reference

```
AUTH
  POST  /api/auth/register      Sync Firebase user → MongoDB (idempotent)
  GET   /api/auth/me            Get current user profile

GAMES
  GET   /api/games/search       ?q= — IGDB search (Redis cached 1h)
  GET   /api/games/trending     Top-rated recent games (cached 30min)
  GET   /api/games/slug/:slug   Game detail by slug (cached 24h)
  GET   /api/games/:id          Game detail by IGDB id (cached 24h)
  GET   /api/games/:id/similar  Similar games (cached 12h)
  GET   /api/games/:id/stats    Aggregated playtime stats (cached 10min)
  POST  /api/games/:id/playtime Submit completion time [auth]

USERS
  GET   /api/users/:id/library  Paginated game library [auth]
  POST  /api/users/library      Add game to library [auth]
  GET   /api/users/:id/backlog  Backlog list [auth]
  GET   /api/users/:id/stats    Personal analytics [auth]
  PATCH /api/users/:id/game/:gameId  Update game entry [auth]

STEAM
  POST  /api/steam/sync         Import Steam library [auth, 3/hr limit]
  GET   /api/steam/status       Last sync metadata [auth]

STATS
  GET   /api/stats/global       Platform-wide stats (cached 5min)
  GET   /api/stats/breakdown    Personal playtime breakdown [auth]
  GET   /api/stats/shame        Pile of Shame data [auth]
  GET   /api/stats/predict/:id  AI playtime prediction (cached 24h)
```

## Key Design Decisions

**Cache strategy** — Redis cache-aside. Each endpoint has a tuned TTL:
IGDB game detail 24h, search results 1h, trending 30min, playtime stats
10min with immediate bust on any new submission.

**Playtime aggregation** — Raw submissions are outlier-filtered with z-score
(threshold 2.5σ, minimum 3 entries). Final stats include mean, median,
p25, p75, min, max per category. Recalculation is async — response is
never blocked by stat computation.

**Steam matching** — Fuzzy name match against IGDB search. Priority:
exact normalized match → substring → first result. Each `appId` → IGDB
match is cached for 7 days to minimize API calls on re-sync.

**Auth** — Firebase handles all credential operations. The server only
receives and verifies ID tokens via Firebase Admin SDK. MongoDB user
documents are created via an idempotent upsert on first login, so OAuth
and email sign-up share the same registration path.

**Real-time** — Each authenticated user joins a Socket.io room
(`user:{uid}`). After playtime recalculation, a `game:{igdbId}:stats`
event is emitted globally. React Query cache is updated in-place via the
`useLiveStats` hook — no full refetch triggered.

**Optimistic updates** — Library mutations apply immediately via a Zustand
`optimisticUpdates` map merged into React Query's `select`. On error, the
map entry is deleted, restoring the previous state, and an error toast fires.

## Production Deployment

```bash
# Build + start all services
docker-compose up -d --build

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Health check
curl http://localhost:5000/health
```

## Project Structure

```
questlog/
├── client/                    React + Vite frontend
│   ├── src/
│   │   ├── components/        UI components
│   │   │   ├── auth/          AuthGuard
│   │   │   ├── charts/        Recharts wrappers
│   │   │   ├── dashboard/     Bento grid cards
│   │   │   ├── game/          GameCard, GameHero, PlaytimePanel
│   │   │   ├── layout/        Shell, Navbar, Container
│   │   │   └── ui/            Button, Input, Card, Toast, CommandPalette
│   │   ├── hooks/             Data + UI hooks
│   │   ├── lib/               axios, firebase, socket, seo, motion, utils
│   │   ├── pages/             Route-level components
│   │   ├── providers/         AuthProvider, SocketProvider
│   │   ├── services/          auth.service
│   │   ├── store/             Zustand: auth, dashboard
│   │   └── styles/            globals.css
│   ├── public/                Static assets, robots.txt, webmanifest
│   └── Dockerfile
│
├── server/                    Node + Express backend
│   ├── src/
│   │   ├── config/            db, redis, firebase, igdb, events, env
│   │   ├── controllers/       auth, game, user, steam, stats
│   │   ├── middleware/        auth, cache, rateLimit, error
│   │   ├── models/            User, Game, UserGame, PlaytimeEntry
│   │   ├── routes/            auth, game, user, steam, stats
│   │   ├── services/          igdb, steam, stats
│   │   └── utils/             ApiError, ApiResponse, catchAsync, logger
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

## License

MIT © QuestLog
