import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef,
  HostListener, OnDestroy, OnInit, ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ProvenanceService } from '../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { ProvenanceGraphTraverser } from '@visualstorytelling/provenance-core';
import { BookmarkService, Bookmark } from '../../shared/_services/bookmark.service';
import { ReflectionService, Reflection, REFLECTION_META } from '../../shared/_services/reflection.service';

interface NodeTooltipData {
  nodeId: string;
  bookmarks: Bookmark[];
  reflections: Reflection[];
  x: number;
  y: number;
}

interface BmOverlay {
  label: string;
  isPhase: boolean;
  x: number;
  y: number;
}

@Component({
  selector: 'app-provenance-visualization',
  template: `
    <!-- ── Bookmark / phase label overlays ─────────────────────────────── -->
    <div class="prov-bm-label"
         *ngFor="let bm of bmOverlays"
         [style.left.px]="bm.x"
         [style.top.px]="bm.y"
         [class.is-phase]="bm.isPhase">
      <mat-icon class="prov-bm-icon">{{ bm.isPhase ? 'flag' : 'bookmark' }}</mat-icon>
      <span class="prov-bm-text">{{ bm.label }}</span>
    </div>

    <!-- ── Empty-state overlay (shown until first action beyond root) ───── -->
    <div class="prov-empty" *ngIf="_isEmpty">
      <mat-icon class="prov-empty-icon">account_tree</mat-icon>
      <span class="prov-empty-title">No history yet</span>
      <span class="prov-empty-hint">Interact with the viewer to start building your exploration history — scroll slices, adjust W/L, place annotations.</span>
      <span class="prov-empty-keys">
        <kbd>B</kbd> bookmark &nbsp;·&nbsp; <kbd>R</kbd> reflect
      </span>
    </div>

    <!-- ── Current-phase badge ──────────────────────────────────────────── -->
    <div class="prov-phase-badge" *ngIf="currentPhase">
      <mat-icon class="prov-phase-icon">flag</mat-icon>
      {{ currentPhase }}
    </div>

    <!-- ── Node hover tooltip ───────────────────────────────────────────── -->
    <div class="prov-tooltip"
         *ngIf="tooltip"
         [style.top.px]="tooltip.y"
         [style.left.px]="tooltip.x"
         (mouseenter)="_tooltipHovered = true"
         (mouseleave)="_hideTooltip()">

      <div class="pt-section" *ngIf="tooltip.bookmarks.length > 0">
        <div class="pt-section-title">
          <mat-icon class="pt-icon bm-col">bookmark</mat-icon> Bookmarks
        </div>
        <div class="pt-row" *ngFor="let bm of tooltip.bookmarks">
          <mat-icon class="pt-row-icon" [class.phase-col]="bm.isPhase">
            {{ bm.isPhase ? 'flag' : 'bookmark' }}
          </mat-icon>
          <span class="pt-row-text">{{ bm.label }}</span>
        </div>
      </div>

      <div class="pt-section" *ngIf="tooltip.reflections.length > 0">
        <div class="pt-section-title">
          <mat-icon class="pt-icon ref-col">psychology</mat-icon> Reflections
        </div>
        <div class="pt-row" *ngFor="let r of tooltip.reflections">
          <mat-icon class="pt-row-icon" [style.color]="meta[r.type].color">{{ meta[r.type].icon }}</mat-icon>
          <span class="pt-row-text">{{ r.text }}</span>
        </div>
      </div>

      <div class="pt-empty"
           *ngIf="tooltip.bookmarks.length === 0 && tooltip.reflections.length === 0">
        No notes on this state.<br>
        <span class="pt-hint">Press <kbd>B</kbd> to bookmark · <kbd>R</kbd> to reflect.</span>
      </div>

    </div>
  `,
  styleUrls: ['./provenance-visualization.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ProvenanceVisualizationComponent implements OnInit, AfterViewInit, OnDestroy {
  private _viz: ProvenanceTreeVisualization;

  /** Positions + labels of all bookmarked/phase nodes, re-computed after every tree render. */
  bmOverlays: BmOverlay[] = [];

  /** Label of the most-recent phase bookmark on the current provenance path. */
  currentPhase: string | null = null;

  tooltip: NodeTooltipData | null = null;
  _tooltipHovered = false;
  readonly meta = REFLECTION_META;

  get _isEmpty(): boolean {
    const g = this.provenance.graph;
    if (!g) { return true; }
    const root = g.root as any;
    return !root || !root.children || root.children.length === 0;
  }

  private _hideTimer: any;
  private _observer: MutationObserver;
  private _resizeObserver: any;
  private _bmSub: Subscription;
  private _rfSub: Subscription;
  private _lastWidth = 0;
  private _svgObserveRetries = 0;
  private _boundGraph: any = null;
  private _nodeAddedHandler: (() => void) | null = null;

  constructor(
    private elementRef: ElementRef,
    private provenance: ProvenanceService,
    private bookmarkService: BookmarkService,
    private reflectionService: ReflectionService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Register with service so newProvenanceGraph() can rewire the viz
    this.provenance.tree = this;
    this._viz = this._createViz(this.provenance.traverser);
    this._bindListener();

    this._bmSub = this.bookmarkService.bookmarks$.subscribe(() => {
      this._refreshOverlays();
      this._refreshCurrentPhase();
    });
    this._rfSub = this.reflectionService.reflections$.subscribe(() => this._refreshOverlays());
  }

  ngAfterViewInit() {
    const host = this.elementRef.nativeElement as HTMLElement;

    this._observer = new MutationObserver(() => {
      this._refreshOverlays();
      this._refreshCurrentPhase();
    });
    this._tryObserveSvg();

    this._resizeObserver = new (window as any).ResizeObserver((entries: any[]) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0 && w !== this._lastWidth) {
        this._forceTreeRedraw();
      }
      this._lastWidth = w;
    });
    this._resizeObserver.observe(host);
  }

  ngOnDestroy() {
    this._observer?.disconnect();
    this._resizeObserver?.disconnect();
    this._bmSub?.unsubscribe();
    this._rfSub?.unsubscribe();
    this._unbindListener();
    clearTimeout(this._hideTimer);
    if (this.provenance.tree === this) { this.provenance.tree = null; }
  }

  /** Called by ProvenanceService.newProvenanceGraph() to rewire after graph reset. */
  rewire(traverser: ProvenanceGraphTraverser) {
    this._unbindListener();
    try { (this._viz as any)?.free?.(); } catch (_) {}
    this._viz = this._createViz(traverser);
    this._bindListener();
    // Disconnect observer from the old SVG and re-attach to the new one
    this._observer?.disconnect();
    this._svgObserveRetries = 0;
    this._tryObserveSvg();
    try { (this._viz as any).update(); } catch (_) {}
  }

  refresh() { this._forceTreeRedraw(); }

  createTree(traverser: ProvenanceGraphTraverser): ProvenanceTreeVisualization {
    this._viz = this._createViz(traverser);
    return this._viz;
  }

  getElement() { return this.elementRef; }

  // ── Private ───────────────────────────────────────────────────────────────

  private _createViz(traverser: ProvenanceGraphTraverser): ProvenanceTreeVisualization {
    return new ProvenanceTreeVisualization(
      traverser,
      this.elementRef.nativeElement,
      'ProvGraph',
    );
  }

  private _unbindListener() {
    if (this._boundGraph && this._nodeAddedHandler) {
      this._boundGraph.off('nodeAdded', this._nodeAddedHandler);
    }
    this._boundGraph = null;
    this._nodeAddedHandler = null;
  }

  /** Bind the nodeAdded handler to the current graph. Skip if already bound to this graph. */
  private _bindListener() {
    this._unbindListener();
    const g = this.provenance.graph;
    if (!g) { return; }
    this._boundGraph = g;
    this._nodeAddedHandler = () => this.cdr.detectChanges();
    g.on('nodeAdded', this._nodeAddedHandler);
  }

  private _tryObserveSvg() {
    const host = this.elementRef.nativeElement as HTMLElement;
    const svg = host.querySelector('svg');
    if (svg) {
      this._observer.observe(svg, { childList: true, subtree: true });
    } else if (this._svgObserveRetries < 20) {
      this._svgObserveRetries++;
      setTimeout(() => this._tryObserveSvg(), 200);
    }
  }

  private _forceTreeRedraw() {
    const host = this.elementRef.nativeElement as HTMLElement;
    const w = host.offsetWidth;
    const h = host.offsetHeight;

    if (this._viz) {
      try { (this._viz as any).update(); } catch (_) {}
      try { (this._viz as any).resize(); } catch (_) {}
    }

    const svg = host.querySelector('svg');
    if (svg && w > 0) {
      svg.setAttribute('width', String(w));
      if (h > 0) { svg.setAttribute('height', String(h)); }
    }

    this._refreshOverlays();
    this._refreshCurrentPhase();
  }

  private _refreshOverlays() {
    const host = this.elementRef.nativeElement as HTMLElement;
    const hostRect = host.getBoundingClientRect();
    const bookmarks = this.bookmarkService.getAll();
    const reflections = this.reflectionService.getAll();
    const bmIds = new Set(bookmarks.map(b => b.nodeId));
    const rfIds = new Set(reflections.map(r => r.nodeId));

    const overlays: BmOverlay[] = [];

    host.querySelectorAll('.node').forEach(nodeEl => {
      const id = this._nodeIdFrom(nodeEl as Element);
      if (!id) { return; }

      nodeEl.classList.toggle('prov-has-note', bmIds.has(id));
      nodeEl.classList.toggle('prov-has-reflection', rfIds.has(id));

      const bms = bookmarks.filter(b => b.nodeId === id);
      bms.forEach(bm => {
        const circle = nodeEl.querySelector('circle') as SVGElement;
        if (!circle) { return; }
        const r = circle.getBoundingClientRect();
        overlays.push({
          label: bm.label,
          isPhase: bm.isPhase,
          x: r.left - hostRect.left + r.width + 4,
          y: r.top  - hostRect.top  - 8,
        });
      });
    });

    this.bmOverlays = overlays;
    this.cdr.detectChanges();
  }

  private _refreshCurrentPhase() {
    const g = this.provenance.graph;
    if (!g || !g.current) { this.currentPhase = null; return; }

    const phases = this.bookmarkService.getAll().filter(b => b.isPhase);
    if (!phases.length) { this.currentPhase = null; return; }

    const path: string[] = [];
    let node: any = g.current;
    while (node) {
      if (node.id) { path.unshift(node.id); }
      node = node.parent;
    }

    let found: string | null = null;
    for (const id of path) {
      const phase = phases.find(b => b.nodeId === id);
      if (phase) { found = phase.label; }
    }
    this.currentPhase = found;
    this.cdr.detectChanges();
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const nodeEl = this._findNodeEl(event.target as Element);
    if (!nodeEl) { return; }
    const nodeId = this._nodeIdFrom(nodeEl);
    if (!nodeId) { return; }

    clearTimeout(this._hideTimer);
    this._tooltipHovered = false;

    const host = this.elementRef.nativeElement as HTMLElement;
    const hostRect = host.getBoundingClientRect();
    const elRect = nodeEl.getBoundingClientRect();

    const rawX = elRect.left - hostRect.left + elRect.width / 2;
    const rawY = elRect.top  - hostRect.top  + elRect.height + 4;
    const tooltipW = 260;
    const x = Math.min(rawX, hostRect.width - tooltipW - 4);
    const y = Math.min(rawY, hostRect.height - 120);

    this.tooltip = {
      nodeId,
      bookmarks:   this.bookmarkService.getAll().filter(b => b.nodeId === nodeId),
      reflections: this.reflectionService.getForNode(nodeId),
      x: Math.max(0, x),
      y: Math.max(0, y),
    };
    this.cdr.detectChanges();
  }

  @HostListener('mouseleave')
  onMouseLeave() { this._hideTooltip(); }

  _hideTooltip() {
    this._hideTimer = setTimeout(() => {
      if (!this._tooltipHovered) {
        this.tooltip = null;
        this.cdr.detectChanges();
      }
    }, 200);
  }

  // ── DOM helpers ───────────────────────────────────────────────────────────

  private _findNodeEl(el: Element | null): Element | null {
    while (el && el !== this.elementRef.nativeElement) {
      if (el.classList && el.classList.contains('node')) { return el; }
      el = el.parentElement;
    }
    return null;
  }

  private _nodeIdFrom(nodeEl: Element): string | null {
    const data = (nodeEl as any).__data__;
    if (data && data.id) { return data.id; }
    if (data && data.wrappedNodes && data.wrappedNodes[0]) {
      return data.wrappedNodes[0].id || null;
    }
    return null;
  }
}
