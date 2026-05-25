import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TutorialStep {
  title: string;
  content: string;
  targetId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Action prompt encouraging the user to try the feature themselves. */
  tryIt?: string;
  /** Power-user tip shown below the try-it prompt. */
  tip?: string;
}

// ── 1. Main app tour ──────────────────────────────────────────────────────────
const MAIN_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to StoryVis',
    content: 'A complete three-part interactive walkthrough:\n\n① Viewer Tour — canvas, tools, W/L controls\n② Provenance Graph Tour — your analysis history\n③ Story Editor Tour — building a report\n\nClick Next or the backdrop to advance.',
    position: 'center',
    tip: 'Each tour can also be replayed independently at any time using the help icon in the toolbar.'
  },
  {
    title: 'Four-Panel Canvas',
    content: 'The canvas shows four synchronised views simultaneously:\n\n🔵 Top-left — Axial (horizontal slices)\n⬜ Top-right — 3D perspective volume\n🟢 Bottom-left — Coronal (front-to-back)\n🔴 Bottom-right — Sagittal (left-to-right)\n\nColour-coded top borders identify each panel at a glance.',
    targetId: 'main',
    position: 'center',
    tip: 'The border colours match the orientation indicators in the provenance graph legend.'
  },
  {
    title: 'Navigating Through Slices',
    content: 'Scroll the mouse wheel inside any 2D panel to step through slices. The slice counter at the bottom-left of each panel updates as you scroll.\n\nAll three 2D panels are linked — scrolling one repositions the crosshair in the other two views automatically.',
    targetId: 'r0',
    position: 'right',
    tryIt: 'Scroll inside the axial panel (top-left) and watch the slice counter change.',
    tip: 'Fast scrolling generates aggregated nodes in the provenance graph — one large node represents the whole sequence.'
  },
  {
    title: 'Zoom and Pan',
    content: 'Hold Ctrl and scroll to zoom any panel independently. Right-drag to pan.\n\nZoom is per-panel — examine a lesion up close in the axial view while keeping the other panels at overview scale.',
    targetId: 'r0',
    position: 'right',
    tryIt: 'Hold Ctrl and scroll inside the axial panel to zoom in, then right-drag to pan.',
    tip: 'Ctrl+Scroll — zoom · Right-drag — pan. Each panel remembers its own zoom level.'
  },
  {
    title: 'Single-Panel Mode',
    content: 'Shift-click anywhere inside a panel to expand it to fill the full canvas — ideal for examining fine detail.\n\nShift-click again (or press the exit icon) to return to the four-panel layout. All crosshairs stay synchronised.',
    targetId: 'r0',
    position: 'right',
    tryIt: 'Shift-click inside any panel to expand it, then Shift-click again to restore the four-panel view.',
    tip: 'Expand to single-panel just before placing a measurement — a larger canvas makes clicking precisely much easier.'
  },
  {
    title: 'Axial View (top-left)',
    content: 'Horizontal cross-sections from superior (head) to inferior (feet). This is the primary plane for most CT reads.\n\nColour-coded border: blue.\n\nScroll — navigate slices · Right-drag — pan · Ctrl+scroll — zoom · Shift-click — expand',
    targetId: 'r0',
    position: 'right',
    tip: 'In clinical practice, axial is always interpreted first — it provides the richest anatomical context.'
  },
  {
    title: '3D Perspective View (top-right)',
    content: 'A volume-rendered 3D view. Use it to orient yourself spatially before interpreting cross-sections, and to understand the 3D extent of a structure.\n\nColour-coded border: grey.\n\nDrag — rotate · Scroll — zoom · Right-drag — pan',
    targetId: 'r1',
    position: 'left',
    tip: 'Capture the 3D view as your first Data-Comics frame — it gives reviewers immediate spatial orientation.'
  },
  {
    title: 'Coronal View (bottom-left)',
    content: 'Anterior-to-posterior slices. Useful for bilateral symmetry, midline structures, and judging the superior-to-inferior extent of a finding.\n\nColour-coded border: green.',
    targetId: 'r2',
    position: 'right',
    tip: 'Bilateral structures — kidneys, lungs, ventricles — are easiest to compare symmetrically in the coronal plane.'
  },
  {
    title: 'Sagittal View (bottom-right)',
    content: 'Left-to-right cross-sections. Scrolling any 2D panel updates the crosshair in the other two views automatically — you always see all three orthogonal planes at the same anatomical point.\n\nColour-coded border: red.',
    targetId: 'r3',
    position: 'left',
    tip: 'Sagittal is best for midline structures — spine, corpus callosum, cerebellum, pituitary.'
  },
  {
    title: 'Ruler — Distance Measurement',
    content: 'Click the space-bar icon to activate the ruler. Two clicks on any slice define a measurement in mm, computed from the DICOM voxel spacing — no calibration needed.\n\nClinical use: lesion diameter, organ size, inter-structure distance.',
    targetId: 'tutorial-ruler',
    position: 'bottom',
    tryIt: 'Click the ruler icon to activate it, then click two points on any slice to place a measurement.',
    tip: 'After placing a ruler, press Alt+Q to bookmark the state — the measurement is saved in the story slide.'
  },
  {
    title: 'Protractor — Angle Measurement',
    content: 'Click the launch icon to activate the protractor. Three clicks define an angle:\n\n① End of first arm\n② Vertex (the corner)\n③ End of second arm\n\nClinical use: Cobb angle, acetabular index, joint alignment.',
    targetId: 'tutorial-angle',
    position: 'bottom',
    tryIt: 'Click the protractor icon, then click three points on any slice — first arm, vertex, second arm.',
    tip: 'For spinal Cobb angles, place all three points on the coronal view for the most accurate measurement plane.'
  },
  {
    title: 'HU Probe — Voxel Density',
    content: 'Click the fingerprint icon to activate the HU probe. Click any voxel to read its Hounsfield Unit value — essential for tissue characterisation in CT.\n\nAir ≈ −1000 · Fat ≈ −100 · Water ≈ 0\nSoft tissue 20–80 · Liver 50–70 · Bone > 400 HU',
    targetId: 'tutorial-voxelprobe',
    position: 'bottom',
    tryIt: 'Click the fingerprint icon, then click different regions on any slice to read their HU values.',
    tip: 'Probe a region of interest before annotating — include the HU value in your annotation for precise characterisation.'
  },
  {
    title: 'Text Annotation',
    content: 'Click the speech-bubble icon to activate annotations. Click any location on a slice to drop a labelled pin and type a note.\n\nBest practice: "Hyperdense ~15 mm, right basal ganglia, HU ≈ 65 — acute haemorrhage?"\n\nAnnotations are saved in the provenance graph and appear in your story slides.',
    targetId: 'tutorial-annotation',
    position: 'bottom',
    tryIt: 'Click the annotation icon, then click a region on any slice to drop a pin and type a note.',
    tip: 'Structure annotations as: location → size → attenuation → differential. This maps directly to your story slide caption.'
  },
  {
    title: 'Window Width & Level',
    content: 'Window Width (W) controls contrast range — how many HU values map to the full greyscale.\nWindow Level (L) is the central HU value (brightness midpoint).\n\nNarrow W → high contrast for one tissue type\nWide W → broad overview of all tissues',
    targetId: 'tutorial-wl-slider',
    position: 'bottom',
    tip: 'Narrow the window first to identify the tissue type, then widen slightly to see surrounding context.'
  },
  {
    title: 'Window / Level Presets',
    content: 'Apply clinically optimised W/L settings in one click:\n\n• Brain (W 80 / L 40) — grey/white matter\n• Subdural (W 200 / L 100) — haematoma\n• Stroke (W 40 / L 40) — acute ischaemia\n• Lung (W 1500 / L −600) — airway and parenchyma\n• Bone (W 1800 / L 400) — cortex and trabeculae',
    targetId: 'tutorial-wl-preset',
    position: 'bottom',
    tryIt: 'Open the preset dropdown and try a few settings — notice how the image contrast changes instantly.',
    tip: 'Always bookmark (Alt+Q) your preferred W/L for each finding — the slide will show the optimal window.'
  },
  {
    title: 'Reset',
    content: 'Click the restore icon to return all four panels to their state at data-load time:\n\n• Slice positions back to centre\n• Zoom back to fit\n• W/L back to scan defaults\n• All measurements and annotations cleared',
    targetId: 'tutorial-reset',
    position: 'bottom',
    tip: 'Reset just before adding a summary slide — the default view is the clearest overview state for your conclusion.'
  },
  {
    title: 'Advanced Mode',
    content: 'Click the profile icon to unlock Advanced Mode, which adds four power-user tools:\n\n① Data-Comics Editor — capture and arrange panel screenshots\n② Compare Analyses — side-by-side scan comparison\n③ Analysis Support — overlay an expert reference session\n④ Load Analysis — restore a previously saved session',
    targetId: 'tutorial-advanced',
    position: 'left',
    tryIt: 'Click the profile icon to toggle Advanced Mode on — new tools will appear in the toolbar.',
    tip: 'Advanced Mode persists across sessions — it stays active until you turn it off manually.'
  },
  {
    title: 'Data-Comics Editor',
    content: 'Toggle the grid icon to open the Data-Comics canvas. Alt-click any panel to capture it as a frame, then arrange, annotate and export the result as an image.\n\nData-Comics is one of two ways to create a report in StoryVis. The other — Story Slides — is covered in the third tour.',
    targetId: 'tutorial-datacomics',
    position: 'bottom',
    tryIt: 'Toggle the grid icon to open the canvas, then Alt-click any panel to capture it as a frame.',
    tip: 'Capture before and after annotating to show the same region twice — one clean, one marked up — in the same layout.'
  },
  {
    title: 'Compare Analyses',
    content: 'Click the compare-arrows icon to split the canvas into two side-by-side panels — select a second dataset in the "Compare With" dropdown to load it in the right panel.\n\nUse cases: before/after treatment · trainee vs expert · multi-timepoint progression',
    targetId: 'tutorial-compare',
    position: 'bottom',
    tip: 'The Sync icon links slice navigation across both panels so scrolling one moves the other in lockstep.'
  },
  {
    title: 'Analysis Support & Load Analysis',
    content: 'Analysis Support — overlays a saved provenance graph as a reading guide. Compare your strategy with an expert\'s in real time.\n\nLoad Analysis — restores a full session: slice positions, W/L, annotations and the entire provenance graph.',
    targetId: 'tutorial-analysis-support',
    position: 'bottom',
    tip: 'Load an expert analysis before starting your own read — use it as a checklist of structures to inspect.'
  },
  {
    title: 'Viewer Tour Complete',
    content: 'You have seen the full viewer toolkit:\n✓ Multi-plane navigation and zoom\n✓ Ruler, protractor, HU probe\n✓ Text annotation\n✓ Window/level presets\n✓ Data-Comics frame capture\n✓ Advanced comparison tools\n\nThe tour continues with the Provenance Graph.',
    position: 'center',
    tip: 'Every scroll and measurement you make creates a node in the provenance graph — the history is already building.'
  }
];

// ── 2. Provenance graph tour ──────────────────────────────────────────────────
const PROVENANCE_STEPS: TutorialStep[] = [
  {
    title: 'Provenance Graph Tour',
    content: 'The Provenance Graph is a branching, interactive record of every action you take. This tour covers:\n\n• Reading and navigating the tree\n• Node colours and sizes\n• Filtering by action type\n• Branching and forking analyses\n• Bookmarking key findings',
    targetId: 'sidenav-trigger',
    position: 'left',
    tryIt: 'Click the menu icon to open the Provenance Graph panel.',
    tip: 'The graph already contains every action from the Viewer Tour — the history is already building.'
  },
  {
    title: 'What is Provenance?',
    content: '"Provenance" means origin or history. The graph is a non-destructive, complete record of your session.\n\nEvery scroll, zoom, W/L change, measurement and annotation creates a node. Nothing is ever deleted — you can step back to any state at any time.\n\nThe graph reads top-to-bottom: root at the top, newest actions at the bottom.',
    position: 'center',
    tip: 'Navigating backward never erases forward history — the full tree is always preserved.'
  },
  {
    title: 'Navigate Backward and Forward',
    content: 'The ↑ button steps back one node, restoring the exact viewer state at that point — slice, zoom, W/L and annotations all revert together.\n\nThe ↓ button moves forward one node. Shuttle freely in both directions without losing any branch.',
    targetId: 'upward-trigger',
    position: 'right',
    tryIt: 'Click ↑ several times to step back through earlier states, then ↓ to replay them.',
    tip: 'Keyboard shortcut: ↑ / ↓ arrow keys navigate backward and forward without touching the mouse.'
  },
  {
    title: 'Click Any Node to Jump',
    content: 'Click any circle in the graph to instantly jump to that exact state — the entire viewer snapshot (slice, zoom, W/L, annotations, measurements) is replayed.\n\nNo matter how deep in your session, any earlier finding is one click away.',
    position: 'center',
    tryIt: 'Click any node in the graph and watch the viewer panels update to that exact state.',
    tip: 'Right-click any node for a context menu with bookmark, branch, and delete options.'
  },
  {
    title: 'Node Colour — Action Type',
    content: 'Node colour encodes the type of action:\n\n🟦 Teal — exploration (scrolling, rotating)\n🔵 Blue — selection (structure click)\n🟠 Orange — configuration (W/L, zoom)\n🔴 Red — derivation (measurement result)\n🟣 Purple — provenance action (graph navigation)\n🟡 Yellow — annotation (placed text)\n⚪ White ring — bookmarked (added to story)',
    targetId: 'legendContainer',
    position: 'right',
    tip: 'White-ringed nodes are your bookmarks — they are already added to your story slides deck.'
  },
  {
    title: 'Node Size — Aggregation',
    content: 'Rapid sequences of similar actions (e.g. continuous scrolling) are collapsed into a single larger node. The number inside shows how many raw actions were merged.\n\nAggregation keeps the graph readable — clicking an aggregated node still restores the correct endpoint state.',
    position: 'center',
    tip: 'Large aggregated nodes usually mark your most active exploration phase — worth revisiting.'
  },
  {
    title: 'Filter by Action Type',
    content: 'The filter buttons toggle visibility of specific node types to reduce clutter.\n\nExample: hide exploration (navigation) nodes to see only the moments where you made a measurement or annotation — your diagnostic decisions isolated from browsing history.',
    targetId: 'exploration-trigger',
    position: 'left',
    tryIt: 'Click the filter buttons to hide and show different node types — notice the graph simplify.',
    tip: 'Combine filters with layout options for the clearest view of your decision trail before building your story.'
  },
  {
    title: 'Graph Layout Options',
    content: 'Alternative layouts reorganise the tree:\n\n• Default — standard hierarchical tree\n• Caterpillar — active branch as a vertical spine; branches project sideways\n• Elastic Tree — nodes spaced by elapsed time\n• Story Order — nodes reordered to match your story slides',
    position: 'center',
    tip: 'Story Order layout is most useful after rearranging slides — it lets you verify the story flow at a glance.'
  },
  {
    title: 'Fork from the Current State',
    content: 'The ⊕ (filled) button creates a new branch from exactly where you are — your current branch is preserved while you explore an alternative path.\n\nExample: fork at a suspicious region, then measure it two different ways on two separate branches.',
    targetId: 'newAnalysisFromCurrentNode-trigger',
    position: 'right',
    tryIt: 'Click the ⊕ button to create a branch, then continue exploring — both paths remain in the graph.',
    tip: 'Branching is fully non-destructive — switch back to any branch at any time without losing work.'
  },
  {
    title: 'Start a Fresh Analysis',
    content: 'The ⊕ (outlined) button starts a clean analysis from the root while the previous branch is fully preserved.\n\nUseful for:\n• Testing a different diagnostic hypothesis\n• An unbiased second read\n• Demonstrating alternative reading strategies',
    targetId: 'newAnalysis-trigger',
    position: 'right',
    tip: 'Run a fresh read, then compare both trees side by side in Comparison Mode to audit differences in strategy.'
  },
  {
    title: 'Minimap — Tree Overview',
    content: 'The minimap at the bottom of the panel shows the full graph at reduced scale. The shaded rectangle marks the visible region — drag it to pan.\n\nAs your session grows into a large branching tree, the minimap is essential for orientation.',
    targetId: 'scaleValue',
    position: 'top',
    tip: 'Use the minimap to jump to the start of a branch when the tree is wide.'
  },
  {
    title: 'Save the Provenance Graph',
    content: 'Click the save icon to store your complete provenance graph on the server — every node, branch, annotation and measurement is preserved.\n\nSaved graphs appear in the Load Analysis and Analysis Support dropdowns in the toolbar.',
    targetId: 'saveGraph-trigger',
    position: 'right',
    tip: 'Save mid-session as well as at the end — it lets you restore a partial analysis if you need to pause and return later.'
  },
  {
    title: 'Bookmark a Key Finding',
    content: 'When you reach a state that captures an important finding — the right slice, W/L and annotations in place — bookmark it:\n\nRight-click the active node  —  or press Alt+Q.\n\nThe node gets a white outer ring and is instantly added to your Story Editor as a new slide.',
    position: 'center',
    tryIt: 'Navigate to a meaningful state, then press Alt+Q to bookmark it — watch the node gain a white ring.',
    tip: 'Alt+Q works anywhere — you do not need to be in the provenance panel. Bookmark while the finding is still in focus.'
  },
  {
    title: 'Provenance Tour Complete',
    content: 'You can now read, navigate, filter and branch the provenance graph — and bookmark key moments into your story.\n\nThe richer your analysis, the more powerful the graph.\n\nThe tour continues with the Story Editor.',
    position: 'center',
    tip: 'The story deck already contains every bookmark you added — open it now to start captioning.'
  }
];

// ── 3. Story Editor + Data-Comics tour ───────────────────────────────────────
const SLIDEDECK_STEPS: TutorialStep[] = [
  {
    title: 'Story & Report Tour',
    content: 'The final tour covers the two ways to create a report:\n\n📖 Story Slides — curate bookmarked states into a structured, captioned narrative\n🗞 Data-Comics — arrange captured panel screenshots in a freeform visual layout\n\nOpen the Story Editor with the message icon at the bottom-left.',
    targetId: 'sidenavBottom-trigger',
    position: 'top',
    tryIt: 'Click the message icon to open the Story Editor panel at the bottom of the screen.',
    tip: 'Both report formats are created from the same session — no re-reading required.'
  },
  {
    title: 'What is a Story?',
    content: 'A story is an ordered sequence of slides. Each slide captures the exact viewer state at a bookmarked moment — slice, zoom, W/L and annotations — plus a title and caption you write.\n\nUnlike a static screenshot, each slide is a live, clickable state: click it to restore the viewer to that exact moment.',
    position: 'center',
    tip: 'Slides are interactive, not frozen images — clicking a thumbnail in the deck restores the full four-panel viewer instantly.'
  },
  {
    title: 'The Slide Deck',
    content: 'The filmstrip shows your slides in sequence. Each thumbnail captures what the canvas looked like at that bookmarked moment.\n\nThe selected slide has an accent border. Click any thumbnail to instantly restore the viewer — all four panels update simultaneously.',
    targetId: 'slideDeck',
    position: 'top',
    tip: 'Use Tab / Shift+Tab to move through slide thumbnails without touching the mouse.'
  },
  {
    title: 'Adding Slides',
    content: 'Navigate to a key moment in your analysis, then press Alt+Q (or right-click a graph node) to add it as the next slide.\n\nSuggested story arc:\n① Wide-view orientation\n② Primary finding — zoomed, annotated\n③ Measurement visible\n④ Differential or alternative view\n⑤ Summary / conclusion',
    targetId: 'slideDeck',
    position: 'top',
    tryIt: 'Navigate to a key state in the viewer, then press Alt+Q to add it as a slide.',
    tip: 'Minimum of 4 slides per case recommended: overview → finding → measurement → conclusion.'
  },
  {
    title: 'Title and Caption',
    content: 'With a slide selected, type a concise title and a specific caption in the text fields next to the thumbnail.\n\nModel caption: "15 mm hyperdense focus, right basal ganglia (HU ≈ 65). Consistent with acute haemorrhage. No underlying mass enhancement. Recommend urgent CTA."\n\nCaptions form the written component of your report.',
    targetId: 'slideDeck',
    position: 'top',
    tryIt: 'Select a slide and type a title and caption in the text fields — describe what you see and why it matters.',
    tip: 'Caption structure: location → size → attenuation → differential → recommendation.'
  },
  {
    title: 'Reordering and Playing',
    content: 'Drag and drop slides to arrange them into a logical reading sequence.\n\nClick the Play button to replay the story — the viewer restores each slide\'s state in sequence at a set interval. Share your screen and play to walk a colleague through your findings.',
    targetId: 'slideDeck',
    position: 'top',
    tryIt: 'Drag slides to reorder them, then click Play to watch the viewer replay the story automatically.',
    tip: 'Auto-play interval: 5 s for peer review, 10 s for teaching. Playback can be paused at any slide for discussion.'
  },
  {
    title: 'Method 2 — Data-Comics',
    content: 'Data-Comics is a complementary format. Instead of a timed slideshow, you arrange panel screenshots in a freeform canvas — like a scientific figure or comic strip.\n\n📖 Story Slides — structured narrative with captions, permanent auditable record\n🗞 Data-Comics — visual evidence panel, static export for reports and publications',
    position: 'center',
    tip: 'Use both: submit the story as the formal record, export the comic for the written report appendix.'
  },
  {
    title: 'Capturing Frames for Data-Comics',
    content: 'Toggle the grid icon to open the Data-Comics canvas. Then Alt-click any panel to capture it as a frame.\n\nCapture strategy:\n① 3D overview — orientation\n② Axial — primary finding, annotated\n③ Coronal — bilateral extent\n④ Sagittal — anterior/posterior extent',
    targetId: 'tutorial-datacomics',
    position: 'bottom',
    tryIt: 'Open the Data-Comics canvas, then Alt-click each panel to capture it as a frame.',
    tip: 'Capture the 3D view last — having it in the frame set gives reviewers immediate spatial orientation.'
  },
  {
    title: 'Arranging Your Visual Report',
    content: 'Drag frames on the Data-Comics canvas to build your layout:\n\n• Horizontal strip — sequential narrative\n• 2×2 grid — multi-plane comparison\n• Annotated pair — finding + measurement side by side\n\nAdd text boxes with the mode_comment icon. Download with the save_alt icon.',
    position: 'center',
    tip: 'A 2×2 multi-plane layout (axial + coronal + sagittal + 3D) is the clearest way to show a lesion in full spatial context.'
  },
  {
    title: 'Saving and Submitting',
    content: 'Your story is saved automatically as you build it. When you click NEXT to proceed:\n\n• All story slides, captions and ordering are submitted\n• Your provenance graph is stored with full branch history\n• All annotations are preserved\n\nThis creates a complete, auditable record — every decision traceable to the imaging evidence.',
    position: 'center',
    tip: 'Once submitted, the story and graph are read-only on the server — ensure all captions are complete before clicking NEXT.'
  },
  {
    title: 'All Three Tours Complete',
    content: 'You have completed the full StoryVis walkthrough:\n\n① Viewer Tour — navigation, measurements, annotations, W/L\n② Provenance Graph Tour — history, filtering, branching, bookmarking\n③ Story & Report Tour — slides, captions, data-comics, export\n\nYou are ready to begin your analysis.',
    position: 'center',
    tip: 'Key shortcuts: Alt+Q — bookmark · ↑↓ — graph navigation · Ctrl+Scroll — zoom · Shift+Click — single-panel'
  }
];

@Injectable({ providedIn: 'root' })
export class TutorialService {
  private _steps: TutorialStep[] = MAIN_STEPS;
  /** Queued tours to launch automatically when the current tour finishes. */
  private _chain: TutorialStep[][] = [];

  private readonly _idx$ = new BehaviorSubject<number>(-1);
  readonly idx$ = this._idx$.asObservable();

  get steps(): TutorialStep[] { return this._steps; }
  get active()       { return this._idx$.value >= 0; }
  get currentIndex() { return this._idx$.value; }
  get current()      { return this._steps[this._idx$.value]; }

  /** Launch a tour, with optional subsequent tours queued. */
  private _launch(steps: TutorialStep[], ...chain: TutorialStep[][]): void {
    this._steps = steps;
    this._chain = chain;
    this._idx$.next(0);
  }

  /** Full three-tour walkthrough: Viewer → Provenance → Story & Report. */
  startMain() { this._launch(MAIN_STEPS, PROVENANCE_STEPS, SLIDEDECK_STEPS); }
  /** Backward-compatible alias. */
  start()     { this.startMain(); }

  stop(): void {
    this._chain = [];
    this._idx$.next(-1);
  }

  next(): void {
    const n = this._idx$.value + 1;
    if (n < this._steps.length) {
      this._idx$.next(n);
    } else if (this._chain.length > 0) {
      const [nextSteps, ...rest] = this._chain;
      this._launch(nextSteps, ...rest);
    } else {
      this._idx$.next(-1);
    }
  }

  prev(): void {
    const cur = this._idx$.value;
    if (cur > 0) { this._idx$.next(cur - 1); }
  }
}
