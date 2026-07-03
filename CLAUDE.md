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
cd frontend/slide-deck-visualization && npm run build
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
Yarn workspace. Main app: `storyvis/` (Angular 10). Local libs: `provenance-core`, `provenance-tree-visualization-grouping`, `slide-deck-visualization`.

**Routing**: Single route `/` → lazy-loads `ExplorationModule`. All `**` redirect to `/`.

**Session identity**: No login. `SessionService` generates UUID in `localStorage` (`storyvis_session_id`). Used as `IDcreator` for all data ops.

**Node.js / build quirks**: Node v17+ needs `NODE_OPTIONS=--openssl-legacy-provider`. TypeScript pinned `~4.0.3`. Local libs must be built before Angular app.

### Key service wiring
- `ProvenanceVisualizationComponent` registers itself on `provenance.tree` in `ngOnInit` — service calls `this.tree.rewire(traverser)` on graph reset.
- `ProvenanceSlidesComponent` assigns `provenance.deck` + `provenance.slideDeck` + `storyVisBridge.slideDeck` after constructing deck.
- `ProvenanceService.init()` sets `storyVisBridge.provenance = this` — lib calls Angular service methods via bridge (no window globals).
- `SessionStateService` — dataset/slice/W-L reactive bus between canvas and AI service.
- `BookmarkService` + `ReflectionService` — localStorage persisted (`storyvis_bookmarks`, `storyvis_reflections`).
- `graphReset$` is a `ReplaySubject<void>(1)` — late subscribers receive last emission immediately.

### storyVisBridge (lib ↔ Angular)
`frontend/provenance-tree-visualization-grouping/src/bridge.ts` — typed module singleton.
- `bridge.provenance` = `ProvenanceService` instance (set in `init()`)
- `bridge.slideDeck` = `SlideDeckVisualization` instance (set in `ProvenanceSlidesComponent._initDeck()`)
- Used by lib to call `generation/fission/splitting/transferring/merging/copying/saveGraph/saveStory` and `slideDeck.onAdd/onDelete`
- **No window globals anywhere in app or lib.**

### Frontend app structure (`frontend/storyvis/src/app/`)
```
pages/tool/exploration/   — only active page; bottomHeight persisted to localStorage
components/
  brainvis-canvas/        — WebGL 4-panel viewer (AMI.js); undoStep/redoStep via traverser
  menu-bar/               — compact 44px toolbar; dark mat-menu; keyboard shortcuts dialog
  provenance-visualization/ — D3 tree; rewire() on graph reset; nodeAdded CD trigger
  provenance-slides/      — story deck; ViewChild DOM; no window globals
  ai-assistant-panel/     — Ollama chat; session context from SessionStateService
  bookmark-panel/         — dark-themed side panel; navigateTo() works
  reflection-panel/       — dark-themed; Ctrl+Enter to save
  keyboard-shortcuts-dialog/ — inline dialog; ? key shortcut
  confirm-dialog/         — generic confirm/cancel dialog (ConfirmDialogData)
shared/_services/
  session-state.service.ts — dataset/slice/W-L reactive bus
  bookmark.service.ts     — localStorage persisted
  reflection.service.ts   — localStorage persisted
```

## Feature Status
- **Auth**: Removed. UUID sessions. — ✅
- **Provenance tree**: Empty state; nodeAdded CD; rewire on graph reset; listener cleanup on rewire. — ✅
- **Story deck**: Proper service wiring; setDeck() re-registers handlers; annotation persistence fixed. — ✅
- **SPA refactor**: All window globals removed; lib↔Angular via `storyVisBridge` singleton. — ✅
- **Undo/Redo**: Snackbar feedback + SessionState sync after traversal. — ✅
- **AI assistant**: 30s timeout; session context (dataset/slices/W-L/currentNode/nodeCount/slideCount). — ✅
- **Bookmarks + Reflections**: Material dialogs; localStorage persisted; navigateTo() works. — ✅
- **Load UI**: Save/load graphs+stories in more-menu (no Advanced Mode required). — ✅
- **Dataset switch warning**: ConfirmDialog before reset; selector reverts on cancel. — ✅
- **Cine**: Loop toggle (loop/stop-at-end); stops on loadData to prevent stackHelper race. — ✅
- **Provenance registry**: Correct action names; getFunctionByName error-safe; acceptActions race fixed; registryComparison populated. — ✅
- **Tests**: Karma + ChromeHeadless; 12 provenance graph node tests pass. — ✅
- **Build**: Zero errors/warnings. Production exit 0. — ✅
- **Deployment**: `netlify.toml` fixed; `render.yaml` created. — ✅

## Local Dev Notes
- Docker Desktop must be running before `docker start storyvis-mongo`
- `.env` for local: set `MONGODB_URI=mongodb://localhost:27017/storyvis`, `CORS_ORIGIN=http://localhost:4200`
- `.env` for production: Atlas URI with real password; never commit password to repo

## Session Log
Last session: `.claude/sessions/2026-07-03.md`

## Next Steps
1. End-to-end test with Docker stack — verify story deck save/restore with annotations, undo/redo SessionState sync, dataset switch confirm flow
2. Set Atlas password + Render/Netlify env vars for cloud deployment (`CORS_ORIGIN=https://storyvis.netlify.app,http://localhost:4200`)
3. Test comparison mode — `registryComparison` now populated; verify copyNodes/transferring work
4. Consider lazy-loading AMI.js / Three.js (reduce 2.8MB bundle)
5. Add provenance node count / slide count display in UI so users know their progress
