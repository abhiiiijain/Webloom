# Webloom API

Express + MongoDB backend for the Webloom editor.

## Setup

```bash
npm install
cp .env.development.example .env.development
npm run dev
```

API: `http://localhost:4062/api/health`

## Env files

| File | Git | Used by |
|------|-----|---------|
| `.env.development.example` | yes | template for local |
| `.env.production.example` | yes | template for Render / VPS |
| `.env.development` | no | `npm run dev` |
| `.env.production` | no | `npm start` on the server |

On a VPS, copy the production example, fill in Atlas and the frontend origin, then start with `NODE_ENV=production`:

```bash
cp .env.production.example .env.production
npm run build
NODE_ENV=production npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode (port 4062) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run seed` | Seed the demo Home page |

## Render

1. New Web Service → this repo → **Root Directory** `backend`
2. Node version: **20** (Settings → Node, or `engines` in package.json)
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start` — do not use `yarn start`
5. Health check: `/api/health`
6. Environment:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
FRONTEND_ORIGIN=https://webloom.abhiiiijain.com,https://www.webloom.abhiiiijain.com
```

`FRONTEND_ORIGIN` can be a comma-separated list (production + preview URLs, no trailing slash). Leave it unset to allow any origin (useful for a first deploy).

MongoDB Atlas: allow Render IPs, or `0.0.0.0/0` for a demo.

Or apply the Blueprint at the repo root (`render.yaml`).
