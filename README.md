# QuestLog 🎮

> **Track your games. Know your time.**

A minimalist, data-driven gaming platform for tracking completion times, syncing Steam libraries, tracking missions, and visualizing playtime data. Built with a premium Apple × Linear × Vercel design sensibility.

[![Made with React](https://img.shields.io/badge/React-18-black?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-black?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-black?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-black?style=flat-square&logo=firebase)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)

---

## 📸 Preview

```
Landing Page → Login → Dashboard (Bento Grid) → Search Games → Game Detail → Missions
```

- **Ultra-minimalist** black & white design
- **Bento Grid** dashboard with live stats
- **Mission Tracker** with pre-loaded missions for GTA V, Elden Ring, RDR2, Witcher 3, Cyberpunk 2077, God of War
- **Completion time tracking** — community-sourced Main Story / Sides / Completionist data
- **Steam library sync** via Steam Web API
- **Real-time updates** via Socket.io

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js 20, Express.js |
| Database | MongoDB 7 (Mongoose) |
| Cache | Redis 7 (ioredis) |
| Auth | Firebase Auth + Admin SDK |
| Real-time | Socket.io |
| Game Data | IGDB API (Twitch OAuth) |
| Steam Data | Steam Web API |
| Charts | Recharts |
| Deployment | Render (backend) + Vercel (frontend) |

---

## ⚡ Features

### Core
- 🎯 **Completion time tracking** — Submit & view Main Story / Main + Sides / Completionist times
- 📊 **Community stats** — Mean, median, min, max with distribution visualization
- 🔍 **Live debounced search** — 500K+ games via IGDB API
- 🎮 **Mission Tracker** — Pre-loaded missions for popular games, checkable per user
- 🗂️ **Library management** — Track status: Playing / Completed / Backlog / Dropped
- 👤 **User profile** — View all games grouped by status with stats
- ⚡ **Steam Sync** — Import your entire Steam library in seconds
- 🏆 **Pile of Shame** — Unplayed games with estimated completion time cost
- 🔴 **Real-time updates** — Socket.io stat push after submissions
- ⌘K **Command palette** — Quick search from anywhere
- 📱 **Responsive** — Works on all screen sizes

---

## 🚀 Local Development

### Prerequisites

- Node.js v20+
- Docker Desktop (for MongoDB + Redis)
- Firebase project
- IGDB (Twitch) API credentials
- Steam API key *(optional)*

### 1. Clone

```bash
git clone https://github.com/yourusername/questlog.git
cd questlog
```

### 2. Start databases

```bash
docker-compose up -d
```

### 3. Setup server

```bash
cd server
cp .env.example .env
# Fill in your credentials (see Environment Variables below)
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 4. Setup client

```bash
cd client
cp .env.example .env
# Fill in your Firebase credentials
npm install
npm run dev
# Client runs on http://localhost:5173
```

### 5. Open the app

Visit [http://localhost:5173](http://localhost:5173)

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/questlog

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# IGDB — https://dev.twitch.tv/console/apps
IGDB_CLIENT_ID=your_twitch_client_id
IGDB_CLIENT_SECRET=your_twitch_client_secret

# Steam — https://steamcommunity.com/dev/apikey
STEAM_API_KEY=your_steam_api_key

# Firebase Admin — Firebase Console → Project Settings → Service Accounts
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com

# CORS
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
# Firebase — Firebase Console → Project Settings → Your apps → Web app
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourproject
VITE_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# API
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

### Backend → Render

1. Go to [render.com](https://render.com) and sign up
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Environment:** Node
5. Add all environment variables from `server/.env`
6. For MongoDB: use [MongoDB Atlas](https://cloud.mongodb.com) free tier — replace `MONGODB_URI` with Atlas connection string
7. For Redis: use [Upstash Redis](https://upstash.com) free tier — replace `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
8. Click **Deploy**

Your server will be live at: `https://your-app-name.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **New Project** → Import your GitHub repo
3. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   - All `VITE_FIREBASE_*` variables from `client/.env`
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
5. Click **Deploy**

Your app will be live at: `https://your-app-name.vercel.app`

### Post-Deployment Checklist

After deploying, update these:

```
Firebase Console → Authentication → Settings → Authorized domains
→ Add your Vercel domain: your-app-name.vercel.app

Render → Environment Variables
→ Update CLIENT_URL=https://your-app-name.vercel.app
```

---

## 🗺️ API Reference

```
AUTH
  POST  /api/auth/register          Sync Firebase user → MongoDB
  GET   /api/auth/me                Get current user profile

GAMES
  GET   /api/games/search           ?q= — IGDB search
  GET   /api/games/trending         Trending games
  GET   /api/games/slug/:slug       Game detail by slug
  GET   /api/games/:id              Game detail by IGDB id
  GET   /api/games/:id/similar      Similar games
  GET   /api/games/:id/stats        Aggregated playtime stats
  POST  /api/games/:id/playtime     Submit completion time

USERS
  GET   /api/users/:id/library      User game library
  POST  /api/users/library          Add game to library
  GET   /api/users/:id/backlog      Backlog list
  GET   /api/users/:id/stats        Personal stats
  PATCH /api/users/:id/game/:gameId Update game status/progress

MISSIONS
  GET   /api/missions/:slug         Get missions + user progress
  POST  /api/missions/:slug/toggle  Toggle single mission complete
  POST  /api/missions/:slug/bulk    Mark multiple missions at once

STEAM
  POST  /api/steam/sync             Import Steam library
  GET   /api/steam/status           Last sync metadata

STATS
  GET   /api/stats/global           Platform-wide stats
  GET   /api/stats/breakdown        Personal playtime breakdown
  GET   /api/stats/shame            Pile of Shame data
  GET   /api/stats/predict/:id      AI playtime prediction
```

---

## 🎮 Supported Games (Mission Tracker)

| Game | Missions | Chapters |
|---|---|---|
| Grand Theft Auto V | 38+ main + 12 side | 5 chapters + endings |
| Elden Ring | 13 main bosses + 13 side | 7 regions |
| Red Dead Redemption 2 | 32 missions | Prologue + 6 chapters + epilogue |
| The Witcher 3: Wild Hunt | 19 main + 5 side | 5 acts |
| Cyberpunk 2077 | 20 main + 5 side | 3 acts |
| God of War | 11 main + 6 favors | 2 chapters |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT © QuestLog

---

<div align="center">
  <p>Built with obsession.</p>
  <p>
    <a href="https://questlog.gg">Live Demo</a> ·
    <a href="https://github.com/Ronak-1134/QuestLog/issues">Report Bug</a> ·
    <a href="https://github.com/Ronak-1134/QuestLog/issues">Request Feature</a>
  </p>
</div>
