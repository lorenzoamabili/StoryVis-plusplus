# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### MongoDB (Docker — must be running first)
```bash
docker start storyvis-mongo
# First time: docker run -d -p 27017:27017 --name storyvis-mongo mongo:6
```

### Backend
```bash
cd backend && node server.js   # port 4000
```

### Frontend dev server
```bash
cd frontend/storyvis
NODE_OPTIONS=--openssl-legacy-provider npx ng serve   # port 4200
# or: npm run start
```

### Frontend production build
```bash
cd frontend/storyvis
NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production
```

### Build workspace libs (required when dist/ missing)
```bash
cd frontend/provenance-core && npm run build
cd frontend/provenance-tree-visualization-grouping && npm run build
```

### Install dependencies
```bash
cd frontend && yarn install   # workspace — do NOT npm install in subfolders
cd backend && npm install
```

## Architecture

### Backend (`backend/`)
Express.js + MongoDB (Mongoose) + JWT auth on port 4000. Single `.env` at repo root (loaded by `dotenv` with `path: '../.env'`). All routes are JWT-protected except `/health` and the rate-limited `/users/authenticate` + `/users/register`.

Route modules:
- `users/` — auth, registration, user model
- `provGraphs/` / `provGraphsStudy/` — provenance graph storage (practice vs study)
- `stories/` / `storiesStudy/` — data-comics story decks
- `textReports/` / `textReportsStudy/` — text reports
- `ai/ai.controller.js` — Ollama proxy; model configurable via `OLLAMA_MODEL` env var (default `llama3.2`, host via `OLLAMA_HOST`)

### Frontend (`frontend/`)
Yarn workspace containing:
- `storyvis/` — Angular 10 main app
- `provenance-core/` — local lib: provenance graph data model
- `provenance-tree-visualization-grouping/` — local lib: D3 provenance tree component

**Node.js / build quirks:**
- Node v17+ requires `NODE_OPTIONS=--openssl-legacy-provider` (webpack 4 / OpenSSL conflict)
- TypeScript pinned at `~4.0.3` (Angular 10 incompatible with TS ≥ 4.1)
- Local libs must be built before the Angular app

### Frontend app structure (`frontend/storyvis/src/app/`)
```
pages/
  shared/     — login, register, home, questionnaire, thanks
  tool/       — practice + exploration study sessions
    practice/
    exploration/
components/
  brainvis-canvas/     — WebGL medical image viewer (AMI.js)
  menu-bar/            — toolbar: undo/redo, cine, loupe, bookmarks, reflection
  bookmark-panel/      — side panel for bookmark management
  debrief-modal/       — post-session reflection dialog
  quick-reflection-dialog/
  reflection-panel/
  ai-assistant-panel/  — Ollama chat UI
  provenance-slides/   — story deck slide editor
  provenance-visualization/ — D3 provenance tree
  text-report/
  tutorial/
shared/
  _services/   — AuthService, CoverageService, BookmarkService, etc.
  _helpers/    — JWT interceptor, error interceptor, auth guard
  _models/
```

### Key data flows
- `brainvis-canvas` is the WebGL viewer; it calls `CoverageService.recordVisit()` on every slice scroll.
- Provenance graph records every viewer action; `BookmarkService` tags nodes.
- `ai-assistant-panel` calls `POST /ai/chat` with session context (bookmarks, reflections, coverage, frames, slides, provenance path) — Ollama handles LLM inference locally.
- API base URL configured at runtime via `frontend/storyvis/src/assets/env.js` (`window.env.apiUrl`); change this file for local dev, `env.template.js` handles deploy-time substitution.

### Study vs Practice
The app has two parallel data namespaces: `provGraphs`/`stories`/`textReports` (practice) and `provGraphsStudy`/`storiesStudy`/`textReportsStudy` (study). Both share the same schema/controllers pattern.
