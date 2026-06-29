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
Express.js + MongoDB (Mongoose) + port 4000. Auth bypassed — `_helpers/jwt.js` is a passthrough. All routes open. Single `.env` at repo root.

Route modules: `users/`, `provGraphs/`, `provGraphsStudy/`, `stories/`, `storiesStudy/`, `textReports/`, `textReportsStudy/`, `ai/ai.controller.js` (Ollama proxy, `OLLAMA_MODEL` env var, default `llama3.2`).

### Frontend (`frontend/`)
Yarn workspace. Main app: `storyvis/` (Angular 10). Local libs: `provenance-core`, `provenance-tree-visualization-grouping`.

**Routing**: Single route `/` → lazy-loads `ExplorationModule`. All `**` redirect to `/`. Dead pages (`pages/shared/**`, `pages/tool/practice/**`, intro pages) excluded from TS compilation via `tsconfig.app.json`.

**Session identity**: No login. `SessionService` generates UUID in `localStorage` (`storyvis_session_id`). Used as `IDcreator` for all data ops.

**Node.js / build quirks**: Node v17+ needs `NODE_OPTIONS=--openssl-legacy-provider`. TypeScript pinned `~4.0.3`. Local libs must be built before Angular app.

### Frontend app structure (`frontend/storyvis/src/app/`)
```
pages/tool/exploration/   — only active page (single-page app)
components/
  brainvis-canvas/        — WebGL 4-panel viewer (AMI.js); auto-loads Chest CT 1 on init
  menu-bar/               — toolbar: dataset picker, W/L, cine, bookmarks, reflections, save, AI
  bookmark-panel/         — dark-themed side panel (BookmarkService)
  bookmark-label-dialog/  — Material dialog replaces window.prompt for bookmark naming
  debrief-modal/          — session reflection (coverage bars + questions + confidence)
  quick-reflection-dialog/— type-chip reflection entry dialog
  reflection-panel/       — dark-themed; Ctrl+Enter to save edits
  ai-assistant-panel/     — Ollama chat; 30s timeout + error display
  provenance-visualization/ — D3 tree; dark-themed borders + gold bookmark markers
  provenance-slides/      — story deck slide editor
shared/_services/
  session.service.ts      — UUID session identity
  bookmark.service.ts     — bookmark storage
  ai-assistant.service.ts — Ollama HTTP client with timeout/catchError
```

## Feature Status
- **Auth**: Removed. UUID sessions. — ✅
- **Single-page tool**: All routes → ExplorationComponent. — ✅
- **Dataset picker**: CT1 auto-loads; Brain MRI switchable. — ✅
- **Bookmarks**: Material dialog (no window.prompt). — ✅
- **AI assistant**: 30s timeout + error bubbles in chat. — ✅
- **Mobile**: Secondary toolbar tools hidden ≤767px. — ✅
- **Build**: Zero errors/warnings. Production exit 0. — ✅
- **Style**: Unified dark theme all panels; gold accent system-wide. — ✅

## Session Log
Last session: `.claude/sessions/2026-06-29.md`

## Next Steps
1. End-to-end test with Docker stack (MongoDB + backend + frontend)
2. Verify AI panel + Ollama timeout path
3. Check D3 provenance tree after CSS font/color changes
4. Consider lazy-loading AMI.js / Three.js (reduce 2.8MB bundle)
5. CSP header allowing Ollama localhost without `unsafe-inline`
