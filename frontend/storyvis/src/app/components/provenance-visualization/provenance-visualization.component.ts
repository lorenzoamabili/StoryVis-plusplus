import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef,
  HostListener, OnDestroy, OnInit, ViewEncapsulation,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ProvenanceService, AuthenticationService } from '../../shared/_services';
import { ProvenanceTreeVisualization } from '@visualstorytelling/provenance-tree-visualization';
import { BookmarkService, Bookmark } from '../../shared/_services/bookmark.service';
import { ReflectionService, Reflection, REFLECTION_META } from '../../shared/_services/reflection.service';
import { User } from 'src/app/shared/_models';

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
  public _viz: ProvenanceTreeVisualization;
  public currentUser: User;

  /** Positions + labels of all bookmarked/phase nodes, re-computed after every tree render. */
  bmOverlays: BmOverlay[] = [];

  /** Label of the most-recent phase bookmark on the current provenance path. */
  currentPhase: string | null = null;

  tooltip: NodeTooltipData | null = null;
  _tooltipHovered = false;
  readonly meta = REFLECTION_META;

  private _hideTimer: any;
  private _observer: MutationObserver;
  private _bmSub: Subscription;
  private _rfSub: Subscription;

  constructor(
    public elementRef: ElementRef,
    public provenance: ProvenanceService,
    private authenticationService: AuthenticationService,
    private bookmarkService: BookmarkService,
    private reflectionService: ReflectionService,
    private cdr: ChangeDetectorRef,
  ) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    (window as any).tree = this;
    this.createTree(this.provenance.traverser);

    this._bmSub = this.bookmarkService.bookmarks$.subscribe(() => {
      this._refreshOverlays();
      this._refreshCurrentPhase();
    });
    this._rfSub = this.reflectionService.reflections$.subscribe(() => this._refreshOverlays());
  }

  ngAfterViewInit() {
    // Watch for D3 tree re-renders so overlays stay in sync
    this._observer = new MutationObserver(() => {
      this._refreshOverlays();
      this._refreshCurrentPhase();
    });
    const host = this.elementRef.nativeElement as HTMLElement;
    // Observe the SVG subtree once it appears
    const tryObserve = () => {
      const svg = host.querySelector('svg');
      if (svg) {
        this._observer.observe(svg, { childList: true, subtree: true });
      } else {
        setTimeout(tryObserve, 200);
      }
    };
    tryObserve();
  }

  ngOnDestroy() {
    this._observer?.disconnect();
    this._bmSub?.unsubscribe();
    this._rfSub?.unsubscribe();
    clearTimeout(this._hideTimer);
  }

  createTree(traverser) {
    return this._viz = new ProvenanceTreeVisualization(
      traverser,
      this.elementRef.nativeElement,
      'ProvGraph',
    );
  }

  public getElement(): any { return this.elementRef; }

  // ── Overlays: bookmark/phase labels rendered as HTML above the SVG ────────

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

      // CSS class markers (keep for ring styling)
      nodeEl.classList.toggle('prov-has-note', bmIds.has(id));
      nodeEl.classList.toggle('prov-has-reflection', rfIds.has(id));

      // HTML label overlay for bookmarks
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
    // Walk from current node back to root; find the most-recent phase bookmark
    const g = this.provenance.graph;
    if (!g || !g.current) { this.currentPhase = null; return; }

    const phases = this.bookmarkService.getAll().filter(b => b.isPhase);
    if (!phases.length) { this.currentPhase = null; return; }

    // Collect the id path from root → current
    const path: string[] = [];
    let node: any = g.current;
    while (node) {
      if (node.id) { path.unshift(node.id); }
      node = node.parent;
    }

    // Find the last phase bookmark whose nodeId appears in the path
    let found: string | null = null;
    for (const id of path) {
      const phase = phases.find(b => b.nodeId === id);
      if (phase) { found = phase.label; }
    }
    this.currentPhase = found;
    this.cdr.detectChanges();
  }

  // ── Tooltip on node hover ─────────────────────────────────────────────────

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: MouseEvent) {
    const nodeEl = this._findNodeEl(event.target as Element);
    if (!nodeEl) { return; }
    const nodeId = this._nodeIdFrom(nodeEl);
    if (!nodeId) { return; }

    clearTimeout(this._hideTimer);
    this._tooltipHovered = false;

    const hostRect = (this.elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    const elRect = nodeEl.getBoundingClientRect();
    this.tooltip = {
      nodeId,
      bookmarks:   this.bookmarkService.getAll().filter(b => b.nodeId === nodeId),
      reflections: this.reflectionService.getForNode(nodeId),
      x: elRect.left - hostRect.left + elRect.width / 2,
      y: elRect.top  - hostRect.top  + elRect.height + 4,
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

  // ── Helpers ───────────────────────────────────────────────────────────────

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
