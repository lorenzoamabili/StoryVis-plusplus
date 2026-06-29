# StoryVis

Medical imaging user study tool. Angular 10 frontend + Node.js/Express backend + MongoDB.
No user accounts required — all users get full access via anonymous UUID sessions.

## Quick Start

### 1. MongoDB (Docker)
```bash
# First time
docker run -d -p 27017:27017 --name storyvis-mongo mongo:6
# Subsequent runs
docker start storyvis-mongo
```

### 2. Backend
```bash
cd backend
npm install
node server.js   # port 4000
```

### 3. Frontend (dev)
```bash
cd frontend
yarn install   # installs all workspace packages

# Build local libs first (only needed if dist/ is missing)
cd provenance-core && npm run build && cd ..
cd provenance-tree-visualization-grouping && npm run build && cd ..

# Start dev server
cd storyvis
NODE_OPTIONS=--openssl-legacy-provider npx ng serve   # port 4200
```

### 4. Frontend (production build)
```bash
cd frontend/storyvis
NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production
# Output: frontend/storyvis/dist/
```

## Environment

Copy `.env.example` to `.env` at the repo root:
```
JWT_SECRET=changeme
MONGO_URI=mongodb://localhost:27017/storyvis
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Architecture

- **Frontend**: Single-page Angular app (`/` → exploration tool). No login flow.
- **Backend**: Express.js on port 4000. Auth middleware is a passthrough (no JWT enforcement).
- **Session identity**: UUID stored in `localStorage` scopes all saved data per browser session.
- **AI assistant**: Proxied to local Ollama instance (`/ai/chat`).

## Production (Docker Compose)
```bash
docker compose up -d
```
See `docker-compose.yml` and `Caddyfile` for reverse-proxy and HTTPS config.

For questions: l.amabili@rug.nl
