import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Bookmark {
  id: string;           // unique bookmark id
  nodeId: string;       // provenance graph node id
  label: string;        // user-assigned label
  isPhase: boolean;     // true = marks start of a named analysis phase
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class BookmarkService {
  private _bookmarks: Bookmark[] = [];
  bookmarks$ = new BehaviorSubject<Bookmark[]>([]);

  add(nodeId: string, label: string, isPhase = false): Bookmark {
    const bm: Bookmark = {
      id: `bm-${Date.now()}`,
      nodeId,
      label: label || `Bookmark ${this._bookmarks.length + 1}`,
      isPhase,
      timestamp: Date.now()
    };
    this._bookmarks = [...this._bookmarks, bm];
    this.bookmarks$.next(this._bookmarks);
    return bm;
  }

  remove(id: string) {
    this._bookmarks = this._bookmarks.filter(b => b.id !== id);
    this.bookmarks$.next(this._bookmarks);
  }

  updateLabel(id: string, label: string) {
    const bm = this._bookmarks.find(b => b.id === id);
    if (bm) {
      bm.label = label;
      this.bookmarks$.next([...this._bookmarks]);
    }
  }

  hasNode(nodeId: string): boolean {
    return this._bookmarks.some(b => b.nodeId === nodeId);
  }

  getAll(): Bookmark[] {
    return this._bookmarks;
  }

  reset() {
    this._bookmarks = [];
    this.bookmarks$.next([]);
  }
}
