# Webloom

Build. Design. Bloom.

Full-stack drag-and-drop website builder demo with:

- **Frontend:** React + Vite + Mantine (`frontend/`)
- **Backend:** Express + TypeScript (`backend/`)
- **Database:** MongoDB (local)

This project is separate from `store-admin-frontend`.

## Prerequisites

1. **Node.js 20+**
2. **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### Start MongoDB

**Windows (if installed as service):**
```bash
net start MongoDB
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Docker:**
```bash
docker run -d --name website-builder-mongo -p 27017:27017 mongo:7
```

## Quick start

Install and run each app in its own folder.

**Terminal 1 — backend (port 4062):**
```bash
cd website-builder-demo/backend
npm install
npm run dev
```

**Terminal 2 — frontend (port 4061):**
```bash
cd website-builder-demo/frontend
npm install
npm run dev
```

- Frontend: `http://localhost:4061`
- Backend API: `http://localhost:4062/api/health`

On first backend start, a **Home** page and default draft layout are seeded automatically.

## Project structure

```text
website-builder-demo/
├── frontend/              # React app (port 4061)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   ├── index.html
│   ├── .env.development.example
│   ├── .env.production.example
│   └── package.json
├── backend/               # Express API (port 4062)
│   ├── src/
│   ├── .env.development.example
│   ├── .env.production.example
│   └── package.json
```

## Scripts

Run these from `frontend/` or `backend/`, not the repo root.

| Location | Command | Description |
|----------|---------|-------------|
| `frontend/` | `npm run dev` | Dev server (port 4061) |
| `frontend/` | `npm run build` | Production build |
| `backend/` | `npm run dev` | API (port 4062) |
| `backend/` | `npm run seed` | Seed demo page + layout in MongoDB |

## API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/pages` | List pages |
| GET | `/api/pages/:pageId/layout/draft` | Load draft layout |
| GET | `/api/pages/:pageId/layout/published` | Load published layout |
| PUT | `/api/pages/:pageId/layout/draft` | Save draft layout |
| POST | `/api/pages/:pageId/layout/publish` | Publish draft → live |
| POST | `/api/pages/:pageId/layout/reset` | Reset draft to defaults |

## Environment

**Local** — copy the development examples:

```bash
cp frontend/.env.development.example frontend/.env.development
cp backend/.env.development.example backend/.env.development
```

```env
# frontend/.env.development
VITE_API_BASE_URL=/api

# backend/.env.development
NODE_ENV=development
PORT=4062
MONGODB_URI=mongodb://127.0.0.1:27017/website-builder-demo
FRONTEND_ORIGIN=http://localhost:4061
```

**VPS / production** — copy the production examples, then replace placeholders:

```bash
cp frontend/.env.production.example frontend/.env.production
cp backend/.env.production.example backend/.env.production
```

Committed files are `*.example` only. Real `.env.development` and `.env.production` are gitignored.

## How saving works

1. Frontend loads the draft layout from MongoDB on mount
2. Drag, resize, and edits update local React state immediately
3. Click **Save** or press Ctrl/Cmd+S to persist with `PUT /layout/draft`
4. Preview and Publish flush an unsaved draft first
5. Closing the tab with unsaved changes shows a browser warning
6. **Publish** copies draft → published layout

## MongoDB collections

| Collection | Purpose |
|------------|---------|
| `pages` | Page metadata (slug, title, SEO) |
| `layouts` | Draft + published layout trees per page |

## Deploy

Split hosting: **Vercel** (frontend) + **Render** (API) + **MongoDB Atlas**.

1. **Atlas** — create a cluster, database user, and connection string. Network access: allow Render (or `0.0.0.0/0` for a demo).
2. **Render** — Web Service, root directory `backend`.
   - Build: `npm install --include=dev && npm run build`
   - Start: `npm start`
   - Health: `/api/health`
   - Env: `NODE_ENV=production`, `MONGODB_URI`, `FRONTEND_ORIGIN=https://webloom.abhiiiijain.com,https://www.webloom.abhiiiijain.com`
3. **Vercel** — Project, root directory `frontend`.
   - Env (build-time): `VITE_API_BASE_URL=https://your-service.onrender.com`
   - Redeploy the frontend after the API URL is set.

Local uses `.env.development` (`VITE_API_BASE_URL=/api`). Vite still proxies to port 4062.

