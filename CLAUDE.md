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
# PowerShell:
$env:NODE_OPTIONS="--openssl-legacy-provider"; npx ng serve   # port 4200
# or: npm run start
```

### Frontend production build
```bash
cd frontend/storyvis
NODE_OPTIONS=--openssl-legacy-provider npx ng build --configuration=production
```

### Run tests
```bash
cd frontend/storyvis
npm test -- --include="**/provenance-graph-nodes.spec.ts" --watch=false
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
Express.js + MongoDB (Mongoose) + port 4000. Auth bypassed — `_helpers/jwt.js` is a passthrough. All routes open. Single `.env` at repo root.

Route modules: `users/`, `provGraphs/`, `provGraphsStudy/`, `stories/`, `storiesStudy/`, `textReports/`, `textReportsStudy/`, `ai/ai.controller.js` (Ollama proxy, `OLLAMA_MODEL` env var, default `llama3.2`).

### Frontend (`frontend/`)
Yarn workspace. Main app: `storyvis/` (Angular 10). Local libs: `provenance-core`, `provenance-tree-visualization-grouping`.

**Routing**: Single route `/` → lazy-loads `ExplorationModule`. All `**` redirect to `/`.

**Session identity**: No login. `SessionService` generates UUID in `localStorage` (`storyvis_session_id`). Used as `IDcreator` for all data ops.

**Node.js / build quirks**: Node v17+ needs `NODE_OPTIONS=--openssl-legacy-provider`. TypeScript pinned `~4.0.3`. Local libs must be built before Angular app.

### Key service wiring
- `ProvenanceVisualizationComponent` registers itself on `provenance.tree` in `ngOnInit` — service calls `this.tree.rewire(traverser)` on graph reset (no window globals).
- `ProvenanceSlidesComponent` assigns `provenance.deck` + `provenance.slideDeck` after constructing them — `saveStory` reads from service fields directly.
- `SessionStateService` — dataset/slice/W-L bus between canvas and AI service.
- `BookmarkService` + `ReflectionService` — localStorage persisted (`storyvis_bookmarks`, `storyvis_reflections`).

### Frontend app structure (`frontend/storyvis/src/app/`)
```
pages/tool/exploration/   — only active page; bottomHeight persisted to localStorage
components/
  brainvis-canvas/        — WebGL 4-panel viewer (AMI.js); undoStep/redoStep via traverser
  menu-bar/               — compact 44px toolbar; dark mat-menu; keyboard shortcuts dialog
  provenance-visualization/ — D3 tree; rewire() on graph reset; nodeAdded CD trigger
  provenance-slides/      — story deck; ViewChild DOM; no window globals
  ai-assistant-panel/     — Ollama chat; session context from SessionStateService
  bookmark-panel/         — dark-themed side panel
  reflection-panel/       — dark-themed; Ctrl+Enter to save
  keyboard-shortcuts-dialog/ — inline dialog; ? key shortcut
shared/_services/
  session-state.service.ts — dataset/slice/W-L reactive bus
  bookmark.service.ts     — localStorage persisted
  reflection.service.ts   — localStorage persisted
```

## Feature Status
- **Auth**: Removed. UUID sessions. — ✅
- **Provenance tree**: Empty state; nodeAdded CD; rewire on graph reset; no window globals. — ✅
- **Story deck**: No window globals; proper service wiring; ViewChild DOM. — ✅
- **Undo/Redo**: `undoStep`/`redoStep` on canvas via `traverser.toStateNode`. — ✅
- **AI assistant**: 30s timeout; session context (dataset/slices/W-L). — ✅
- **Bookmarks + Reflections**: Material dialogs; localStorage persisted. — ✅
- **Tests**: Karma + ChromeHeadless; 12 provenance graph node tests pass. — ✅
- **Build**: Zero errors/warnings. Production exit 0. — ✅
- **Deployment**: `netlify.toml` fixed (provenance-core build added); `render.yaml` created. — ✅

## Local Dev Notes
- Docker Desktop must be running before `docker start storyvis-mongo`
- `.env` for local: set `MONGODB_URI=mongodb://localhost:27017/storyvis`, `CORS_ORIGIN=http://localhost:4200`
- `.env` for production: Atlas URI with real password; never commit password to repo

## Session Log
Last session: `.claude/sessions/2026-07-01.md`

## Next Steps
1. Set Atlas password + Render secret env vars (`JWT_SECRET`, `MONGODB_URI`) in dashboards
2. Set Netlify env vars (`API_URL`, `DEBUG`) and verify build succeeds
3. End-to-end test: Docker stack locally (MongoDB + backend + frontend)
4. Test story deck: add slides, save story, reload — verify save/restore flow
5. Consider lazy-loading AMI.js / Three.js (reduce 2.8MB bundle)
