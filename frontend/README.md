# Webloom frontend

React editor for Webloom. Talks to the Express API in `../backend`.

## Setup

```bash
npm install
cp .env.development.example .env.development
npm run dev
```

Dev server: `http://localhost:4061` (proxies `/api` to `http://localhost:4062`).

## Env files

| File | Git | Used by |
|------|-----|---------|
| `.env.development.example` | yes | template for local |
| `.env.production.example` | yes | template for Vercel / VPS |
| `.env.development` | no | `npm run dev` |
| `.env.production` | no | `npm run build` |

On a VPS, copy the production example and set the live API URL:

```bash
cp .env.production.example .env.production
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (port 4061) |
| `npm run build` | Typecheck and production bundle |
| `npm run preview` | Serve the production bundle locally (port 4173, proxies `/api`) |

## Vercel

1. New Project → this repo → **Root Directory** `frontend`
2. Framework Preset: Vite (auto)
3. Environment variable (Production and Preview, **build-time**):

```env
VITE_API_BASE_URL=https://your-service.onrender.com
```

Same value as `.env.production.example`. `/api` is appended if you pass the origin only.

4. Deploy. `vercel.json` rewrites `/preview` and other SPA routes to `index.html`.

Vite inlines `VITE_*` at build time. Changing the API URL requires a new frontend deploy.
