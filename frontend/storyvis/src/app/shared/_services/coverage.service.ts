import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type SliceOrientation = 'axial' | 'coronal' | 'sagittal';

@Injectable({ providedIn: 'root' })
export class CoverageService {
  private visited: Record<SliceOrientation, Set<number>> = {
    axial: new Set(), coronal: new Set(), sagittal: new Set()
  };
  private _max: Record<SliceOrientation, number> = {
    axial: 1, coronal: 1, sagittal: 1
  };

  /** Fires whenever any visit is recorded — subscribe to trigger UI updates. */
  private _change = new Subject<void>();
  readonly change$ = this._change.asObservable();

  recordVisit(orientation: SliceOrientation, index: number) {
    this.visited[orientation].add(Math.round(index));
    this._change.next();
  }

  setMax(orientation: SliceOrientation, max: number) {
    this._max[orientation] = Math.max(1, max);
    this._change.next();
  }

  getCoverage(orientation: SliceOrientation): number {
    if (this._max[orientation] <= 1) { return 0; }
    return Math.min(1, this.visited[orientation].size / (this._max[orientation] - 1));
  }

  getCoveragePercent(orientation: SliceOrientation): number {
    return Math.round(this.getCoverage(orientation) * 100);
  }

  getVisitedCount(orientation: SliceOrientation): number {
    return this.visited[orientation].size;
  }

  getVisited(orientation: SliceOrientation): Set<number> {
    return this.visited[orientation];
  }

  getMax(orientation: SliceOrientation): number {
    return this._max[orientation];
  }

  /**
   * Returns an array of `n` boolean buckets — true if at least one slice
   * in that segment has been visited. Used to render the heatmap strip.
   */
  getSegments(orientation: SliceOrientation, n = 20): boolean[] {
    const max = this._max[orientation];
    const segs = new Array<boolean>(n).fill(false);
    if (max <= 1) { return segs; }
    this.visited[orientation].forEach(idx => {
      const bucket = Math.min(n - 1, Math.floor((idx / max) * n));
      segs[bucket] = true;
    });
    return segs;
  }

  reset() {
    this.visited = { axial: new Set(), coronal: new Set(), sagittal: new Set() };
    this._change.next();
  }
}
